import http from "k6/http";
import { sleep, check } from "k6";
import { Counter } from "k6/metrics";
import { performCheck, get_headers_api } from "../config/common.js"
import { getScoresAPIUrl } from "../config/config.js"
import { setup_ramp, setup_ramp_two_scenarios } from "../config/util.js";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.0.0/index.js";

/**
k6 run -e DURATION=10s,15s,5s -e TARGET=10,10,0 .\scripts\k6\rest-api\scoresapi-match-summary\scores-match-summary-scenario-test.js -e DATACOUNT=1000
## CLOUD EXECUTION ##
1) k6 login cloud --token ***************
2) k6 cloud -e DURATION=10m,15m,5m -e TARGET=1,1,0 .\scripts\k6\rest-api\scoresapi-match-summary\scores-match-summary-scenario-test.js  -e DATACOUNT=1000
**/

const URL = getScoresAPIUrl();
const data = JSON.parse(open("scores-match-summary-data.json"));

const JSON_DATA_COUNT = data.score.length;
// This is to specify game count where scorecard test is executing. So this API consume Scorecard games and simulate APP behavior while live scoring happening.
const dataCount = (__ENV.DATACOUNT && __ENV.DATACOUNT <= JSON_DATA_COUNT)
    ? __ENV.DATACOUNT : JSON_DATA_COUNT;

let total_requests = new Counter("total_requests");

export const options = setup_ramp_two_scenarios('single-match-summary');

export function scenrio1() {
    let random = (Math.floor(Math.random() * dataCount));
    let matchId = data.score[random].MatchGuid;
    const headers = get_headers_api();

    let response = http.get(URL + "/matches/" + matchId,
        { headers: headers, tags: { name: 'match-summary-excludingscorecard' } });

    //console.log(`Response : ${JSON.stringify(response.body)}`);
    performCheck(response, 'match summary excludingscorecard', check);
    total_requests.add(1);
    sleep(randomIntBetween(2, 4));
}

export function scenrio2() {
    let random = (Math.floor(Math.random() * dataCount));
    let matchId = data.score[random].MatchGuid;
    const headers = get_headers_api();

    let response = http.get(URL + "/matches/" + matchId + "?ResponseModifier=IncludeScorecard",
        { headers: headers, tags: { name: 'match-summary-includingscorecard' } });

    //console.log(`Response : ${JSON.stringify(response.body)}`);
    performCheck(response, 'match summary includingscorecard', check);
    total_requests.add(1);
    sleep(randomIntBetween(2, 4));
}
