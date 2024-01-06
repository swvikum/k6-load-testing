
// k6 run --out influxdb=https://influxdb.k6.factory.com/apiflr authenticate-test.js

import http from "k6/http";
import { check, sleep, randomSeed } from "k6";
import { Counter } from "k6/metrics";
import { get_auth_headers, getToken } from "../support/shared.js";
import { setup_ramp, randomIntBetween } from "../../common/util.js"

var login_count = new Counter("login-count");
export let options = setup_ramp("authenticate-get-profile");

export default function () {

    get_auth_headers(getToken(http, check));
    sleep(randomIntBetween(500, 1500) / 1000);
    login_count.add(1);
}
