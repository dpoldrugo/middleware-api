const conf = require('./conf/configuration.js')
const express = require('express');
const assert = require('assert');
const app = express();

init();

// here list all of API's and modules
utils = require('./api/utils.js');
app.post('/api/potres2020/utils/checkSha256', (req, res) => {
  utils.checkSha256(req, res);
});

errorHandling();
startApp();

function init() {
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
}

function startApp() {
  app.listen(3000, () => {
    console.log('App started');
  });

  console.log("Using configuration: ");
  console.dir(conf.getConfiguration())
}

// Add error handling middleware that Express will call
// in the event of malformed JSON.
function errorHandling() {

  app.use(function(err, req, res, next) {
    // 'SyntaxError: Unexpected token n in JSON at position 0'
    err.message;
    console.error(err)
    res.status(400).json({ error: err.message });
  });
}

