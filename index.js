const conf = require('./conf/configuration.js')
const express = require('express');
const assert = require('assert');
const app = express();

// Parse JSON bodies for this app. Make sure you put
// `app.use(express.json())` **before** your route handlers!
app.use(express.json());

app.use('/api/*', function(req, res, next) {
  var contype = req.headers['content-type'];
  if (!contype || contype.indexOf('application/json') !== 0)
    return res.status(400).send("'content-type' header should be 'application/json'");
  
  assert.ok(req.hasOwnProperty("body"), "Misssing JSON body");
  next();
});


const utils = require('./api/utils.js');
app.post('/api/utils/checkSha256', (req, res) => {
  utils.checkSha256(req, res);
});


// Add error handling middleware that Express will call
// in the event of malformed JSON.
app.use(function(err, req, res, next) {
  // 'SyntaxError: Unexpected token n in JSON at position 0'
  err.message;
  console.error(err)
  res.status(400).json({ error: err.message });
});

app.listen(3000, () => {
  console.log('server started');
});

console.log("Using configuration: ");
console.dir(conf.getConfiguration())