import http from 'k6/http';
import { sleep } from 'k6';
import { check } from "k6";
/******************************************************************
 # FILES REQUIRED TO PROVIDE CA FOR SIT DATA INJECTION #
1) This script retrive all organisations for specified tenant

2) Run with output file
 k6 run .\scripts\k6\data-load-ca\phq-ca-data-migration\organisations-test.js --logformat=raw --console-output=.\scripts\k6\data-load-ca\phq-ca-data-migration\results\organisations.json
*******************************************************************/
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
    const url = 'https://localhost/organisations';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + tokenGeneration()
    };

    let totalPages = 0;
    let currentPage = 1;

    do {
        const params = {
            limit: 100,
            page: currentPage
        };

        let response = http.get(url, { headers, params });
        let responseData = JSON.parse(response.body);

        if (response.status === 200) {
            totalPages = responseData.metadata.totalPages;
            let requiredDATA = responseData.data.organisations;
            requiredDATA.map(org => {
                let extractedSet = {
                    id: org.id,
                    name: org.name,
                    type: org.type,
                    logoName: org.logoName,
                    nickname: org.nickname
                };
                dataAll.push(JSON.stringify(extractedSet));
            });
        } else {
            console.log(`Request failed with status code: ${response.status}`);
        }

        currentPage++;
    } while (currentPage <= totalPages);

    sleep(1);
    console.log(`[${dataAll}]`);

}