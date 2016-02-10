var fs = require('fs');
var Path = require('path')
var Finder = require('fs-finder')
var SETTINGS = require('./settings.js').constants

// --------------------------------------
//          Local Aux Functions
// --------------------------------------
exports.getRootFolder = () => {
    var configFilePath = Finder.in(process.cwd())
                               .lookUp(process.env.HOME)
                               .findFiles(SETTINGS.CONFIG_FILENAME);
    return Path.dirname(configFilePath)
}

exports.loadEndpointData = (unifiedLambdaURI) => {
  endpointsFilePath = exports.getRootFolder() + '/' + SETTINGS.ENDPOINTS_FILENAME
  tutufile = JSON.parse(fs.readFileSync(endpointsFilePath, 'utf8'))
  tutufile.unifiedLambdaURI = unifiedLambdaURI
  return tutufile
}
