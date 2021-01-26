var fs = require('fs');

var configuration = {
  shared_secret: "<your ushashidi webhook 'shared_secret'>"
};



var configFile = './config.json';
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

module.exports = {
    getConfiguration
    
}