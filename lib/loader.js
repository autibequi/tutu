var Fs = require('fs')
var SETTINGS = require('./settings.js')
var aux = require('./aux.js')
var logger = require('./logger.js')
var apigateway = require('./AWS/apigateway.js')

exports.standaloneConfiguration = () => {
  logger.status('Loading standalone file');
  return new Promise((resolve, reject) => {
    var pointlessFilePath = aux.getRootFolder() + '/' + SETTINGS.POINTLESS_FILENAME
    var resources = JSON.parse(Fs.readFileSync(pointlessFilePath, 'utf8'))
    var resources = resources.map((resource) => {
      resource.Standalone = true
      return resource
    })
    resolve(resources)
  })
}

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
