const conf = require('./configuration.js')
const assert = require('assert')

function checkSha256(req, res) {

  assert.ok(req.body.hasOwnProperty("sha256_request"), "Missing 'sha256_request' parameter!");
  assert.ok(req.body.hasOwnProperty("webhook_url"), "Missing 'webhook_url' parameter!");
  assert.ok(req.body.hasOwnProperty("payload"), "Missing 'payload' parameter!");
  assert.notStrictEqual(req.body.sha256_request, "", "'sha256_request' must be specified!");
  assert.notStrictEqual(req.body.webhook_url, "", "'webhook_url' must be specified!");
  assert.notStrictEqual(req.body.payload, "", "'payload' must be specified!");

  let shared_secret = conf.getConfiguration().shared_secret
  let sha256_request = req.body.sha256_request;
  let webhook_url = req.body.webhook_url;
  let payload = req.body.payload;

  let sha256_calculated = require("crypto").createHmac("sha256", shared_secret)
    .update(webhook_url+payload)
    .digest("base64");

  res.status(200).json(new CheckSha256Response(sha256_request === sha256_calculated));
};

class CheckSha256Response {
  constructor(valid) {
    this.valid = Boolean(valid); ;
  }
}

module.exports = {
    checkSha256
}