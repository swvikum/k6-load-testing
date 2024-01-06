import http, {post} from "k6/http";
import {check, fail} from "k6";
import {getTokenFastBreak} from "../../common/get-token";
import {SCORING_MIGRATE} from "../graphql/scoringMigrate";
import {Options} from "k6/options";
import encoding from "k6/encoding";
import execution from "k6/execution";

const environment = __ENV.ENVIRONMENT || "perftest"
const tenant = __ENV.TENANT

// Not ideal
const baseUrl = `https://api.${environment}.com/graphql`;
// Maybe file loading should happen in the init stage?
const filePath = `../scripts/k6/live-scoring-ca/data/games-${tenant}-${environment}.json`

// noinspection TypeScriptValidateTypes
const jsonData: [{ GAME_ID }] = JSON.parse(open(filePath))
if (!jsonData) {
    fail(`Could not load ${filePath}`)
}

/*
* Will reset the game status for these games.
* This is run in the teardown stage of the test,
* so the game is returned the state it was before the test was run
*
* This also sometimes fails in perftest, due to it getting access to a follower instead of leader
*/
const deleteNeo4jStats = (gameIDs, tenant, env) => {

    console.debug("Deleting neo4 data")


    const statements =
        {
            statements: [
                {
                    statement: `MATCH (g:Game)-[:HAS_PERIOD]->(p:Period)-[:RECORDED]->(s:Statistic)
                WHERE g.id in $gameIDs
                MATCH(g)-[:PRODUCED]->(to:TeamOutcome)
                MATCH(g)<-[:IN_GAME]-(ta:TeamAppearance)
                DETACH DELETE p,s,to,ta`,
                    parameters: {
                        gameIDs
                    }
                },
                {
                    statement: `MATCH (g:Game)
                WHERE g.id in $gameIDs
                REMOVE g.status, g.resultSource, g.resultRecordedAt,g.resultPublishedAt, g.outcome`,
                    parameters: {
                        gameIDs
                    }
                },
                {
                    statement: `MATCH (g:Game)-[:HAS_PERIOD]->(p:Period)
                WHERE g.id in $gameIDs
                DETACH DELETE p`,
                    parameters: {
                        gameIDs
                    }
                },
                {
                    statement: `MATCH (g:Game)<-[IN_GAME]-(a:FillInAppearance)<-[:MADE]-(fp:FillInPlayer)
                WHERE g.id in $gameIDs AND
                NOT fp:GamePermitFillInPlayer or fp:ParticipantFillInPlayer
                DETACH DELETE fp,a`,
                    parameters: {
                        gameIDs
                    }
                }
            ]
        }


    const request = post(`http://db.${tenant}.${env}.intra:7474/db/graph.db/tx/commit`,

        JSON.stringify(statements),
        {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json;charset=UTF-8",
                "Authorization": `Basic ${encoding.b64encode('neo4j:password')}`
            }
        })

    const resp = request.json()
    console.debug(resp)
}

interface SetupOutput {
    tokenScore: string
    environment: string
    tenant: string
}

// We can only call scoringMigrate once so VUS's need to match iterations
export let options: Options = {
    vus: 500,
    iterations: 500,

}

export function teardown() {
    const gameIDs = jsonData.map(s => s.GAME_ID)
    deleteNeo4jStats(gameIDs, tenant, environment)
}

export function setup(): SetupOutput {

    console.debug("Setting up test", {tenant, environment})
    if (!tenant || !environment) {
        fail("Need TENANT and ENVIRONMENT variables")
    }

    const tokenScore = getTokenFastBreak(environment, tenant)

    if(!tokenScore) {
        fail("Could not get scoring token")
    }

    return {
        tokenScore,
        environment,
        tenant,
    }
}

// noinspection JSUnusedGlobalSymbols
export default function ({tokenScore, environment, tenant}: SetupOutput) {

    // console.debug("Loaded JSON data", jsonData)

    const me = execution.vu.idInTest - 1
    const gameID = jsonData[me]?.GAME_ID

    if(!gameID) {
        console.error("No gameID for VU", {me})
        return
    }

    console.debug("me", {gameID, me})

    // sleep(Math.random() * 10)
    return

    let headers = {
        authorization: "Bearer " + tokenScore,
        "Content-Type": "application/json",
        "Origin": `https://${tenant}.${environment}.com`,
        "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36",
    }

    const requestVariables = {
        gameID
    }

    console.debug("scoring migrate query", SCORING_MIGRATE.loc?.source.body)
    const response = http.post(baseUrl, JSON.stringify({
        operationName: "scoringMigrate",
        query: SCORING_MIGRATE.loc?.source.body,
        variables: requestVariables
    }), {headers: headers})

    const jsonBody = JSON.parse(<string>response.body) as {errors?: []}

    check(jsonBody, {
        "scoringMigrate had no errors": r => !r.errors?.length
    })

    check(response, {
        "scoringMigrate status is 200": r => r.status === 200
    })

    console.debug(response)
}
