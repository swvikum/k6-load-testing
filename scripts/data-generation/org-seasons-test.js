import http from 'k6/http';
import { sleep } from 'k6';

/******************************************************************
 # FILES REQUIRED TO PROVIDE CA FOR SIT DATA INJECTION #
1) Retrieve generated Games IN Perftest and save in input-games-data.json => org. 
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
return DISTINCT {ORG_ID:o.id} limit 3000;

2) Run with output file
 k6 run .\scripts\k6\data-load-ca\phq-ca-data-migration\org-seasons-test.js --logformat=raw --console-output=.\scripts\k6\data-load-ca\phq-ca-data-migration\results\org_seasons.json
*******************************************************************/

const jsonData = JSON.parse(open('input-games-data.json'));
const JSON_DATA_COUNT = jsonData.org.length;
const seasonIDs = jsonData.org.map(item => item.ORG_ID);

export let options = {
    vus: 1,
    iterations: 1,
};

export default function () {

    let dataAll = [];
    seasonIDs.forEach(element => {

        const url = 'https://localhost/v1/organisations/' + element + '/seasons';
        const headers = {
            'Content-Type': 'application/json',
            'x-phq-tenant': 'ca',
            'x-api-key': 'ca',
        };
        // Send GET request to the API
        let response = http.get(url, { headers: headers });

        // Check response status
        if (response.status === 200) {
            // Parse the response JSON
            let requiredDATA = JSON.parse(response.body).data;
            //let requiredDATA = gameData.data
            //console.log(`${JSON.stringify(requiredDATA)}`);

            requiredDATA.map(season => {
                let extractedSet = {
                    id: season.id,
                    name: season.name,
                    status: season.status,
                    association: {
                        id: season.association.id,
                        name: season.association.name,
                        type: null,
                        logoName: null,
                        nickname: null
                    },
                    competition: {
                        id: season.competition.id,
                        name: season.competition.name
                    }
                };

                dataAll.push(JSON.stringify(extractedSet));
            });
        } else {
            console.error(`Failed to retrieve game data. Status code: ${response.status}`);
        }
    });
    sleep(1);
    console.log(`[${dataAll}]`);
}

export function teardown() {

}