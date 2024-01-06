import { randomSeed } from "k6";
import { getFullTenant } from "../../common/util.js"

const jsonData = JSON.parse(open('../data/users-data.json'));
const jsonDataTeamManager = JSON.parse(open('../data/my-teams-managers.json'));
const jsonDataMyTeams = JSON.parse(open('../data/my-team-users-data.json'));

const perftestCognitoAppId = "1cmp8jr4bnicg6394n50suboc4";
const cognitoBaseUrl = "https://cognito-idp.ap-southeast-2.amazonaws.com/";

export function get_headers() {
  let tenant = getTenant();
  let fullTenantData = getFullTenant(tenant);

  let userHeaders = {};
  userHeaders["content-type"] = "application/json";
  userHeaders["Origin"] = "https://www.perftest.com";
  userHeaders['tenant'] = fullTenantData.slug;
  userHeaders['x-phq-tenant'] = fullTenantData.shortName;
  userHeaders['User-Agent'] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
  return userHeaders;
}

/*
    **************************************************************************
    DEPRECATED -> PLEASE USE THE setup_ramp FUNCTION WITHIN THE UTILS.JS FILE 
    **************************************************************************
*/
export function setup_ramp(loadName) {
  const duration = (__ENV.DURATION).split(",")
  const target = (__ENV.TARGET).split(",")

  let stagesForRamp = [];
  for (var i = 0; i < duration.length; i++) {
    stagesForRamp.push({ duration: duration[i], target: target[i] })
  }

  return {
    stages: stagesForRamp,
    gracefulRampDown: '1m',
    ext: {
      loadimpact: {
        projectID: 3546388,
        // Test runs with the same name groups test runs together
        name: loadName
      }
    },
    thresholds: {
      http_req_duration: [`p(99)<2000`] // 99% of requests must complete below 2s
    }
  };
}

export function getTenant() {
  if (__ENV.TENANT) return __ENV.TENANT;
  else return 'bv'
}

export function getPlaymakerAPIurl(tenant) {
  switch (tenant) {
    case 'bv':
      return 'https://localhost.com';
      break;
    case 'ca':
      return 'https://localhost.com';
      break;
    case 'afl':
      return 'https://localhost.com';
      break;
    default:
      return 'https://localhost.com'
  }
}

export function getAPIUrl() {
  return __ENV.API_URL || 'https://localhost'
}

export function getBaseUrl() {
  return __ENV.BASE_URL || 'https://localhost/graphql'
}

export function getBaseUrlSpectator() {
  return 'https://spectator.perftest.com/graphql'
}

export function get_headers_spectator() {
  let tenant = getTenant();
  let fullTenantData = getFullTenant(tenant);

  let userHeaders = {};
  userHeaders["content-type"] = "application/json";
  userHeaders["Origin"] = "https://www.perftest.com";
  userHeaders['x-phq-tenant'] = fullTenantData.shortName;
  userHeaders['user-agent'] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36";

  return userHeaders;
}

export function getToken(http, check) {
  let tenant = getTenant();

  let seedController = __ITER % 20;
  randomSeed(__VU + "" + seedController);;

  let JSON_DATA_COUNT = jsonData[tenant].length;
  let random = (Math.floor(Math.random() * JSON_DATA_COUNT));
  var cognitoHeaders = {};
  cognitoHeaders["X-Amz-User-Agent"] = "aws-amplify/0.1.x js";
  cognitoHeaders["X-Amz-Target"] =
    "AWSCognitoIdentityProviderService.InitiateAuth";
  cognitoHeaders["Content-Type"] = "application/x-amz-json-1.1";

  let perftestUsernameAdmin = jsonData[tenant][random].username;
  let perftestPasswordAdmin = jsonData[tenant][random].password;
  // console.log(`login user : ${perftestUsernameAdmin}`);

  var cognitoPayload = {
    AuthFlow: "USER_PASSWORD_AUTH",
    AuthParameters: {
      USERNAME: perftestUsernameAdmin,
      PASSWORD: perftestPasswordAdmin
    },
    ClientId: perftestCognitoAppId,
    ClientMetadata: {}
  };

  const cognitoResponse = http.post(
    cognitoBaseUrl,
    JSON.stringify(cognitoPayload),
    {
      headers: cognitoHeaders,
      tags: {
        requestName: "cognitoAuthenticate"
      }
    }
  );
  check(cognitoResponse, {
    "cognito login status is 200": r => r.status === 200
  });
  // console.log(
  //     JSON.parse(cognitoResponse.body).AuthenticationResult.AccessToken
  // );
  var token = JSON.parse(cognitoResponse.body).AuthenticationResult.AccessToken;
  return token;
}

export function getTokenTeamManager(http, check, teamManagerID = null) {

  let seedController = __ITER % 20;
  randomSeed(__VU + "" + seedController);;

  let JSON_TEAM_MANAGER_COUNT = jsonDataTeamManager.length;
  let randomManager = (Math.floor(Math.random() * JSON_TEAM_MANAGER_COUNT));

  var cognitoHeaders = {};
  cognitoHeaders["X-Amz-User-Agent"] = "aws-amplify/0.1.x js";
  cognitoHeaders["X-Amz-Target"] =
    "AWSCognitoIdentityProviderService.InitiateAuth";
  cognitoHeaders["Content-Type"] = "application/x-amz-json-1.1";

  const randomTeamManager = jsonDataTeamManager[randomManager]
  let perftestUsernameAdmin = (teamManagerID
    ? jsonDataTeamManager.find(i => i.id === teamManagerID) || randomTeamManager
    : randomTeamManager).email;

  //console.log('Login Team Manager :', perftestUsernameAdmin)

  //perftestUsernameAdmin = "maurizia.bella20@example.com";
  let perftestPasswordAdmin = "Playhq@123";
  //console.log(`login user : ${perftestUsernameAdmin}`);

  var cognitoPayload = {
    AuthFlow: "USER_PASSWORD_AUTH",
    AuthParameters: {
      USERNAME: perftestUsernameAdmin,
      PASSWORD: perftestPasswordAdmin
    },
    ClientId: perftestCognitoAppId,
    ClientMetadata: {}
  };

  const cognitoResponse = http.post(
    cognitoBaseUrl,
    JSON.stringify(cognitoPayload),
    {
      headers: cognitoHeaders,
      tags: {
        requestName: "cognitoAuthenticate"
      }
    }
  );
  check(cognitoResponse, {
    "COGNITO LOGIN status is 200": r => r.status === 200
  });
  // console.log(
  //     JSON.parse(cognitoResponse.body).AuthenticationResult.AccessToken
  // );
  var token = JSON.parse(cognitoResponse.body).AuthenticationResult.AccessToken;
  return token;
}
export function getTokenMyTeams(http, check) {
  let tenant = getTenant();
  let JSON_DATA_COUNT_MY_TEAM = jsonDataMyTeams[tenant].length;
  let randomMyTeam = (Math.floor(Math.random() * JSON_DATA_COUNT_MY_TEAM));
  let perftestUsernameMyTeam = jsonDataMyTeams[tenant][randomMyTeam].username;
  let perftestPasswordMyTeam = jsonDataMyTeams[tenant][randomMyTeam].password;

  var cognitoHeaders = {};
  cognitoHeaders["X-Amz-User-Agent"] = "aws-amplify/0.1.x js";
  cognitoHeaders["X-Amz-Target"] =
    "AWSCognitoIdentityProviderService.InitiateAuth";
  cognitoHeaders["Content-Type"] = "application/x-amz-json-1.1";

  var cognitoPayload = {
    AuthFlow: "USER_PASSWORD_AUTH",
    AuthParameters: {
      USERNAME: perftestUsernameMyTeam,
      PASSWORD: perftestPasswordMyTeam
    },
    ClientId: perftestCognitoAppId,
    ClientMetadata: {}
  };

  // console.log(`login username : ${perftestUsernameMyTeam}`);
  const cognitoResponse = http.post(
    cognitoBaseUrl,
    JSON.stringify(cognitoPayload),
    { headers: cognitoHeaders }
  );
  check(cognitoResponse, {
    "COGNITO LOGIN status is 200": r => r.status === 200
  });
  // console.log(
  //     JSON.parse(cognitoResponse.body).AuthenticationResult.AccessToken
  // );
  var token = JSON.parse(cognitoResponse.body).AuthenticationResult.AccessToken;
  return token;
}

export function getTokenUJProfileMatching(http, check, username, password) {
  var cognitoHeaders = {};
  cognitoHeaders["X-Amz-User-Agent"] = "aws-amplify/0.1.x js";
  cognitoHeaders["X-Amz-Target"] =
    "AWSCognitoIdentityProviderService.InitiateAuth";
  cognitoHeaders["Content-Type"] = "application/x-amz-json-1.1";

  var cognitoPayload = {
    AuthFlow: "USER_PASSWORD_AUTH",
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password
    },
    ClientId: perftestCognitoAppId,
    ClientMetadata: {}
  };

  const cognitoResponse = http.post(
    cognitoBaseUrl,
    JSON.stringify(cognitoPayload),
    { headers: cognitoHeaders }
  );
  check(cognitoResponse, {
    "COGNITO LOGIN status is 200": r => r.status === 200
  });
  console.log(
    JSON.parse(cognitoResponse.body).AuthenticationResult.AccessToken
  );
  var token = JSON.parse(cognitoResponse.body).AuthenticationResult.AccessToken;
  return token;
}

export function get_auth_headers(token) {
  var userHeaders = {
    authorization: "Bearer " + token
  };
  userHeaders["content-type"] = "application/json";
  userHeaders["Origin"] = "https://localhost.com";
  userHeaders["x-organisation-id"] = '972dbaea-9aeb-4fa2-a92c-0986658b0f03';
  userHeaders['tenant'] = getTenant();

  return userHeaders;
}

export function randomIntBetween(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}
