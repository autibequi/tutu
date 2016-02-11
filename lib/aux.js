var Fs = require('fs');
var Path = require('path')
var Finder = require('fs-finder')
var dataProcess = require('./dataProcess')
var SETTINGS = require('./settings.js').constants

// --------------------------------------
//          Local Aux Functions
// --------------------------------------
exports.getRootFolder = () => {
    var configFilePath = Finder.in(process.cwd())
                               .lookUp(process.env.HOME)
                               .findFiles(SETTINGS.CONFIG_FILENAME);
    return Path.dirname(configFilePath[0])
}

exports.loadEndpointData = (unifiedLambdaURI) => {
  endpointsFilePath = exports.getRootFolder() + '/' + SETTINGS.ENDPOINTS_FILENAME
  tutufile = JSON.parse(Fs.readFileSync(endpointsFilePath, 'utf8'))
  tutufile.unifiedLambdaURI = unifiedLambdaURI
  return tutufile
}

exports.loadLambdaConfiguration = (codeBuffer) => {
    endpointsFilePath = exports.getRootFolder() + '/' + SETTINGS.ENDPOINTS_FILENAME
    tutufile = JSON.parse(Fs.readFileSync(endpointsFilePath, 'utf8'))
    lambdaFunction = {}
    lambdaFunction.name = 'UnifiedLambdaFunction'
    lambdaFunction.Handler = dataProcess.buildLambdaHandlerPath()
    lambdaFunction.default = tutufile.Lambda
    lambdaFunction.codeBuffer = codeBuffer
    return lambdaFunction
}
