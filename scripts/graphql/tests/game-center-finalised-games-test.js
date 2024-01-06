
// k6 run --out influxdb=https://influxdb.k6.factory.com/gcfinalised game-center-finalised-games-test.js  -e DURATION=3m,3m,1m -e TARGET=5,20,0
/*Neo4J Query
MATCH (g:Game)<-[:HAS_GAME]-(r:Round)<-[:HAS_ROUND]-(grade:Grade)<-[:HAS_GRADE]-(cs:CompetitionSeason)<-[:HAS_SEASON]-(c:Competition)<-[:HOSTS]-(o:Organisation)
MATCH (t:Team)-[:ALLOCATED_TO]->(grade)
MATCH (t)<-[:PLAYS_IN]-(part:Participant)
WHERE g.provisionalDate < toString(date()) and g.status = "FINAL"
RETURN DISTINCT {
    GAME_ROUTING_CODE: g.routingCode
}
 limit 1000
*/

import http from "k6/http";
import { Counter } from "k6/metrics";
import { check, sleep } from "k6";
import { randomSeed } from 'k6';
import { getGameCenterDiscoveryGame, getGameView } from "../support/game-center-discovery-game.js";
import { player_number_disabled_tenant_config } from "../support/registration-page-3.js";
import { setup_ramp, getTenant, getBaseUrl, GetRandomIntInRange, randomIntBetween } from "../../common/util.js"

var number_of_gameCentrePageViews = new Counter("gameCentrePageViews");

export let options = setup_ramp("game center finalised games");

const tenant = getTenant();
const jsonData = JSON.parse(open('../data/game-center-finalised-games-data.json'));
const JSON_DATA_COUNT = jsonData[tenant].length;

export default function () {

  //this is done within the default function so that every iteration of the test will use a random gameId
  let seedController = __ITER % 20;
  randomSeed(__VU + "" + seedController);
  const random = GetRandomIntInRange(JSON_DATA_COUNT);
  const gameId = jsonData[tenant][random].GAME_ROUTING_CODE;
  let headers = {};
  headers["content-type"] = "application/json";
  headers['tenant'] = tenant;
  headers["Origin"] = "https://www.perftest.com";

  getGameCenterDiscoveryGame(http, check, getBaseUrl(), headers, gameId)
  player_number_disabled_tenant_config(http, check, headers, getBaseUrl())
  getGameView(http, check, getBaseUrl(), headers, gameId);
  number_of_gameCentrePageViews.add(1);
  sleep(randomIntBetween(1300, 4000) / 1000);
}
