var fs = require('fs');
const assert = require('assert')
const shared_secret_default_value = "<your ushashidi webhook 'shared_secret'>"

var configuration = {
  webhooks: {'<Your webhook URL>': shared_secret_default_value}
};

var configFile = './conf/config.json';
var data;

if (fileExistsSync(configFile)) {
  try {
    data = fs.readFileSync(configFile)
    configuration = JSON.parse(data);
  }
  catch (err) {
    console.error('There has been an error parsing the config.json')
    console.error(err);
  }
}
else {
  data = JSON.stringify(configuration);

  fs.writeFile(configFile, data, function (err) {
    if (err) {
      console.log('There has been an error saving your configuration data.');
      console.log(err.message);
      return;
    }
    console.log('Configuration saved successfully.')
  });
}

function fileExistsSync(file) {
    try {
        fs.accessSync(file, fs.constants.R_OK | fs.constants.W_OK);
        return true;
      } catch (err) {
        return false;
      }
}

function getConfiguration() {
  return configuration;
}

function getSharedSecretForWebhook(webhookUrl) {

  assert.ok(getConfiguration().webhooks.hasOwnProperty(webhookUrl), "No shared_secret defined for for webhook url: " + webhookUrl);
  assert.notStrictEqual(getConfiguration().webhooks[webhookUrl], "", "No shared_secret defined for for webhook url: " + webhookUrl);
  assert.notStrictEqual(getConfiguration().webhooks[webhookUrl], shared_secret_default_value, "No shared_secret defined for for webhook url: " + webhookUrl);

  return getConfiguration().webhooks[webhookUrl]
}

module.exports = {
    getConfiguration,
    getSharedSecretForWebhook
    
}