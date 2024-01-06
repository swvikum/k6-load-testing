import { uuidv4 } from "https://jslib.k6.io/k6-utils/1.0.0/index.js";

export function update_score_payload(uuid, teamID, side, point, score) {
    let payload = {
        "clock": {
            "period": "Pre Game",
            "periodValue": "FIRST_HALF",
            "time": "20:00",
        },
        "id": uuid, // this needs to be a random UUID
        "type": "SCORE",
        "payload": {
            "teamID": teamID,
            "side": side,
            "points": point, // should reflect the score selected below - ARTEM
            "scoreType": score, // create an array with 3 values - "1_POINT_SCORE", "2_POINT_SCORE", "3_POINT_SCORE".
            "appliedTo": "TEAM"
        },
        "timestamp": Date.now()
    };
    return payload;
}

export function game_reset_payload(uuid, timestamp) {
    let payload = {
        "type": "SCORING_EVENTS_PROCESS",
        "payload": {
            "events": [
                {
                    "type": "RESET",
                    "id": uuid.get("gamereset"),
                    "timestamp": timestamp
                }
            ]
        }
    };
    return payload;
}

export function client_mode_update() {

    let payload = {
        "type": "GAME_EVENT_LOG"
    }
    return payload;
}

export function game_event_log() {

    let payload = {
        "type": "CLIENT_MODE_UPDATE",
        "payload": {
            "mode": "SCORING"
        }
    }
    return payload;
}

export function lineup_payload(teamID, side, player, uuid, timestamp) {

    let payload = {
        "type": "SCORING_EVENT_PROCESS",
        "payload": {
            "type": "LINEUP",
            "payload": {
                "teamID": teamID,
                "fillIns": [],
                "rosteredPlayers": [
                    {
                        "playerNumber": null,
                        "participantID": player[0],
                        "firstName": "Anthony",
                        "lastName": "Ashley"
                    },
                    {
                        "playerNumber": null,
                        "participantID": player[1],
                        "firstName": "Rhoda",
                        "lastName": "Booth"
                    },
                    {
                        "playerNumber": null,
                        "participantID": player[2],
                        "firstName": "Juliet",
                        "lastName": "Carver"
                    },
                    {
                        "playerNumber": null,
                        "participantID": player[3],
                        "firstName": "Colton",
                        "lastName": "Daugherty"
                    },
                    {
                        "playerNumber": null,
                        "participantID": player[4],
                        "firstName": "Johanna",
                        "lastName": "Glynn"
                    },
                    {
                        "playerNumber": null,
                        "participantID": player[5],
                        "firstName": "Rooney",
                        "lastName": "Harrington"
                    },
                    {
                        "playerNumber": null,
                        "participantID": player[6],
                        "firstName": "Britanney",
                        "lastName": "Hyde"
                    },
                    {
                        "playerNumber": null,
                        "participantID": player[7],
                        "firstName": "Hiroko",
                        "lastName": "Norris"
                    },
                    {
                        "playerNumber": null,
                        "participantID": player[8],
                        "firstName": "Kelsie",
                        "lastName": "Patton"
                    },
                    {
                        "playerNumber": null,
                        "participantID": player[9],
                        "firstName": "Abbot",
                        "lastName": "Saunders"
                    },
                    {
                        "playerNumber": null,
                        "participantID": player[10],
                        "firstName": "Mona",
                        "lastName": "Sharp"
                    }
                ],
                "side": side
            },
            "id": uuid,
            "timestamp": timestamp
        }
    };
    return payload;
}

export function game_type_setting_payload(uuid, timestamp, team, side, homeTeamPlayers, awayTeamPlayers) {

    let payload = {
        "type": "SCORING_EVENTS_PROCESS",
        "payload": {
            "events": [
                {
                    "type": "GAME_TYPE_SETTINGS",
                    "payload": {
                        "eScoringSettings": {
                            "continueWhenTargetTotalReached": false,
                            "gameType": "t20",
                            "overs": 20,
                            "hasSuperOver": true,
                            "superOverUsage": "ALWAYS",
                            "maxBattersPerInnings": 11,
                            "isFinalsGame": false,
                            "legalBallsPerOver": 6,
                            "runsGainedPerWicket": 4,
                            "runsGainedPerWide": 1,
                            "runsGainedPerWideFinalOver": 1,
                            "wideCountsAsBallsFaced": false,
                            "reBowlWides": false,
                            "reBowlWidesOver": "ALL_OVERS",
                            "runsGainedPerNoBall": 1,
                            "runsGainedPerNoBallFinalOver": 1,
                            "noBallCountsAsBallsFaced": true,
                            "reBowlNoBalls": false,
                            "reBowlNoBallsOver": "ALL_OVERS",
                            "strikeChangeAfterWicket": false,
                            "lastBatterStands": false,
                            "features": [
                                "DLS_CALCULATOR"
                            ]
                        }
                    },
                    "id": uuid.get("gamesetting"),
                    "timestamp": timestamp
                },
                {
                    "type": "COIN_TOSS",
                    "payload": {
                        "winner": {
                            "teamID": team[0],
                            "side": side[0],
                            "result": "BAT"
                        }
                    },
                    "id": uuid.get("cointoss"),
                    "timestamp": timestamp
                },
                {
                    "type": "LINEUP",
                    "payload": {
                        "teamID": team[0],
                        "fillIns": [],
                        "rosteredPlayers": homeTeamPlayers.map((p, i) =>
                        ({
                            "playerNumber": null,
                            "participantID": p,
                            "firstName": "HomePlayer",
                            "lastName": `${i + 1}`
                        })),
                        "side": side[0]
                    },
                    "id": uuid.get("homelineup2"),
                    "timestamp": timestamp
                },
                {
                    "type": "LINEUP",
                    "payload": {
                        "teamID": team[1],
                        "fillIns": [],
                        "rosteredPlayers": awayTeamPlayers.map((p, i) =>
                        ({
                            "playerNumber": null,
                            "participantID": p,
                            "firstName": "AwayPlayer",
                            "lastName": `${i + 1}`
                        })),
                        "side": side[1]
                    },
                    "id": uuid.get("awaylineup1"),
                    "timestamp": timestamp
                },
                {
                    "type": "START_INNINGS",
                    "payload": {
                        "inningsID": uuid.get("startinnings"),
                        "isSuperOver": false,
                        "battingTeamID": team[0]
                    },
                    "id": uuid.get("startinnings"),
                    "timestamp": timestamp
                },
                {
                    "type": "BATTER_START",
                    "payload": {
                        "teamID": team[0],
                        "playerID": homeTeamPlayers[1]
                    },
                    "id": uuid.get("batterstart1"),
                    "timestamp": timestamp
                },
                {
                    "type": "BATTER_START",
                    "payload": {
                        "teamID": team[0],
                        "playerID": homeTeamPlayers[0]
                    },
                    "id": uuid.get("batterstart2"),
                    "timestamp": timestamp
                },
                {
                    "type": "BOWLER_START",
                    "payload": {
                        "teamID": team[1],
                        "side": side[1],
                        "playerID": awayTeamPlayers[6]
                    },
                    "id": uuid.get("bowlerstart"),
                    "timestamp": timestamp
                }
            ]
        }
    };
    return payload;
}

export function coin_toss_payload(team, side, homeTeamPlayers, awayTeamPlayers, uuid, timestamp) {

    let payload = {
        "type": "SCORING_EVENTS_PROCESS",
        "payload": {
            "events": [
                {
                    "type": "COIN_TOSS",
                    "payload": {
                        "winner": {
                            "teamID": team[0],
                            "side": side[0],
                            "result": "BAT"
                        }
                    },
                    "id": uuid.get("cointoss"),
                    "timestamp": timestamp
                },
                {
                    "type": "LINEUP",
                    "payload": {
                        "teamID": team[0],
                        "fillIns": [],
                        "rosteredPlayers": [
                            {
                                "playerNumber": null,
                                "participantID": homeTeamPlayers[0],
                                "firstName": "Anthony",
                                "lastName": "Ashley"
                            },
                            {
                                "playerNumber": null,
                                "participantID": homeTeamPlayers[1],
                                "firstName": "Rhoda",
                                "lastName": "Booth"
                            },
                            {
                                "playerNumber": null,
                                "participantID": homeTeamPlayers[2],
                                "firstName": "Juliet",
                                "lastName": "Carver"
                            },
                            {
                                "playerNumber": null,
                                "participantID": homeTeamPlayers[3],
                                "firstName": "Colton",
                                "lastName": "Daugherty"
                            },
                            {
                                "playerNumber": null,
                                "participantID": homeTeamPlayers[4],
                                "firstName": "Johanna",
                                "lastName": "Glynn"
                            },
                            {
                                "playerNumber": null,
                                "participantID": homeTeamPlayers[5],
                                "firstName": "Rooney",
                                "lastName": "Harrington"
                            },
                            {
                                "playerNumber": null,
                                "participantID": homeTeamPlayers[6],
                                "firstName": "Britanney",
                                "lastName": "Hyde"
                            },
                            {
                                "playerNumber": null,
                                "participantID": homeTeamPlayers[7],
                                "firstName": "Hiroko",
                                "lastName": "Norris"
                            },
                            {
                                "playerNumber": null,
                                "participantID": homeTeamPlayers[8],
                                "firstName": "Kelsie",
                                "lastName": "Patton"
                            },
                            {
                                "playerNumber": null,
                                "participantID": homeTeamPlayers[9],
                                "firstName": "Abbot",
                                "lastName": "Saunders"
                            },
                            {
                                "playerNumber": null,
                                "participantID": homeTeamPlayers[10],
                                "firstName": "Mona",
                                "lastName": "Sharp"
                            }
                        ],
                        "side": side[0]
                    },
                    "id": uuid.get("homelineup2"),
                    "timestamp": timestamp
                },
                {
                    "type": "LINEUP",
                    "payload": {
                        "teamID": team[1],
                        "fillIns": [],
                        "rosteredPlayers": [
                            {
                                "playerNumber": null,
                                "participantID": awayTeamPlayers[0],
                                "firstName": "Anthony",
                                "lastName": "Ashley"
                            },
                            {
                                "playerNumber": null,
                                "participantID": awayTeamPlayers[1],
                                "firstName": "Rhoda",
                                "lastName": "Booth"
                            },
                            {
                                "playerNumber": null,
                                "participantID": awayTeamPlayers[2],
                                "firstName": "Juliet",
                                "lastName": "Carver"
                            },
                            {
                                "playerNumber": null,
                                "participantID": awayTeamPlayers[3],
                                "firstName": "Colton",
                                "lastName": "Daugherty"
                            },
                            {
                                "playerNumber": null,
                                "participantID": awayTeamPlayers[4],
                                "firstName": "Johanna",
                                "lastName": "Glynn"
                            },
                            {
                                "playerNumber": null,
                                "participantID": awayTeamPlayers[5],
                                "firstName": "Rooney",
                                "lastName": "Harrington"
                            },
                            {
                                "playerNumber": null,
                                "participantID": awayTeamPlayers[6],
                                "firstName": "Britanney",
                                "lastName": "Hyde"
                            },
                            {
                                "playerNumber": null,
                                "participantID": awayTeamPlayers[7],
                                "firstName": "Hiroko",
                                "lastName": "Norris"
                            },
                            {
                                "playerNumber": null,
                                "participantID": awayTeamPlayers[8],
                                "firstName": "Kelsie",
                                "lastName": "Patton"
                            },
                            {
                                "playerNumber": null,
                                "participantID": awayTeamPlayers[9],
                                "firstName": "Abbot",
                                "lastName": "Saunders"
                            },
                            {
                                "playerNumber": null,
                                "participantID": awayTeamPlayers[10],
                                "firstName": "Mona",
                                "lastName": "Sharp"
                            }
                        ],
                        "side": side[1]
                    },
                    "id": uuid.get("awaylineup2"),
                    "timestamp": timestamp
                },
                {
                    "type": "START_INNINGS",
                    "payload": {
                        "isSuperOver": false,
                        "battingTeamID": team[0]
                    },
                    "id": uuid.get("startinnings"),
                    "timestamp": timestamp
                },
                {
                    "type": "BATTER_START",
                    "payload": {
                        "teamID": team[0],
                        "playerID": homeTeamPlayers[1]
                    },
                    "id": uuid.get("batterstart1"),
                    "timestamp": timestamp
                },
                {
                    "type": "BATTER_START",
                    "payload": {
                        "teamID": team[0],
                        "playerID": homeTeamPlayers[2]
                    },
                    "id": uuid.get("batterstart2"),
                    "timestamp": timestamp
                },
                {
                    "type": "BOWLER_START",
                    "payload": {
                        "teamID": team[1],
                        "side": side[1],
                        "playerID": awayTeamPlayers[6]
                    },
                    "id": uuid.get("bowlerstart"),
                    "timestamp": timestamp
                }
            ]
        }
    };
    return payload;
}

export function batter_start_payload(teamID, playerId, uuid, timestamp) {

    let payload = {
        "type": "SCORING_EVENTS_PROCESS",
        "payload": {
            "events": [
                {
                    "type": "BATTER_START",
                    "payload": {
                        "teamID": teamID,
                        "playerID": playerId
                    },
                    "id": uuid,
                    "timestamp": timestamp
                }
            ]
        }
    };

    return payload;
}

export function bowler_start_payload(teamID, playerId, uuid, timestamp) {

    let payload = {
        "type": "SCORING_EVENTS_PROCESS",
        "payload": {
            "events": [
                {
                    "type": "BOWLER_START",
                    "payload": {
                        "teamID": teamID,
                        "side": "AWAY",
                        "playerID": playerId
                    },
                    "id": uuid,
                    "timestamp": timestamp
                }
            ]
        }
    };

    return payload;
}

export function start_innings_payload(uuid, timestamp) {

    let payload = {
        "type": "SCORING_EVENT_PROCESS",
        "payload": {
            "type": "START_INNINGS",
            "payload": {
                "isSuperOver": false
            },
            "id": uuid,
            "timestamp": timestamp
        }
    };
    return payload;
}

export function ball_payload(score, uuid, timestamp) {

    let payload = {
        "type": "SCORING_EVENTS_PROCESS",
        "payload": {
            "events": [
                {
                    "type": "BALL",
                    "payload": {
                        "batter": {
                            "statistics": {
                                "runs": score
                            }
                        }
                    },
                    "id": uuid,
                    "timestamp": timestamp
                }
            ]
        }
    };
    return payload;
}

//although wicket has been taken, batter still play until retire. {Junior Games Grade -> Settings -> Game -> T20 -> Dismissals per batter:umlimited {Runs gained per wicket:4}}
export function wicket_payload(homePlayer, uuid, timestamp) {
    let payload = {
        "type": "SCORING_EVENTS_PROCESS",
        "payload": {
            "events": [
                {
                    "type": "BALL",
                    "payload": {
                        "batter": {
                            "statistics": {
                                "runs": 0
                            }
                        },
                        "wicket": {
                            "type": "BOWLED",
                            "batter": {
                                "id": homePlayer
                            }
                        }
                    },
                    "id": uuid,
                    "timestamp": timestamp
                }
            ]
        }
    };
    return payload;
}

//this wicket count as a out and next batter will start {Dismissals per batter : 1}
export function wicketout_payload(gameID, teamID, currentBatter, nextBatter, uuidWicket, uuidbatterStart, timestamp) {
    let payload = {
        "type": "SCORING_EVENTS_PROCESS",
        "payload": {
            "gameID": gameID,
            "events": [
                {
                    "type": "BALL",
                    "payload": {
                        "batter": {
                            "statistics": {
                                "runs": 0
                            }
                        },
                        "wicket": {
                            "type": "BOWLED",
                            "batter": {
                                "id": currentBatter
                            }
                        }
                    },
                    "id": uuidWicket,
                    "timestamp": timestamp
                },
                {
                    "type": "BATTER_START",
                    "payload": {
                        "teamID": teamID,
                        "playerID": nextBatter
                    },
                    "id": uuidbatterStart,
                    "timestamp": timestamp
                }
            ]
        }
    };
    return payload;
}

export function retired_payload(teamId, retiredBatter, newBatter, retiredUuid, batterStartUuid, timestamp) {

    let payload = {
        "type": "SCORING_EVENTS_PROCESS",
        "payload": {
            "events": [
                {
                    "type": "RETIRED",
                    "payload": {
                        "teamID": teamId,
                        "playerID": retiredBatter,
                        "isOut": false
                    },
                    "id": retiredUuid,
                    "timestamp": timestamp
                },
                {
                    "type": "BATTER_START",
                    "payload": {
                        "teamID": teamId,
                        "playerID": newBatter
                    },
                    "id": batterStartUuid,
                    "timestamp": timestamp
                }
            ]
        }
    };
    return payload;
}

export function batter_swap_payload(uuid, timestamp) {

    let payload = {
        "type": "SCORING_EVENTS_PROCESS",
        "payload": {
            "events": [
                {
                    "type": "BATTER_SWAP_STRIKE",
                    "id": uuid,
                    "timestamp": timestamp
                }
            ]
        }
    };
    return payload;
}

export function endover_payload(uuid, timestamp) {

    let payload = {
        "type": "SCORING_EVENTS_PROCESS",
        "payload": {
            "events": [
                {
                    "type": "END_OVER",
                    "id": uuid,
                    "timestamp": timestamp
                }
            ]
        }
    };
    return payload;
}

export function getEventProcessPayload(events) {
    let payload = {
        "type": "SCORING_EVENTS_PROCESS",
        "payload": {
            "events": events
        }
    };
    return payload;
}

export function removeevent_payload(uuid, timestamp, eventToRemove) {
    let payload = {
        "type": "SCORING_EVENTS_PROCESS",
        "payload": {
            "events": [
                {
                    "type": "REMOVE",
                    "payload": {
                        "eventID": eventToRemove
                    },
                    "id": uuid,
                    "timestamp": timestamp
                }
            ]
        }
    }
    return payload;
}
