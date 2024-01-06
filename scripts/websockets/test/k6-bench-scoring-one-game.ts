import http from "k6/http"
import {check, fail, sleep} from "k6"
import {Counter} from "k6/metrics"
import ws from "k6/ws"
import {randomIntBetween, uuidv4} from "https://jslib.k6.io/k6-utils/1.0.0/index.js"
import {getTokenFastBreak, getTokenScoring} from "../../common/get-token";
import {setup_ramp} from "../../common/util"
import {
    getBallEvent,
    getBowlerStartEvent,
    getEndOverEvent,
    game_event_log,
    getCricketStartGameWebsocketPayload,
    getEventProcessPayload,
    getRemoveEvent
} from "../main/get-socket-payload";
import execution from "k6/execution";
import {EventType, GameEvents, RemoveEvent} from "@gameonsports/play-by-play";

const environment = __ENV.ENVIRONMENT || "perftest"
const tenant = __ENV.TENANT

const mutation_GetGames = "query getGame($id: ID!, $gameStatisticsFilter: GameStatisticsFilter!) {\n  game(id: $id) {\n    ...GameDetails\n    __typename\n  }\n}\n\nfragment GameDetails on Game {\n  id\n  resultSource\n  resultPublishedAt\n  away {\n    ... on Team {\n      id\n      name\n      playerPointsCap\n      __typename\n    }\n    ... on ProvisionalTeam {\n      name\n      __typename\n    }\n    __typename\n  }\n  home {\n    ... on Team {\n      id\n      name\n      playerPointsCap\n      __typename\n    }\n    ... on ProvisionalTeam {\n      name\n      __typename\n    }\n    __typename\n  }\n  code\n  statistics {\n    home {\n      ...GameTeamStats\n      __typename\n    }\n    away {\n      ...GameTeamStats\n      __typename\n    }\n    shared {\n      period {\n        label\n        shortName\n        value\n        __typename\n      }\n      type\n      players {\n        playerID\n        role\n        teamID\n        __typename\n      }\n      dismissalType\n      statistics {\n        type {\n          label\n          shortName\n          value\n          pointValue\n          applicableTo\n          __typename\n        }\n        count\n        __typename\n      }\n      side\n      displayOrder\n      __typename\n    }\n    __typename\n  }\n  hasOvertime\n  startDateTime\n  endDateTime\n  grade {\n    id\n    name\n    gameStatisticsConfiguration {\n      gameStatistics(filter: $gameStatisticsFilter) {\n        type\n        value\n        legacyValue\n        pointValue\n        applicableTo\n        required\n        max\n        adminVisible\n        publicVisible\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  teams {\n    home {\n      ...GameDetailsTeam\n      __typename\n    }\n    away {\n      ...GameDetailsTeam\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment GameTeamStats on GameTeamStatistics {\n  statistics {\n    type {\n      value\n      __typename\n    }\n    count\n    __typename\n  }\n  __typename\n}\n\nfragment GameDetailsTeam on GameTeam {\n  lineup {\n    players {\n      participant {\n        ... on Node {\n          id\n          __typename\n        }\n        ... on Participant {\n          profile {\n            id\n            firstName\n            lastName\n            __typename\n          }\n          permit {\n            id\n            startDate\n            endDate\n            __typename\n          }\n          __typename\n        }\n        ... on ParticipantFillInPlayer {\n          participant {\n            id\n            profile {\n              id\n              firstName\n              lastName\n              __typename\n            }\n            permit {\n              id\n              startDate\n              endDate\n              __typename\n            }\n            __typename\n          }\n          __typename\n        }\n        ... on GamePermitFillInPlayer {\n          profile {\n            id\n            firstName\n            lastName\n            __typename\n          }\n          __typename\n        }\n        ... on RegularFillInPlayer {\n          firstName\n          lastName\n          __typename\n        }\n        __typename\n      }\n    }\n  }\n}\n"

/* INSTRUCTIONS
 k6 run -e DURATION=10m,15m,5m -e TARGET=100,100,0 .\scripts\k6\live-scoring-ca\test\bench-scoring.js --logformat=raw --console-output=.\scripts\k6\live-scoring-ca\data\scoringevents.json

match (g:Game)<-[:PLAYING_IN]-(t:Team)<-[:PLAYS_IN]-(part:Participant)
where g.provisionalDate >= '2022-03-12'
    and datetime(g.provisionalDate).dayOfWeek = 6
    and g.status IS NULL
    return DISTINCT {GAME_ID: g.id} limit 1000

restructure scoringevents.json and run k6-webhook-evaluator.ts to create report

// For jatz
npm run build && k6 run dist/k6-bench-scoring.js --log-output stdout -e TENANT=bv -e ENVIRONMENT=jatz -e TESTING=1

*/
const homelineup_events = new Counter("homelineup-events");
const awaylineup_events = new Counter("awaylineup-events")
const gamesetting_events = new Counter("gamesetting-events")
const cointoss_events = new Counter("cointoss-events")
const firtbatter_events = new Counter("firstbatter-events")
const secondbatter_events = new Counter("secondbatter-events")
const bowlerstart_events = new Counter("bowlerstart-events")
const inningstart_events = new Counter("inningstart-events")
const bowling_events = new Counter("balling-events")
const endover_events = new Counter("endover-events")

const baseUrl = `https://api.${environment}.com/graphql`
const wssUrl = `wss://tip-off.${environment}.com/`
const filePath = `../scripts/k6/live-scoring-ca/data/games-${tenant}-${environment}.json`

// noinspection TypeScriptValidateTypes
const jsonData: [{ GAME_ID: string }] = JSON.parse(open(filePath))
if (!jsonData) {
    fail(`Could not load ${filePath}`)
}

interface SetupOutput {
    tokenFastbreak: string
    tokenScoring: string
    environment: string
    tenant: string
}

const params = {
    headers: {
        Origin: `https://${tenant}.score.${environment}.com`
    }
}

export let options = __ENV.TESTING ? {iterations: 1, vus: 1} : setup_ramp("live-scoring-ca")

export function setup(): SetupOutput {
    console.debug("Setting up test", {tenant, environment})
    if (!tenant || !environment) {
        fail("Missing environment variables")
    }

    const tokenScoring = getTokenScoring(environment, tenant)!
    const tokenFastbreak = getTokenFastBreak(environment, tenant)!

    return {
        tokenScoring,
        tokenFastbreak,
        environment,
        tenant
    }
}

export default function ({tokenScoring, tokenFastbreak, environment, tenant}: SetupOutput) {

    console.debug("Loaded JSON data", jsonData)

    const me = execution.vu.idInTest - 1
    const gameID = jsonData[me].GAME_ID

    if (!gameID) {
        console.error("No gameID for VU", {me})
        return
    }

    const getGameResponse = http.post(baseUrl, JSON.stringify({
        operationName: "getGame",
        query: mutation_GetGames,
        variables: {
            "id": gameID,
            "gameStatisticsFilter": {
                "classification": "TOTAL"
            }
        }
    }), {
        headers: {
            authorization: `Bearer ${tokenFastbreak}`,
            "Content-Type": "application/json",
            "x-organisation-id": environment === "jatz" ? "939386d7-aa70-402b-81bb-f43e959331a9" : "da1cdd76-7a0b-4db6-bcff-132c338c5901", //TODO: Make this work for other envs
            "Origin": `https://${tenant}.${environment}.com`,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36",
        },
        tags: {
            requestName: "getGame"
        }
    })

    console.debug({getGameResponse})

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

    const gameResponse = JSON.parse(getGameResponse.body) as {
        data: {
            game: {
                home: {
                    id: string
                },
                away: {
                    id: string
                }
                teams: {
                    home: {
                        lineup: {
                            players: {
                                participant: {
                                    id: string
                                }
                            }[]
                        }
                    },
                    away: {
                        lineup: {
                            players: {
                                participant: {
                                    id: string
                                }
                            }[]
                        }
                    }
                }
            }
        }
    }

    let homeTeamPlayers = gameResponse.data.game.teams.home.lineup.players.map(s => s.participant.id)
    let awayTeamPlayers = gameResponse.data.game.teams.away.lineup.players.map(s => s.participant.id)

    let team: string[] = []
    team.push(gameResponse.data.game.home.id)
    team.push(gameResponse.data.game.away.id)

    const side: ["HOME", "AWAY"] = ["HOME", "AWAY"]
    const possibleRuns = [0, 2, 4, 6]
    const url = `${wssUrl}?authorization=Bearer+${tokenScoring}&sessionID=${gameID}&gameID=${gameID}&version=2`
    console.debug("connecting to websocket", {gameID, url})
    // sleep(Math.random() * 2)

    const res = ws.connect(url, params, function (socket) {
        socket.on("open", () => {
            socket.send(JSON.stringify(game_event_log())) //game event log
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
            const uuid = new Map()
            uuid.set("gamesetting", uuidv4())
            uuid.set("homelineup1", uuidv4())
            uuid.set("awaylineup1", uuidv4())
            uuid.set("cointoss", uuidv4())
            uuid.set("homelineup2", uuidv4())
            uuid.set("awaylineup2", uuidv4())
            uuid.set("startinnings", uuidv4())
            uuid.set("batterstart1", uuidv4())
            uuid.set("batterstart2", uuidv4())
            uuid.set("bowlerstart", uuidv4())
            //event payload consists with game type setting event and homelineup event
            socket.send(JSON.stringify(getCricketStartGameWebsocketPayload(uuid, Date.now(), team, side, homeTeamPlayers, awayTeamPlayers)))
            // console.log(`${JSON.stringify({
            //     "uuid": uuid.get("gamesetting"),
            //     "timestamp": Date.now(),
            //     "eventType": "game_type_setting",
            //     "VU": __VU,
            //     "gameId": gameID
            // })}`)
            gamesetting_events.add(1)
            homelineup_events.add(1)
            awaylineup_events.add(1)
            cointoss_events.add(1)
            inningstart_events.add(1)
            firtbatter_events.add(1)
            secondbatter_events.add(1)
            bowlerstart_events.add(1)
            // sleep(randomIntBetween(3, 6))

            // recurring event start {bowling}
            let currentBall = 0
            let batchSize = 3
            let eventStack: GameEvents[] = []
            socket.setInterval(function timeout() {
                if (currentBall === 6) {
                    const randomBowlerIndex = Math.floor(Math.random() * awayTeamPlayers.length - 1) + 1
                    currentBall = 0
                    const endOverEvent = getEndOverEvent(uuidv4(), Date.now())
                    eventStack.push(endOverEvent)
                    //console.log(`${JSON.stringify({ "uuid": uuid.get("endover"), "timestamp": timestamp, "eventType": "endover", "VU": __VU, "gameId": gameID })}`)
                    endover_events.add(1)
                    // sleep(randomIntBetween(500, 1500) / 1000)

                    const bowlerStartEvent = getBowlerStartEvent(awayTeamPlayers[randomBowlerIndex], uuidv4(), Date.now())
                    eventStack.push(bowlerStartEvent)
                    console.log(`${JSON.stringify({
                        "uuid": bowlerStartEvent.id,
                        "timestamp": Date.now(),
                        "eventType": "bowlerstart",
                        "VU": __VU,
                        "gameId": gameID
                    })}`)
                    bowlerstart_events.add(1)
                    // sleep(randomIntBetween(2, 4))
                }

                const ballEvent = getBallEvent(possibleRuns[Math.floor(Math.random() * possibleRuns.length)], uuidv4(), Date.now())
                eventStack.push(ballEvent)

                console.log(`${JSON.stringify({
                    "uuid": ballEvent.id,
                    "timestamp": Date.now(),
                    "eventType": "bowling",
                    "VU": __VU,
                    "gameId": gameID
                })}`)

                bowling_events.add(1)
                currentBall++

                if (eventStack.length >= batchSize) {

                    for (let i = 0; i < eventStack.length; i += batchSize) {
                        const chunk = eventStack.slice(i, i + batchSize);
                        console.log("Sending batch", {size: chunk.length})
                        socket.send(JSON.stringify(getEventProcessPayload(chunk)
                        ))
                    }

                    const removeBatchSize = Math.floor(batchSize)

                    if(removeBatchSize > 0) {
                        const removeBatch: RemoveEvent[] = []
                        const eventsBeingRemoved: GameEvents[] = []
                        for (let i = 0; i < removeBatchSize; i += 1) {
                            const event = eventStack.pop()!
                            removeBatch.push(getRemoveEvent(event.id))
                            eventsBeingRemoved.push(getRemoveEvent(event.id))
                        }

                        const ballCount = eventsBeingRemoved.filter(e => e.type === EventType.Ball).length
                        currentBall = (currentBall - ballCount) % 6

                        console.log("Sending remove batch", {size: removeBatch.length})
                        socket.send(JSON.stringify(getEventProcessPayload(removeBatch)
                        ))
                    }

                    batchSize++
                    eventStack = []
                }


            }, 0.1 * 1000)

        })

        socket.on('message', function message(data) {
            check(JSON.parse(data).status, {
                STATUS: s => s === "SUCCESS"
            })
        })

        socket.on("close", () => {
            console.log("closed", me, gameID)
        })

        socket.on("error", error => {
            console.log("error", error)
        })

    })

    check(res, {'event status is 101': (r) => r && r.status === 101})

}


export function teardown(data) {
    sleep(120)
}
