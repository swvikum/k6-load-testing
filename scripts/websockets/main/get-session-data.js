const getPlayerNumberDisabledTenantConfigQuery =
  "query playerNumberDisabledTenantConfig {\n  tenantConfiguration {\n    playerNumberDisabled\n    __typename\n  }\n}\n";
const getGameCenterQuery =
  "query gameCentreDiscoverGame($gameId: ID!) {\n  discoverGame(gameID: $gameId) {\n    id\n    alias\n    away {\n      ...TeamFragment\n      __typename\n    }\n    home {\n      ...TeamFragment\n      __typename\n    }\n    result {\n      winner {\n        name\n        value\n        __typename\n      }\n      outcome {\n        name\n        __typename\n      }\n      home {\n        score\n        outcome {\n          name\n          value\n          __typename\n        }\n        statistics {\n          count\n          type {\n            value\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      away {\n        score\n        outcome {\n          name\n          value\n          __typename\n        }\n        statistics {\n          count\n          type {\n            value\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    status {\n      name\n      value\n      __typename\n    }\n    round {\n      id\n      name\n      abbreviatedName\n      grade {\n        id\n        name\n        day {\n          name\n          value\n          __typename\n        }\n        hideScores\n        season {\n          id\n          name\n          competition {\n            id\n            name\n            organisation {\n              ...OrganisationDetails\n              __typename\n            }\n            __typename\n          }\n          __typename\n        }\n        gameEvents {\n          participantEvents {\n            label\n            shortName\n            value\n            pointValue\n            applicableTo\n            advanced\n            __typename\n          }\n          periodEvents {\n            value\n            __typename\n          }\n          __typename\n        }\n        hasPeriodScores\n        periodScoresDisplayType {\n          name\n          value\n          __typename\n        }\n        periods {\n          shortName\n          value\n          __typename\n        }\n        playerPoints {\n          enforceTeamTotalCap\n          teamPlayerPointsCap\n          publicVisible\n          __typename\n        }\n        bestPlayers {\n          max\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    date\n    allocation {\n      time\n      court {\n        id\n        abbreviatedName\n        name\n        venue {\n          id\n          name\n          latitude\n          longitude\n          address\n          suburb\n          state\n          postcode\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    statistics {\n      home {\n        ...DiscoverGameTeamStatisticsFragment\n        __typename\n      }\n      away {\n        ...DiscoverGameTeamStatisticsFragment\n        __typename\n      }\n      __typename\n    }\n    publishLineup\n    __typename\n  }\n  tenantConfiguration {\n    label\n    ...TenantContactRolesConfiguration\n    __typename\n  }\n}\n\nfragment TeamFragment on DiscoverPossibleTeam {\n  ... on ProvisionalTeam {\n    name\n    pool {\n      id\n      name\n      __typename\n    }\n    __typename\n  }\n  ... on DiscoverTeam {\n    ...DiscoverTeamFragment\n    __typename\n  }\n  __typename\n}\n\nfragment DiscoverTeamFragment on DiscoverTeam {\n  id\n  name\n  logo {\n    sizes {\n      url\n      dimensions {\n        width\n        height\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  season {\n    id\n    name\n    competition {\n      id\n      name\n      __typename\n    }\n    __typename\n  }\n  organisation {\n    id\n    name\n    type\n    __typename\n  }\n  playerPointsCap\n  __typename\n}\n\nfragment OrganisationDetails on DiscoverOrganisation {\n  id\n  type\n  name\n  email\n  contactNumber\n  websiteUrl\n  address {\n    id\n    line1\n    suburb\n    postcode\n    state\n    country\n    __typename\n  }\n  logo {\n    sizes {\n      url\n      dimensions {\n        width\n        height\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  contacts {\n    id\n    firstName\n    lastName\n    position\n    email\n    phone\n    __typename\n  }\n  __typename\n}\n\nfragment DiscoverGameTeamStatisticsFragment on DiscoverGameTeamStatistics {\n  players {\n    playerNumber\n    participant {\n      ... on DiscoverParticipant {\n        id\n        profile {\n          id\n          firstName\n          lastName\n          __typename\n        }\n        __typename\n      }\n      ... on DiscoverAnonymousParticipant {\n        name\n        hasGamePermit\n        __typename\n      }\n      __typename\n    }\n    statistics {\n      count\n      type {\n        value\n        __typename\n      }\n      __typename\n    }\n    playerPoints\n    __typename\n  }\n  statistics {\n    count\n    type {\n      value\n      __typename\n    }\n    __typename\n  }\n  periods {\n    period {\n      value\n      __typename\n    }\n    overtimeSequenceNo\n    statistics {\n      type {\n        value\n        __typename\n      }\n      count\n      __typename\n    }\n    __typename\n  }\n  bestPlayers {\n    participant {\n      ... on DiscoverParticipant {\n        id\n        profile {\n          firstName\n          lastName\n          __typename\n        }\n        __typename\n      }\n      ... on DiscoverAnonymousParticipant {\n        name\n        __typename\n      }\n      __typename\n    }\n    ranking\n    __typename\n  }\n  __typename\n}\n\nfragment TenantContactRolesConfiguration on TenantConfiguration {\n  contactRoles {\n    name\n    value\n    __typename\n  }\n  __typename\n}\n";
const getGameQuery =
  "query game($id: ID!) {\n game(id: $id) {\n ...GameFragment\n __typename\n }\n}\n\nfragment GameFragment on Game {\n id\n liveStreamingEnabled \nstatus\n updatedAt\n statistics {\n home {\n statistics {\n type {\n type\n value\n __typename\n }\n count\n __typename\n }\n __typename\n }\n away {\n statistics {\n type {\n type\n value\n __typename\n }\n count\n __typename\n }\n __typename\n }\n __typename\n }\n __typename\n}\n";
const getSessionData =
  "mutation scoringSessionCreate($input: ScoringSessionCreateInput!, $dates: [ISODate!]) {\n  scoringSessionCreate(input: $input) {\n    token\n    username\n    venue {\n      id\n      name\n      courts {\n        id\n        name\n        games(filter: $dates) {\n          ...GameFragment\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment GameFragment on Game {\n  id\n  liveStreamingEnabled \nsyncUrl\n  allocation {\n    date\n    time\n    __typename\n  }\n  gameType {\n    ...GameTypeFragment\n    __typename\n  }\n  grade {\n    id\n    name\n    season {\n      id\n      competition {\n        id\n        organisation {\n          id\n          name\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    periodType {\n      value\n      __typename\n    }\n    periods {\n      label\n      value\n      __typename\n    }\n    totalCourtTime\n    personalFoulLimit\n    teamFoulLimit\n    periodLength\n    overtime {\n      periodLength\n      overtimeType {\n        value\n        __typename\n      }\n      __typename\n    }\n    sinBinTime\n    firstHalfTimeouts\n    secondHalfTimeouts\n    overtimeTimeouts\n    lineupLimits {\n      players {\n        min\n        max\n        __typename\n      }\n      coaches {\n        min\n        max\n        __typename\n      }\n      __typename\n    }\n    gameStatisticsConfiguration {\n      gameStatistics(filter: {classification: EVENT}) {\n        type\n        glossary {\n          scoring {\n            name\n            shortName\n            message\n            labelName\n            __typename\n          }\n          __typename\n        }\n        value\n        pointValue\n        applicableTo\n        __typename\n      }\n      __typename\n    }\n    gameTotalsConfiguration {\n      player {\n        statistic {\n          glossary {\n            scoring {\n              name\n              shortName\n              __typename\n            }\n            __typename\n          }\n          __typename\n        }\n        accumulatedStatistics\n        calculationMethod\n        __typename\n      }\n      coach {\n        statistic {\n          glossary {\n            scoring {\n              name\n              shortName\n              __typename\n            }\n            __typename\n          }\n          __typename\n        }\n        accumulatedStatistics\n        calculationMethod\n        __typename\n      }\n      team {\n        statistic {\n          glossary {\n            scoring {\n              name\n              shortName\n              __typename\n            }\n            __typename\n          }\n          legacyValue\n          value\n          __typename\n        }\n        accumulatedStatistics\n        calculationMethod\n        __typename\n      }\n      __typename\n    }\n    rounds {\n      finals {\n        games {\n          id\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    playerPoints {\n      enforceTeamTotalCap\n      teamPlayerPointsCap\n      __typename\n    }\n    __typename\n  }\n  statistics {\n    home {\n      ...GameTeamStatisticsFragment\n      __typename\n    }\n    away {\n      ...GameTeamStatisticsFragment\n      __typename\n    }\n    __typename\n  }\n  result {\n    home {\n      statistics {\n        type {\n          value\n          __typename\n        }\n        count\n        __typename\n      }\n      __typename\n    }\n    away {\n      statistics {\n        type {\n          value\n          __typename\n        }\n        count\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  status {\n    value\n    __typename\n  }\n  round {\n    id\n    name\n    __typename\n  }\n  home {\n    ... on Team {\n      ...TeamFragment\n      __typename\n    }\n    ... on ProvisionalTeam {\n      ...ProvisionalTeamFragment\n      __typename\n    }\n    __typename\n  }\n  away {\n    ... on Team {\n      ...TeamFragment\n      __typename\n    }\n    ... on ProvisionalTeam {\n      ...ProvisionalTeamFragment\n      __typename\n    }\n    __typename\n  }\n  pool {\n    id\n    name\n    __typename\n  }\n  hasOvertime\n  teams {\n    home {\n      ...GameTeamFragment\n      __typename\n    }\n    away {\n      ...GameTeamFragment\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment GameTypeFragment on GameType {\n  value\n  overs\n  hasSuperOver\n  superOverUsage\n  totalCourtTime\n  maxBattersPerInnings\n  eScoringSettings {\n    legalBallsPerOver\n    maxBallsPerOver\n    maxOversPerBowler\n    maxBallsPerBatter\n    maxRunsPerBatter\n    dismissalsPerBatter\n    runsGainedPerWicket\n    runsGainedPerWide\n    runsGainedPerWideFinalOver\n    wideCountsAsBallsFaced\n    reBowlWides\n    reBowlWidesOver\n    runsGainedPerNoBall\n    runsGainedPerNoBallFinalOver\n    noBallCountsAsBallsFaced\n    reBowlNoBalls\n    reBowlNoBallsOver\n    strikeChangeAfterWicket\n    lastBatterStands\n    __typename\n  }\n  __typename\n}\n\nfragment GameTeamStatisticsFragment on GameTeamStatistics {\n  coaches {\n    participant {\n      ... on Participant {\n        id\n        profile {\n          id\n          firstName\n          lastName\n          suspensions {\n            isActive\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      ... on FillInCoach {\n        id\n        name\n        __typename\n      }\n      __typename\n    }\n    role\n    selected\n    order\n    __typename\n  }\n  __typename\n}\n\nfragment TeamFragment on Team {\n  id\n  name\n  organisation {\n    id\n    logo {\n      sizes {\n        url\n        dimensions {\n          width\n          height\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  playerPointsCap\n  __typename\n}\n\nfragment ProvisionalTeamFragment on ProvisionalTeam {\n  name\n  __typename\n}\n\nfragment GameTeamFragment on GameTeam {\n  lineup {\n    players {\n      participant {\n        ... on Participant {\n          id\n          profile {\n            id\n            firstName\n            lastName\n            __typename\n          }\n          permit {\n            id\n            __typename\n          }\n          __typename\n        }\n        ... on ParticipantFillInPlayer {\n          id\n          participant {\n            id\n            profile {\n              id\n              firstName\n              lastName\n              __typename\n            }\n            permit {\n              id\n              __typename\n            }\n            __typename\n          }\n          __typename\n        }\n        ... on GamePermitFillInPlayer {\n          id\n          profile {\n            id\n            firstName\n            lastName\n            __typename\n          }\n          __typename\n        }\n        ... on RegularFillInPlayer {\n          id\n          firstName\n          lastName\n          __typename\n        }\n        __typename\n      }\n      selected\n      playerNumber\n      playerPoints\n      ineligibilityStatus {\n        value\n        message\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n"

export function get_headers_bench(token) {
  var userHeaders = {
    authorization: "Bearer " + token
  };
  userHeaders["content-type"] = "application/json";
  userHeaders["Origin"] = "https://localhost:7070";
 // userHeaders["scheme"] = "https";
  return userHeaders;
}

export function getPlayerNumberDisabledTenantConfig(
  http,
  check,
  baseUrl,
  headers
) {
  const playerNumberDisabledTenantConfigInput = {};
  const response = http.post(
    baseUrl,
    JSON.stringify({
      operationName: "playerNumberDisabledTenantConfig",
      query: getPlayerNumberDisabledTenantConfigQuery,
      variables: playerNumberDisabledTenantConfigInput
    }),
    { headers: headers }
  );

  check(response, {
    "playerNumberDisabledTenantConfig has no errors": r =>
      r &&
      r.status &&
      r.status === 200 &&
      r.body &&
      JSON.parse(r.body) &&
      JSON.parse(r.body).errors === undefined
  });
}

export function getSessionCreateData(
  http,
  check,
  baseUrl,
  gameDate,
  headers
) {
  const scoringSessionInput = {
    "input": {
      "dates": [
        gameDate
      ],
      "venueID": "017205a9-a24e-43e5-8896-72345641415e"
    },
    "dates": [
      gameDate
    ]
  };
  baseUrl = "https://api.wizards.com/graphql";
  const sessionCreateResponse = http.post(
    baseUrl,
    JSON.stringify({
      operationName: "scoringSessionCreate",
      variables: scoringSessionInput,
      query: getSessionData
    }),
    { headers: headers }
  );
  console.log(`session create response ${JSON.stringify(sessionCreateResponse.body)}`);

  check(sessionCreateResponse, {
    "sessionCreateResponse has no errors": r =>
      r &&
      r.status &&
      r.status === 200 &&
      r.body &&
      JSON.parse(r.body) &&
      JSON.parse(r.body).errors === undefined
  });
  var games = JSON.stringify(sessionCreateResponse.body.data.scoringSessionCreate.venue.courts[0,1].games);
  return games;
}

export function getGame(http, check, baseUrl, headers, game_id) {
  const gameInput = {
    "id": game_id,
    "gameStatisticsFilter": {
      "classification": "TOTAL"
    }
  };
  const response = http.post(
    baseUrl,
    JSON.stringify({
      operationName: "game",
      query: getGameQuery,
      variables: gameInput
    }),
    { headers: headers }
  );

  check(response, {
    "game has no errors": r => r &&
      r.status &&
      r.status === 200 &&
      r.body &&
      JSON.parse(r.body) &&
      JSON.parse(r.body).errors === undefined
  });
}
