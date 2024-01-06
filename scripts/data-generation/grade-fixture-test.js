import http from 'k6/http';
import { sleep } from 'k6';

/******************************************************************
 # FILES REQUIRED TO PROVIDE CA FOR SIT DATA INJECTION #
1) Retrieve generated Games IN Perftest and save in input-games-data.json => grade. 
MATCH (g:Game)<-[:HAS_GAME]-(r:Round)<-[:HAS_ROUND]-(grade:Grade)<-[:HAS_GRADE]-(cs:CompetitionSeason)<-[:HAS_SEASON]-(c:Competition)<-[:HOSTS]-(o:Organisation)
where o.name in [
"CATestLive_20230713165_bhqf_Association" ,
"CATestLive_20230713149_q2s6i_Association",
"CATestLive_20230713130_tzvwj_Association",
"CATestLive_202307122240_civb_Association",
"CATestLive_202307122056_cq9m_Association",
"CATestLive_202307121852_4d6q_Association",
"CATestLive_202307121729_mces_Association",
"CATestLive_202307121542_4tpr_Association"]
return DISTINCT {GRADE_ID:grade.id} limit 3000;

2) Run with output file
 k6 run .\scripts\k6\data-load-ca\phq-ca-data-migration\grade-fixture-test.js --logformat=raw --console-output=.\scripts\k6\data-load-ca\phq-ca-data-migration\results\grade_fixture.json
*******************************************************************/
const jsonData = JSON.parse(open('input-games-data.json'));
const JSON_DATA_COUNT = jsonData.grade.length;
const seasonIDs = jsonData.grade.map(item => item.GRADE_ID);

export let options = {
    vus: 1,
    iterations: 1,
};

export default function () {

    let dataAll = [];
    seasonIDs.forEach(element => {
        //console.log(`${JSON.parse(JSON.stringify(element))}`);
        const url = 'https://localhost/v2/grades/' + element + '/games';
        const headers = {
            'Content-Type': 'application/json',
            'x-phq-tenant': 'ca',
            'x-api-key': 'ca',
        };

        // Send GET request to the API
        let response = http.get(url, { headers: headers });
        // console.log(`${JSON.parse(JSON.stringify(response.body))}`);
        // Check response status
        if (response.status === 200) {
            // Parse the response JSON
            let requiredDATA = JSON.parse(response.body);
            requiredDATA.gradeId = element;

            dataAll.push(JSON.stringify(requiredDATA));
        } else {
            console.error(`Failed to retrieve game data. Status code: ${response.status}`);
        }
    });
    sleep(1);
    console.log(`[${dataAll}]`);
}

export function teardown(dataAll) {

}