// API Headers
export function get_headers_api() {

  let headers = {};
  headers["content-type"] = "application/json";
  headers['authKey'] = `*******-****-****-****-*********`

  return headers;
}

// Check Assertions for REST APIs
export function performCheck(response, checkName, check) {

  if (!check(response, {
    ["Rest API - " + checkName]: (r) =>
      r &&
      r.status === 200 &&
      r.body &&
      JSON.parse(r.body) &&
      JSON.parse(r.body).errors === undefined
  })) {
    console.error(`Error! : ${checkName} => statuscode: ${response.status} response body: ${JSON.stringify(response.body)}`);
  }
}