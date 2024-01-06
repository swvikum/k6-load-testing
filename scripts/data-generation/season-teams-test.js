import http from 'k6/http';
import { sleep } from 'k6';
import { check } from "k6";
/******************************************************************
 # FILES REQUIRED TO PROVIDE CA FOR SIT DATA INJECTION #
1) This script retrive all organisations for specified tenant

2) Run with output file
 k6 run .\scripts\k6\data-load-ca\phq-ca-data-migration\season-teams-updated.js  --logformat=raw --console-output=.\scripts\k6\data-load-ca\phq-ca-data-migration\results\season_teams.json
*******************************************************************/
const jsonData = JSON.parse(open('input-games-data.json'));
const JSON_DATA_COUNT = jsonData.org.length;
const orgIDs = jsonData.org.map(item => item.ORG_ID);

export function tokenGeneration() {
    let payload = JSON.stringify({
        clientId: "ca",
        clientSecret: "AKEtEReCaRNaPhtfIS"
    });
    let params = {
        headers: { 'Content-Type': 'application/json' },
        tags: {
            requestName: 'perftestAuthenticate'
        }
    };

    let get_token_res = http.post('https://localhost/auth', payload, params);
    check(get_token_res, { 'receive token successfully': (resp) => resp.body !== '' });
    let token = get_token_res.json().access_token;
    return token;
}

export default function () {

    let dataAll = [];
    orgIDs.forEach(element => {
        const url = 'https://localhost/v1/organisations/' + element + '/teams';
        const headers = {
            'Content-Type': 'application/json',
            'x-phq-tenant': 'ca',
            'x-api-key': 'ca',
            'Authorization': 'Bearer ' + tokenGeneration()
        };

        // Send GET request to the API
        let response = http.get(url, { headers });

        if (response.status === 200) {
            let requiredDATA = JSON.parse(response.body).data;
            // console.log(`${JSON.stringify(requiredDATA)}`);
            requiredDATA.map(team => {
                //console.log(`team ${JSON.stringify(team)}`);
                let extractedSet = {
                    id: team.id,
                    name: team.name,
                    grade: {
                        id: team.grade.id,
                        name: team.grade.name,
                        url: team.grade.url,
                        seasonId: team.season.id
                    }
                };
                if (team.club) {
                    extractedSet.club = {
                        id: team.club.id,
                        name: team.club.name,
                        type: null,
                        logoName: null,
                        nickname: null
                    };
                } else {
                    extractedSet.association = {
                        id: team.association.id,
                        name: team.association.name,
                        type: null,
                        logoName: null,
                        nickname: null
                    }
                }
                dataAll.push(JSON.stringify(extractedSet));
            });
        } else {
            console.error(`Failed to retrieve game data. Status code: ${response.status}`);
        }
    });
    sleep(1);
    console.log(`[${dataAll}]`);

}