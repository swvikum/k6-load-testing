export function get_auth_headers(token = null) {
  var userHeaders = {};
  if (token) {
    userHeaders.authorization = "Bearer " + token;
  }
  userHeaders["content-type"] = "application/json";
  userHeaders["Origin"] = "https://localhost.com";
  userHeaders["x-organisation-id"] = '972dbaea-9aeb-4fa2-a92c-0986658b0f03';
  userHeaders['tenant'] = getTenant();
  return userHeaders;
}







