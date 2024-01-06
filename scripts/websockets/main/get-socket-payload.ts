import {EventType, GameEvents, RemoveEvent, ScoreEvent} from "@gameonsports/play-by-play";
import {GameType} from "@gameonsports/play-by-play/lib/transformer/types";
import {
    uuidv4
} from "https://jslib.k6.io/k6-utils/1.0.0/index.js"
import {BallEvent, BowlerStartEvent, EndOverEvent} from "@gameonsports/play-by-play/lib/cricket/transformer/events";

export interface TipOffScoringEventProcessPayload {
    type: "SCORING_EVENT_PROCESS",
    payload: GameEvents
}

export interface TipOffScoringEventsProcessPayload {
    type: "SCORING_EVENTS_PROCESS",
    payload: {
        events: GameEvents[]
    }
}


export function update_score_payload(uuid: string, teamID: string, side: "HOME" | "AWAY", point: number, score: string): ScoreEvent {
    return {
        "clock": {
            "period": "Pre Game",
            "periodValue": "FIRST_HALF",
            "time": "20:00",
        },
        "id": uuid, // this needs to be a random UUID
        "type": EventType.Score,
        "payload": {
            "teamID": teamID,
            "side": side,
            "points": point, // should reflect the score selected below - ARTEM
            "scoreType": score, // create an array with 3 values - "1_POINT_SCORE", "2_POINT_SCORE", "3_POINT_SCORE".
            "appliedTo": "TEAM"
        },
        "timestamp": Date.now()
    }
}

export function client_mode_update() {
    return {
        "type": "GAME_EVENT_LOG"
    };
}

export function game_event_log() {
    return {
        "type": "CLIENT_MODE_UPDATE",
        "payload": {
            "mode": "SCORING"
        }
    };
}

export function getCricketStartGameWebsocketPayload(uuid: Map<string, string>, timestamp: number, team: string[], sides: ["HOME", "AWAY"], homeTeamPlayers: string[], awayTeamPlayers: string[]): TipOffScoringEventsProcessPayload {
    return {
        "type": "SCORING_EVENTS_PROCESS",
        "payload": {
            "events": [
                {
                    "type": EventType.GameTypeSettings,
                    "payload": {
                        "eScoringSettings": {
                            "continueWhenTargetTotalReached": false,
                            "gameType": GameType.T20,
                            "overs": 20,
                            "hasSuperOver": true,
                            "superOverUsage": "ALWAYS",
                            "maxBattersPerInnings": 11,
                            "isFinalsGame": false,
                            "legalBallsPerOver": 6,
                            "dismissalsPerBatter": 1,
                            "runsGainedPerWicket": 0,
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
                        }
                    },
                    "id": uuid.get("gamesetting")!,
                    "timestamp": timestamp
                },
                {
                    "type": EventType.CoinToss,
                    "payload": {
                        "winner": {
                            "teamID": team[0],
                            "side": sides[0],
                            "result": "BAT"
                        }
                    },
                    "id": uuid.get("cointoss")!,
                    "timestamp": timestamp
                },
                {
                    "type": EventType.LineUp,
                    "payload": {
                        "teamID": team[0],
                        "fillIns": [],
                        "rosteredPlayers": homeTeamPlayers.map((p, i) =>
                            ({
                                "playerNumber": null,
                                "participantID": p,
                                "firstName": "HomePlayer",
                                "lastName": `${i}`
                            })),
                        "side": sides[0]
                    },
                    "id": uuid.get("homelineup2")!,
                    "timestamp": timestamp
                },
                {
                    "type": EventType.LineUp,
                    "payload": {
                        "teamID": team[1],
                        "fillIns": [],
                        "rosteredPlayers": awayTeamPlayers.map((p, i) =>
                            ({
                                "playerNumber": null,
                                "participantID": p,
                                "firstName": "AwayPlayer",
                                "lastName": `${i}`
                            })),
                        "side": sides[1]
                    },
                    "id": uuid.get("awaylineup1")!,
                    "timestamp": timestamp
                },
                {
                    "type": EventType.StartInnings,
                    "payload": {
                        "inningsID": uuid.get("startinnings"),
                        "isSuperOver": false,
                        "battingTeamID": team[0]
                    },
                    "id": uuid.get("startinnings")!,
                    "timestamp": timestamp
                },
                {
                    "type": EventType.BatterStart,
                    "payload": {
                        "playerID": homeTeamPlayers[1]
                    },
                    "id": uuid.get("batterstart1")!,
                    "timestamp": timestamp
                },
                {
                    "type": EventType.BatterStart,
                    "payload": {
                        "playerID": homeTeamPlayers[2]
                    },
                    "id": uuid.get("batterstart2")!,
                    "timestamp": timestamp
                },
                {
                    "type": EventType.BowlerStart,
                    "payload": {
                        "playerID": awayTeamPlayers[6]
                    },
                    "id": uuid.get("bowlerstart")!,
                    "timestamp": timestamp
                }
            ]
        }
    };
}

export function getBowlerStartEvent(playerId: string, uuid: string, timestamp: number): BowlerStartEvent {
    return {
        "type": EventType.BowlerStart,
        "payload": {
            "playerID": playerId
        },
        "id": uuid,
        "timestamp": timestamp
    }
}

export function getBallEvent(score: number, uuid: string, timestamp: number): BallEvent {

    return {
        "type": EventType.Ball,
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
}

export function getEndOverEvent(uuid: string, timestamp: number): EndOverEvent {
    return {
        "type": EventType.EndOver,
        "id": uuid,
        "timestamp": timestamp
    }
}

export function getEventProcessPayload(events: GameEvents[]): TipOffScoringEventsProcessPayload {
    return {
        "type": "SCORING_EVENTS_PROCESS",
        "payload": {
            "events": events
        }
    };
}

export function getRemoveEvent(eventToRemove: string): RemoveEvent {
    return {
        id: uuidv4(),
        type: EventType.Remove,
        timestamp: Date.now(),
        payload: {
            eventID: eventToRemove
        }
    }
}