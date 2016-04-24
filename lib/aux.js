var Fs = require('fs');
var Path = require('path')
var Finder = require('fs-finder')
var logger = require('./logger.js')
var SETTINGS = require('./settings.js')

// --------------------------------------
//             Aux Functions
// --------------------------------------
// Get the rootFolder absolute path of the project.
// The rootFolder is defined by the tutufile.json path
exports.getRootFolder = () => {
    var configFilePath = Finder.in(process.cwd())
                               .lookUp(process.env.HOME)
                               .findFiles(SETTINGS.CONFIG_FILENAME);
    return Path.dirname(configFilePath[0])
}

// Display Error and success functions.
exports.displaySuccess = (input) => {
  return Promise.resolve(input)
    .then((data) => {
      logger.status('Deploying Finished')
      console.log(data)
    })
}

exports.displayError = (input) => {
  return Promise.reject(input)
  .catch((err) => {
    logger.status('Deployment Error')
    console.log(err.stack)
    process.exit(1)
  })
}
