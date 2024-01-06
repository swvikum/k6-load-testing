import http from "k6/http";
import { check, sleep } from "k6";
import { Trend } from "k6/metrics";
import { Counter } from "k6/metrics";
import ws from "k6/ws";
import { randomIntBetween, uuidv4 } from "https://jslib.k6.io/k6-utils/1.0.0/index.js";
import { bench_scoring_options } from "../main/get-options.js";

const eventData = JSON.parse(open("./../data/scoringevents.json"));
const scoreEventThroughputTrend = new Trend("score_throughput(Hookdeck-K6)");
let number_of_events = new Counter("events-sent");
const eventMap = new Map();
const sourceID = __ENV.SOURCE_ID ? __ENV.SOURCE_ID : 'src_kjNvP1i5ZTOcStSjjlOymEpz';

/* k6 run --vus 1 --iterations 1 --duration 1m .\scripts\k6\live-scoring-ca\test\webhook-evaluator.js -e SOURCE_ID='src_Cberuv7BWo7RNUUY8G8vpKv4' --logformat=raw --console-output=.\scripts\k6\live-scoring-ca\data\scoringresults.csv 
1. create new source for each test in hookdeck
2. update new source_id in dinamo DB.
3. run k6-bench-scoring.ts
4. structure scoringevents.json as json file.
5. run webhook-evaluator.js
*/

// Retrieve webhook map size
function eventSize(map1, map2) {
  if (map1.size !== map2.size) {
    return map1.size;
  } else {
    return map2.size;
  }
}

// Create CSV report for events and webhook comparison
function generateReport(webhookMap, eventMap, hookdeckMap) {
  const currentTime = new Date();
  const MelbTime = currentTime + 11 * 60 * 60 * 1000;
  const throughputMilliseconds = [];
  const missedWebhookEventType = [];
  const eventTypeMap = new Map();
  const missedWebhook = [];
  let eventMapVal;
  let hookdeckMapVal;
  let eventType;

  for (const eventDataItem of eventData) {
    eventTypeMap.set(eventDataItem.uuid, eventDataItem.eventType);
  }

  for (const [key, val] of eventMap) {
    if (!webhookMap.has(key)) {
      missedWebhook.push(key);
      missedWebhookEventType.push(eventTypeMap.get(key));
    }
  }

  console.log(`missed webhook event size : ${missedWebhookEventType.length}`);
  console.log(`missed webhook event IDs : ${missedWebhook}`);
  console.log(`missed webhook event Types : ${missedWebhookEventType}`);
  const unique = missedWebhookEventType.filter((item, i, ar) => ar.indexOf(item) === i);
  console.log(`unique missed webhook types : ${unique}`);
  const uniqueElementCounter = {};
  for (const element of missedWebhookEventType.flat()) {
    if (uniqueElementCounter[element]) {
      uniqueElementCounter[element] += 1;
    } else {
      uniqueElementCounter[element] = 1;
    }
  }
  console.log(`missed unique webhook counts : ${JSON.stringify(uniqueElementCounter)}`);
  console.log(` `);
  console.log(`Melbourne Time, Event ID, Event Type, Event Triggered Time(from K6), Webhook Processor Time(eventRaisedDateTime), Hookdeck Receiving Time(header-created_at), K6-Webhook Processor, Webhook Processor-Hookdeck, K6-Hookdeck`);

  for (const [key, val] of webhookMap) {
    eventMapVal = eventMap.get(key);
    hookdeckMapVal = hookdeckMap.get(key);
    eventType = eventTypeMap.get(key);
    if (eventMap.has(key)) {
      throughputMilliseconds.push(hookdeckMapVal - eventMapVal);
      const eventRaisedTime = new Date(eventMapVal);
      console.log(`${eventRaisedTime}, ${key}, ${eventType}, ${eventMapVal}, ${val}, ${hookdeckMapVal}, ${val - eventMapVal}, ${hookdeckMapVal - val}, ${hookdeckMapVal - eventMapVal}`);
    }
  }

  console.log(`number of matches : ${throughputMilliseconds.length}`);
  return throughputMilliseconds;
}

const params = {
  headers: {
    Origin: "https://localhost:7070",
  },
};

export let options = bench_scoring_options();

export function setup() {
  // console.log(`event data size ${eventData.length}`);
}

export default function (data) {
  for (let i = 0; i < eventData.length; i++) {
    eventMap.set(eventData[i].uuid, eventData[i].timestamp);
  }

  let URL = "https://api.hookdeck.com/2023-07-01/events?include=data";
  let SOURCE_ID = sourceID;
  let LIMIT = 250;
  let WEBHOOK_URL = `${URL}&source_id=${SOURCE_ID}&limit=${LIMIT}`;

  let MESSAGE_ID = "6dd6711a-c2d1-4b35-9a99-563c5d0a1515";

  const webhookMap = new Map();
  const hookdeckMap = new Map();
  const API_KEY = "Basic MXh4cHZvdTV5ZmFzajBwZ3NudTljanVmb2dodXVzZmYzcHVyMTllcnJnZDFrdzNrcG86";

  const headers = {
    headers: {
      Authorization: `${API_KEY}`,
    },
  };

  while (true) {
    const webhook_response = http.get(WEBHOOK_URL, headers);
    //console.log(`webhook_response: ${JSON.parse(JSON.stringify(webhook_response.body))}`);
    if (
      !check(webhook_response, {
        "Webhook API - Org Updated": (r) =>
          r && r.status && r.status === 200 && r.body && JSON.parse(r.body) && JSON.parse(r.body).errors === undefined,
      })
    ) {
      console.error(`Error! webhook_response: ${JSON.stringify(webhook_response.body)}`);
    }

    const responseRaw = JSON.parse(webhook_response.body);
    const responseBody = responseRaw.models;

    for (let i = 0; i < responseBody.length; i++) {
      let eventType = responseBody[i].data.body.eventType;
      let eventId;
      switch (eventType) {
        case "LIVE_GAME.EVENT_UNDO":
          eventId = responseBody[i].data.body.data.id;
          break;
        case "LIVE_GAME.SCORE_EVENT":
          eventId = responseBody[i].data.body.data.eventId;
          break;
        case "LIVE_GAME.SCORECARD_UPDATED":
          eventId = responseBody[i].data.body.data.eventId;
          break;
        default:
          eventId = responseBody[i].data.body.entityId;
      }

      const eventRaisedDateTime = Date.parse(responseBody[i].data.body.eventRaisedDateTime);
      const hookdeckTime = responseBody[i].created_at;
      const hookdeckTimestamp = Date.parse(hookdeckTime);
      hookdeckMap.set(eventId, hookdeckTimestamp);
      webhookMap.set(eventId, eventRaisedDateTime);
    }

    const currentTime = new Date().getTime();
    const throughputMilliseconds = currentTime - webhookMap.get("02a3bf47-080f-41a7-8c06-da93418f7d9f");

    if (responseRaw.pagination.next === null || responseRaw.pagination.next === undefined) {
      break;
    } else {
      const nextPageId = responseRaw.pagination.next;
      WEBHOOK_URL = `${URL}&source_id=${SOURCE_ID}&limit=${LIMIT}&next=${nextPageId}`;
    }
  }

  number_of_events = eventSize(eventMap, webhookMap);
  console.log(`number_of_events ${number_of_events}`);
  console.log(`webhookMap Size  : ${webhookMap.size}`);

  const throughput = generateReport(webhookMap, eventMap, hookdeckMap);
  throughput.forEach((element) => {
    scoreEventThroughputTrend.add(element);
  });
}

export function teardown(data) {
  // ... Perform cleanup if needed
}
