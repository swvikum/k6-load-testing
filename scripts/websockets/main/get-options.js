export function bench_scoring_options() {
  let scenarios = {
    scenarios: {
      contacts: {
        executor: "ramping-vus",
        startVUs: 0,
        stages: [
          { duration: "30m", target: 1200 },
          { duration: "60m", target: 1200 },
          { duration: "30m", target: 0 },
        ],
        gracefulRampDown: "1s",
        gracefulStop: "3s"
      }
    },
    ext: {
      loadimpact: {
        projectID: 3546388,
        // Test runs with the same name groups test runs together
        name: "live-scoring"
      }
    },
    thresholds: {
      http_req_duration: ["p(99)<10000"] // 99% of requests must complete below 1.5s
    }
  };
  return scenarios;
}
