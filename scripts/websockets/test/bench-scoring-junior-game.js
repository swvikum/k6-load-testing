import http from "k6/http";
import { check, sleep } from "k6";
import { Trend } from "k6/metrics";
import { Counter } from "k6/metrics";
import ws from "k6/ws";
import {
  randomIntBetween,
  uuidv4
} from "https://jslib.k6.io/k6-utils/1.0.0/index.js";
import { bench_scoring_options } from "../main/get-options.js";
import {
  client_mode_update,
  lineup_payload,
  game_event_log,
  game_type_setting_payload,
  coin_toss_payload,
  batter_start_payload,
  bowler_start_payload,
  start_innings_payload,
  ball_payload,
  endover_payload,
  removeevent_payload,
  batter_swap_payload,
  retired_payload,
  wicket_payload
} from "../main/get-socket-payload.js";
import { getTokenScoring, getTokenFastBreak } from "../../common/get-token.js";
import { get_headers_bench, getSessionCreateData } from "../main/get-session-data.js";
import { setup_ramp } from "../../layup/support/shared.js";

var mutation_GetGames = "query getGame($id: ID!, $gameStatisticsFilter: GameStatisticsFilter!) {\n  game(id: $id) {\n    ...GameDetails\n    __typename\n  }\n}\n\nfragment GameDetails on Game {\n  id\n  resultSource\n  resultPublishedAt\n  away {\n    ... on Team {\n      id\n      name\n      playerPointsCap\n      __typename\n    }\n    ... on ProvisionalTeam {\n      name\n      __typename\n    }\n    __typename\n  }\n  home {\n    ... on Team {\n      id\n      name\n      playerPointsCap\n      __typename\n    }\n    ... on ProvisionalTeam {\n      name\n      __typename\n    }\n    __typename\n  }\n  code\n  statistics {\n    home {\n      ...GameTeamStats\n      __typename\n    }\n    away {\n      ...GameTeamStats\n      __typename\n    }\n    shared {\n      period {\n        label\n        shortName\n        value\n        __typename\n      }\n      type\n      players {\n        playerID\n        role\n        teamID\n        __typename\n      }\n      dismissalType\n      statistics {\n        type {\n          label\n          shortName\n          value\n          pointValue\n          applicableTo\n          __typename\n        }\n        count\n        __typename\n      }\n      side\n      displayOrder\n      __typename\n    }\n    __typename\n  }\n  hasOvertime\n  startDateTime\n  endDateTime\n  grade {\n    id\n    name\n    gameStatisticsConfiguration {\n      gameStatistics(filter: $gameStatisticsFilter) {\n        type\n        value\n        legacyValue\n        pointValue\n        applicableTo\n        required\n        max\n        adminVisible\n        publicVisible\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  teams {\n    home {\n      ...GameDetailsTeam\n      __typename\n    }\n    away {\n      ...GameDetailsTeam\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment GameTeamStats on GameTeamStatistics {\n  statistics {\n    type {\n      value\n      __typename\n    }\n    count\n    __typename\n  }\n  __typename\n}\n\nfragment GameDetailsTeam on GameTeam {\n  lineup {\n    players {\n      participant {\n        ... on Node {\n          id\n          __typename\n        }\n        ... on Participant {\n          profile {\n            id\n            firstName\n            lastName\n            __typename\n          }\n          permit {\n            id\n            startDate\n            endDate\n            __typename\n          }\n          __typename\n        }\n        ... on ParticipantFillInPlayer {\n          participant {\n            id\n            profile {\n              id\n              firstName\n              lastName\n              __typename\n            }\n            permit {\n              id\n              startDate\n              endDate\n              __typename\n            }\n            __typename\n          }\n          __typename\n        }\n        ... on GamePermitFillInPlayer {\n          profile {\n            id\n            firstName\n            lastName\n            __typename\n          }\n          __typename\n        }\n        ... on RegularFillInPlayer {\n          firstName\n          lastName\n          __typename\n        }\n        __typename\n      }\n    }\n  }\n}\n"

/* INSTRUCTIONS
 k6 run -e DURATION=10m,15m,5m -e TARGET=100,100,0 .\scripts\k6\live-scoring-ca\test\bench-scoring.js --logformat=raw --console-output=.\scripts\k6\live-scoring-ca\data\scoringevents.json

match (g:Game)<-[:PLAYING_IN]-(t:Team)<-[:PLAYS_IN]-(part:Participant)
where g.provisionalDate >= '2022-03-12'
    and datetime(g.provisionalDate).dayOfWeek = 6
    and g.status IS NULL
    return DISTINCT {GAME_ID: g.id} limit 1000;

restructure scoringevents.json and run webhook-evaluator.js to create report
*/
var homelineup_events = new Counter("homelineupevents");
var awaylineup_events = new Counter("awaylineupevents");
var gamesetting_events = new Counter("gamesettingevents");
var cointoss_events = new Counter("cointossevents");
var batterstart_events = new Counter("battterstartevents");
var bowlerstart_events = new Counter("bowlerstartevents");
var inningstart_events = new Counter("inningstartevents");
var bowling_events = new Counter("ballingevents");
var endover_events = new Counter("endoverevents");
var remove_events = new Counter("removeevents");
var batterswapstrike_events = new Counter("batterswapstrikeevents");
var retired_events = new Counter("retiredevents");
var wicket_events = new Counter("wicketevents");

const wssUrl = "wss://tip-off.perftest.com/";
const jsonData = JSON.parse(open("./../data/games-ca-perftest.json"));
const baseUrl = "https://localhost/graphql";

let battingTeamSize = 11; //randomIntBetween(6, 11);

const params = {
  headers: {
    Origin: "https://localhost:7070"
  }
};

export let options = setup_ramp("live-scoring-ca");

export function setup() {
  var tokenScore = getTokenScoring(http, check);

  return {
    tokenScore: tokenScore,
  };

}

export default function (data) {

  const me = __VU - 1;
  let gameStartIndex = __ENV.STARTINDEX ? parseInt(__ENV.STARTINDEX) : 0; //when running higher VUs, tekton cannot handle load, so we split games to multiple taskruns 

  var gameID = jsonData[me + gameStartIndex].GAME_ID;
  //console.log("gameID : " + gameID);
  var tokenFastBreak = getTokenFastBreak(http, check);
  //console.log("tokenFastBreak :: " + tokenFastBreak);

  //calling getGame graphQL from fastbreak to retrieve teamIds and playerIds
  let headers = {
    authorization: "Bearer " + tokenFastBreak
  };
  headers["Content-Type"] = "application/json";
  headers["x-organisation-id"] = "da1cdd76-7a0b-4db6-bcff-132c338c5901";

  var requestVariables = {
    "id": gameID,
    "gameStatisticsFilter": {
      "classification": "TOTAL"
    }
  };

  headers['Origin'] = 'https://localhost.com'; //playmaker api
  const getGameResponse = http.post(baseUrl, JSON.stringify({
    operationName: "getGame",
    query: mutation_GetGames,
    variables: requestVariables
  }), {
    headers: headers,
    tags: {
      requestName: "getGame"
    }
  });

  if (
    !check(getGameResponse, {
      "getGameResponse has no errors": r =>
        r &&
        r.status &&
        r.status === 200 &&
        r.body &&
        JSON.parse(r.body) &&
        JSON.parse(r.body).errors === undefined
    })
  ) {
    console.error(`Error! getGameResponse :: ${JSON.parse(JSON.stringify(getGameResponse.body))}`)
  }

  var gameResponse = JSON.parse(getGameResponse.body);

  let homeTeamPlayers = gameResponse.data.game.teams.home.lineup.players.map(s => s.participant.id).splice(0, battingTeamSize);
  let awayTeamPlayers = gameResponse.data.game.teams.away.lineup.players.map(s => s.participant.id).splice(0, battingTeamSize);


  let team = [];
  team.push(gameResponse.data.game.home.id);
  team.push(gameResponse.data.game.away.id);

  //console.log("home players ::" + homeTeamPlayers + "  away players  ::" + awayTeamPlayers);
  // console.log("home team ::" + team[0] + "  away team  ::" + team[1]);
  let side = ["HOME", "AWAY"];
  let possibleRuns = [0, 1, 2, 3, 4, 5, 6];

  const url = `${wssUrl}?authorization=Bearer+${data.tokenScore}&sessionID=${gameID}&gameID=${gameID}&version=2`;
  console.debug("connecting to websocket", { gameID, url })

  sleep(Math.random() * 2);

  var res = ws.connect(url, params, function (socket) {

    socket.on("open", () => {

      //socket.send(JSON.stringify(client_mode_update())); //client mode update
      socket.send(JSON.stringify(game_event_log())); //game event log
      /*
    First event is triggered with all game event details such as
     game type settings, 
     lineup for home team,
     lineup for away team,
     cointoss,
     first batter starts, 
     second batter starts, 
     bowler starts, 
     start inning events.
    */
      var uuid = new Map();
      uuid.set("gamesetting", uuidv4());
      uuid.set("homelineup1", uuidv4());
      uuid.set("awaylineup1", uuidv4());
      uuid.set("cointoss", uuidv4());
      uuid.set("homelineup2", uuidv4());
      uuid.set("awaylineup2", uuidv4());
      uuid.set("startinnings", uuidv4());
      uuid.set("batterstart1", uuidv4());
      uuid.set("batterstart2", uuidv4());
      uuid.set("bowlerstart", uuidv4());
      let timestamp = Date.now();
      //event payload consists with game type setting event and homelineup event
      socket.send(JSON.stringify(game_type_setting_payload(uuid, timestamp, team, side, homeTeamPlayers, awayTeamPlayers)));
      console.log(`${JSON.stringify({ "uuid": uuid.get("gamesetting"), "timestamp": timestamp, "eventType": "game_type_setting", "VU": __VU, "gameId": gameID })}`);
      gamesetting_events.add(1);
      homelineup_events.add(1);
      awaylineup_events.add(1);
      cointoss_events.add(1);
      inningstart_events.add(1);
      batterstart_events.add(2); //first & second batter
      bowlerstart_events.add(1);
      sleep(randomIntBetween(50, 70));

      // recurring event start {bowling}
      let totalBallCounter = 0;
      let totalExactbBallCounter = 0; //balls excluding removed events
      let strikeBatterIndex = 1;
      let currentBatters = [{ index: 0, balls: 0, isStrikeBatter: 0 }, { index: 1, balls: 0, isStrikeBatter: 1 }]
      let batterIndexes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      let currentPlayerIndex = [0, 1];
      let currentStrikeIndex;
      let currentBall = -1;
      let ballsPerBatter = Math.ceil(120 / battingTeamSize); //assuming T20 
      var randomBowlerIndex = 6;
      let randomWicketDenominator = randomIntBetween(12, 25);
      let randomRemoveEventtDenominator = randomIntBetween(13, 20);
      let randomSwapBatterDenominator = randomIntBetween(15, 30);
      let random;
      let point;
      socket.setInterval(function timeout() {
        random = Math.floor(Math.random() * possibleRuns.length);
        point = possibleRuns[random];
        //change strike batter based on runs
        if (point == 1 || point == 3 || point == 5) {
          currentBatters.map(ele => {
            if (ele.isStrikeBatter === 1) {
              currentStrikeIndex = currentBatters.indexOf(ele);
            }
          })
          currentBatters[currentStrikeIndex].isStrikeBatter = 0;
          if (currentStrikeIndex === 0) {
            currentBatters[1].isStrikeBatter = 1;
          } else if (currentStrikeIndex === 1) {
            currentBatters[0].isStrikeBatter = 1;
          }
        }

        //endover and bowler start after six balls
        currentBall++;
        if (currentBall === 6) {
          //change strike batter after end of over
          currentBatters.map(ele => {
            if (ele.isStrikeBatter === 1) {
              currentStrikeIndex = currentBatters.indexOf(ele);
            }
          })
          currentBatters[currentStrikeIndex].isStrikeBatter = 0;
          if (currentStrikeIndex === 0) {
            currentBatters[1].isStrikeBatter = 1;
          } else if (currentStrikeIndex === 1) {
            currentBatters[0].isStrikeBatter = 1;
          }
          //endover event
          randomBowlerIndex = Math.floor(Math.random() * 9) + 1;
          currentBall = 0;
          uuid.set("endover", uuidv4());
          uuid.set("bowlerstart", uuidv4());
          timestamp = Date.now();
          socket.send(
            JSON.stringify(endover_payload(uuid.get("endover"), timestamp))
          );
          //console.log(`${JSON.stringify({ "uuid": uuid.get("endover"), "timestamp": timestamp, "eventType": "endover", "VU": __VU, "gameId": gameID })}`);
          endover_events.add(1);
          sleep(randomIntBetween(15, 30));
          timestamp = Date.now();
          socket.send(
            JSON.stringify(bowler_start_payload(team[1], awayTeamPlayers[randomBowlerIndex], uuid.get("bowlerstart"), timestamp))
          );
          console.log(`${JSON.stringify({ "uuid": uuid.get("bowlerstart"), "timestamp": timestamp, "eventType": "bowlerstart", "VU": __VU, "gameId": gameID })}`);
          bowlerstart_events.add(1);
          sleep(randomIntBetween(20, 40));
        }

        //bowling event fire with wicket after certain balls
        uuid.set("bowling", uuidv4());
        if (totalBallCounter % randomWicketDenominator == 0 && totalBallCounter != 0) {
          currentBatters.map(ele => {
            if (ele.isStrikeBatter === 1) {
              currentStrikeIndex = currentBatters.indexOf(ele);
              timestamp = Date.now();
              socket.send(
                JSON.stringify(wicket_payload(homeTeamPlayers[currentStrikeIndex], uuid.get("bowling"), timestamp))
              );
              console.log(`${JSON.stringify({ "uuid": uuid.get("bowling"), "timestamp": timestamp, "eventType": "bowling(wicket)", "VU": __VU, "gameId": gameID })}`);
              wicket_events.add(1);
            }
          })
        } else {
          currentBatters.map(ele => {
            if (ele.isStrikeBatter === 1) {
              currentStrikeIndex = currentBatters.indexOf(ele);
              timestamp = Date.now();
              socket.send(
                JSON.stringify(ball_payload(point, uuid.get("bowling"), timestamp))
              );
              console.log(`${JSON.stringify({ "uuid": uuid.get("bowling"), "timestamp": timestamp, "eventType": "bowling", "VU": __VU, "gameId": gameID })}`);
              bowling_events.add(1);
            }
          })
        }

        totalBallCounter++;
        totalExactbBallCounter++;
        currentBatters.map(ele => {
          if (ele.isStrikeBatter === 1) {
            ele.balls++;
          }
        })
        //remove event and reset ball counter
        if (totalBallCounter % randomRemoveEventtDenominator == 0) {
          sleep(randomIntBetween(2, 4));
          uuid.set("removeevent", uuidv4());
          timestamp = Date.now();
          socket.send(
            JSON.stringify(removeevent_payload(uuid.get("removeevent"), timestamp, uuid.get("bowling")))
          );
          console.log(`${JSON.stringify({ "uuid": uuid.get("removeevent"), "timestamp": timestamp, "eventType": "removeevent", "VU": __VU, "gameId": gameID })}`);
          remove_events.add(1);
          currentBall--;
          totalExactbBallCounter--;
          currentBatters.map(ele => {
            if (ele.isStrikeBatter === 1) {
              ele.balls--;
            }
          })
        }
        //swap strike batter
        if (totalExactbBallCounter % randomSwapBatterDenominator == 0) {
          sleep(randomIntBetween(2, 4));
          uuid.set("batterswapevent", uuidv4());
          timestamp = Date.now();
          socket.send(
            JSON.stringify(batter_swap_payload(uuid.get("batterswapevent"), timestamp))
          );
          console.log(`${JSON.stringify({ "uuid": uuid.get("batterswapevent"), "timestamp": timestamp, "eventType": "batterswapevent", "VU": __VU, "gameId": gameID })}`);
          batterswapstrike_events.add(1);
          currentBatters.map(ele => {
            if (ele.isStrikeBatter === 1) {
              currentStrikeIndex = currentBatters.indexOf(ele);
            }
          })
          currentBatters[currentStrikeIndex].isStrikeBatter = 0;
          if (currentStrikeIndex === 0) {
            currentBatters[1].isStrikeBatter = 1;
          } else if (currentStrikeIndex === 1) {
            currentBatters[0].isStrikeBatter = 1;
          }

        }

        //retire batman once reach to max balls
        currentBatters.map(ele => {
          if (ele.balls === ballsPerBatter) {
            sleep(randomIntBetween(4, 8));
            uuid.set("retiredevent", uuidv4());
            uuid.set("batterstart", uuidv4());
            timestamp = Date.now();
            strikeBatterIndex = ele.index;
            let nextBatterIndex;
            if (strikeBatterIndex != (battingTeamSize - 1)) {
              let remainingPlayers = batterIndexes.filter(x => !currentPlayerIndex.includes(x));
              nextBatterIndex = remainingPlayers[0];
            } else {
              nextBatterIndex = 0;
              currentPlayerIndex = [];
            }
            currentPlayerIndex.push(nextBatterIndex);
            socket.send(
              JSON.stringify(retired_payload(team[0], homeTeamPlayers[strikeBatterIndex], homeTeamPlayers[nextBatterIndex], uuid.get("retiredevent"), uuid.get("batterstart"), timestamp))
            );
            console.log(`${JSON.stringify({ "uuid": uuid.get("retiredevent"), "timestamp": timestamp, "eventType": "retiredevent", "VU": __VU, "gameId": gameID })}`);
            console.log(`${JSON.stringify({ "uuid": uuid.get("batterstart"), "timestamp": timestamp, "eventType": "batterstartevent", "VU": __VU, "gameId": gameID })}`);
            retired_events.add(1);
            batterstart_events.add(1);

            ele.index = nextBatterIndex;
            ele.balls = 0;
          }
        })
        sleep(randomIntBetween(20, 30));
      }, 1000);

    });

    socket.on('message', function message(data) {
      if (
        !check(JSON.parse(data).status, {
          STATUS: s => s === "SUCCESS"
        })
      ) {
        console.error(`Error! webhook_response: ${JSON.parse(JSON.stringify(data))}`)
      }
    });

    socket.on("close", () => {
      console.log("closed", me, gameID);
    });

    socket.on("error", error => {
      console.log("error", error.error());
    });

  });

  check(res, { 'event status is 101': (r) => r && r.status === 101 });

}


export function teardown(data) {
  //buffer to save logs from k8 pods for webhook-evaluation
  sleep(120);

}
