import http from "k6/http";
import { sleep, check } from "k6";
import { Counter } from "k6/metrics";
import { performCheck, get_headers_api } from "../config/common.js"
import { getScoresAPIUrl } from "../config/config.js"
import { setup_ramp } from "../config/util.js";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.0.0/index.js";

/**
k6 run -e DURATION=10m,15m,5m -e TARGET=1,1,0 .\scripts\k6\rest-api\scoresapi-match-summary\scores-match-summary-includescorecard-test.js -e DATACOUNT=1000
## CLOUD EXECUTION ##
1) k6 login cloud --token ***************
2) k6 cloud -e DURATION=10m,15m,5m -e TARGET=1,1,0 .\scripts\k6\rest-api\scoresapi-match-summary\scores-match-summary-includescorecard-test.js  -e DATACOUNT=1000
**/

const URL = getScoresAPIUrl();
const data = JSON.parse(open("scores-match-summary-data.json"));

const JSON_DATA_COUNT = data.score.length;
// This is to specify game count where scorecard test is executing. So this API consume Scorecard games and simulate APP behavior while live scoring happening.
const dataCount = (__ENV.DATACOUNT && __ENV.DATACOUNT <= JSON_DATA_COUNT)
    ? __ENV.DATACOUNT : JSON_DATA_COUNT;  
    
let total_requests = new Counter("total_requests");

export let options = setup_ramp("single-match-summary");

export default function () {
    let random = (Math.floor(Math.random() * dataCount));
    let matchId = data.score[random].MatchGuid;
    const headers = get_headers_api();

    let response = http.get(URL + "/matches/" + matchId + "?ResponseModifier=IncludeScorecard",
        { headers: headers, tags: { name: 'match-summary-includingscorecard' } });

    //console.log(`Response : ${JSON.stringify(response.body)}`);
    performCheck(response, 'match summary', check);
    total_requests.add(1);
    sleep(randomIntBetween(2, 4));
}
