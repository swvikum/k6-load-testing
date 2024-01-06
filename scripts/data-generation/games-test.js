import http from 'k6/http';
import { sleep } from 'k6';

/******************************************************************
 # FILES REQUIRED TO PROVIDE CA FOR SIT DATA INJECTION #
1) Retrieve generated Games IN Perftest and save in input-games-data.json => games. 
MATCH (g:Game)<-[:HAS_GAME]-(r:Round)<-[:HAS_ROUND]-(grade:Grade)<-[:HAS_GRADE]-(cs:CompetitionSeason)<-[:HAS_SEASON]-(c:Competition)<-[:HOSTS]-(o:Organisation)
match (g:Game)<-[:PLAYING_IN {side:'HOME'}]-(t1:Team)<-[:PLAYS_IN]-(part1:Participant)
match (g)<-[:PLAYING_IN {side:'AWAY'}]-(t2:Team)<-[:PLAYS_IN]-(part2:Participant)
where o.name in [
"CATestLive_20230713165_bhqf_Association" ,
"CATestLive_20230713149_q2s6i_Association",
"CATestLive_20230713130_tzvwj_Association",
"CATestLive_202307122240_civb_Association",
"CATestLive_202307122056_cq9m_Association",
"CATestLive_202307121852_4d6q_Association",
"CATestLive_202307121729_mces_Association",
"CATestLive_202307121542_4tpr_Association"]
    with DISTINCT g.id as game_id,o.name as o_name,o.id as o_id, t1.id as home_team_id, t2.id as away_team_id, count(distinct part1.id) as home_team_mem_count, count(distinct part2.id) as away_team_mem_count
WHERE home_team_mem_count = 11 and away_team_mem_count = 11
return {GAME_ID:game_id} limit 3000;

2) Run with output file
k6 run .\scripts\k6\data-load-ca\phq-ca-data-migration\games-test.js --logformat=raw --console-output=.\scripts\k6\data-load-ca\phq-ca-data-migration\results\games_new.json
*******************************************************************/

const jsonData = JSON.parse(open('input-games-data.json'));
const JSON_DATA_COUNT = jsonData.games.length;
const gameIDs = jsonData.games.map(item => item.GAME_ID);

export let options = {
    vus: 1,
    iterations: 1,
};

export default function () {

    let gameDataFull = [];
    gameIDs.forEach(element => {
        const url = 'https://localhost/v1/games/' + element + '/summary';
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
            let gameData = JSON.parse(response.body);
            let requiredDATA = gameData.data

            // Save the game data to a JSON file

            gameDataFull.push(JSON.stringify(requiredDATA));
            //console.log(`${JSON.stringify(gameData)}`);
        } else {
            console.error(`Failed to retrieve game data. Status code: ${response.status} ID :${element} `);
        }
    });
    sleep(1);
    console.log(`[${gameDataFull}]`);
}

export function teardown() {

}