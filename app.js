const conf = require('./conf/configuration.js')
const express = require('express');
const assert = require('assert');
const path = require('path')
const expressHandlebars = require('express-handlebars')
const markdownServe = require('markdown-serve')
const fs = require('fs');
const app = express();

init();

app.use('/api', require('./api-routes'));

errorHandling();
startApp();

function init() {
  initMarkDownSupport()

  // Parse JSON bodies for this app. Make sure you put
  // `app.use(express.json())` **before** your route handlers!
  app.use(express.json());

  app.get('/status', function(req, res, next) {res.send("OK")} );

  app.use('/api/*', function(req, res, next) {
    var contype = req.headers['content-type'];
    if (!contype || contype.indexOf('application/json') !== 0)
      return res.status(400).send("'content-type' header should be 'application/json'");
    
    assert.ok(req.hasOwnProperty("body"), "Missing JSON body");
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

function initMarkDownSupport() {
  app.set('views', path.resolve(__dirname, 'views'));
  app.engine('handlebars', expressHandlebars({defaultLayout: 'main'}));
  app.set('view engine', 'handlebars');

  app.use('/public/images/:file', (req, res) => { res.sendFile(path.resolve('public/images/' + req.params.file)) });
  app.use(express.static(path.resolve(__dirname, './public')));

  app.use(markdownServe.middleware({
    rootDirectory: path.resolve(__dirname, 'web'),
    view: 'markdown',
    preParse: true
  }));
}

