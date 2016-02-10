var SETTINGS = require('./settings.js').constants
var apigateway = require('./apigateway.js')

// --------------------------------------
//            Data Processors
// --------------------------------------
// Create a Lambda URI
exports.buildLambdaURI = (lambdaARN) => {
  return 'arn:aws:apigateway:' + SETTINGS.REGION +
                             ':lambda:path/2015-03-31/functions/' + lambdaARN +
                             '/invocations';
}

// Inject Root Resources with API settings
exports.prepareRootResources = (configurationFile) => {
  return apigateway.getResourceByPath('/')
    .then((rootResource) => {
      return configurationFile.Resources.map((resource) => {
        resource.restApiId = SETTINGS.APIGATEWAY_REST_API
        resource.parent = rootResource
        resource.default = {}
        resource.default.responses = configurationFile.ApiGateway.Responses
        resource.default.requestParameters = configurationFile.ApiGateway.RequestParameters
        return resource
      })
    })
}
