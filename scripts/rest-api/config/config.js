/*#############
API URL
Akamai URL:(CDN) Grafana Cloud Whitelisting is created in Akamai
https://sit-grassroots-scoresapi.ca-digi.com : Origin API(Ingress)
*/
export function getScoresAPIUrl() {
    return __ENV.API_URL || 'https://localhost:7070/example'
}

export function getParticipantsAPIUrl() {
    return __ENV.API_URL || 'https://localhost:7070/demo'
}
