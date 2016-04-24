var Fs = require('fs')
var SETTINGS = require('./settings.js')
var aux = require('./aux.js')
var logger = require('./logger.js')
var apigateway = require('./AWS/apigateway.js')

// Inject Root Resources with API settings
exports.loadResources = (unifiedLambdaFunction) => {
  var endpointsFilePath = aux.getRootFolder() + '/' + SETTINGS.ENDPOINTS_FILENAME
  var configurationFile = JSON.parse(Fs.readFileSync(endpointsFilePath, 'utf8'))

  return apigateway.getResourceByPath('/')
    .then((rootResource) => {
      rootResource.restApiId = SETTINGS.APIGATEWAY_REST_API
      rootResource.Resources = configurationFile.Resources
      rootResource.default = {
        responses: configurationFile.ApiGateway.Responses,
        requestParameters: configurationFile.ApiGateway.RequestParameters,
        unifiedLambdaURI: unifiedLambdaFunction.lambdaURI,
        lambdaFunction: unifiedLambdaFunction,
        requestTemplates: configurationFile.ApiGateway.RequestTemplates
      }
      return Promise.resolve(rootResource)
    })
}
