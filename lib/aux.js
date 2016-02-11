var Fs = require('fs');
var Path = require('path')
var Finder = require('fs-finder')
var dataProcess = require('./dataProcess')
var SETTINGS = require('./settings.js').constants

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

// Load the endpoint file and inject the unifiedLambdaURI
exports.loadEndpointData = (unifiedLambdaURI) => {
  endpointsFilePath = exports.getRootFolder() + '/' + SETTINGS.ENDPOINTS_FILENAME
  tutufile = JSON.parse(Fs.readFileSync(endpointsFilePath, 'utf8'))
  tutufile.unifiedLambdaURI = unifiedLambdaURI
  return tutufile
}

// Load the lambda Configuration file and creates a lambdaFunction
// object with the codeBuffer inside.
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
