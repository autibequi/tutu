var SETTINGS = require('./settings.js').constants
var apigateway = require('./apigateway.js')
var aux = require('./aux.js')
var Path = require('path')
var Fs = require('fs')
// --------------------------------------
//            Data Processors
// --------------------------------------
// Create a Lambda URI
exports.buildLambdaURI = (lambdaFunction) => {
  lambdaFunction.lambdaURI = 'arn:aws:apigateway:' + SETTINGS.REGION +
                             ':lambda:path/2015-03-31/functions/' + lambdaFunction.FunctionArn +
                             '/invocations';
  return lambdaFunction
}

exports.buildLambdaHandlerPath = () => {
  return Path.join(SETTINGS.SOURCE_FOLDER_NAME, 'index.handler')
}

// Inject Root Resources with API settings
exports.buildRootResources = (unifiedLambdaFunction) => {
  var endpointsFilePath = aux.getRootFolder() + '/' + SETTINGS.ENDPOINTS_FILENAME
  var configurationFile = JSON.parse(Fs.readFileSync(endpointsFilePath, 'utf8'))

  return apigateway.getResourceByPath('/')
    .then((rootResource) => {
      return configurationFile.Resources.map((resource) => {
        resource.restApiId = SETTINGS.APIGATEWAY_REST_API
        resource.parent = rootResource
        resource.default = {}
        resource.default.responses = configurationFile.ApiGateway.Responses
        resource.default.requestParameters = configurationFile.ApiGateway.RequestParameters
        resource.default.unifiedLambdaURI = unifiedLambdaFunction.lambdaURI
        return resource
      })
    })
}

// Load the lambda Configuration file and creates a lambdaFunction
// object with the codeBuffer inside.
exports.buildUnifiedLambdaFunction = (codeBuffer) => {
    endpointsFilePath = aux.getRootFolder() + '/' + SETTINGS.ENDPOINTS_FILENAME
    tutufile = JSON.parse(Fs.readFileSync(endpointsFilePath, 'utf8'))
    lambdaFunction = {}
    lambdaFunction.name = 'UnifiedLambdaFunction'
    lambdaFunction.Handler = exports.buildLambdaHandlerPath()
    lambdaFunction.default = tutufile.Lambda
    lambdaFunction.codeBuffer = codeBuffer
    return lambdaFunction
}

// Create a Methods List with all data required to be deployed
exports.buildMethodSettings = (resource) => {
  // Checks if there is any method for a resource.
  // If exists, add a OPTIONS method fo enable CORS
  if (resource.Methods && resource.Methods.length > 0)
    resource.Methods.push('OPTIONS')

  // Loop all methods and inject settings to each method deploy
  // returns the input resource with all methods ready to deploy
  resource.Methods = resource.Methods.map((method) => {
    let method = {
      httpMethod: method,
      authorizationType: 'NONE',
      requestParameters: buildRequestParameters(),
      resourceId: resource.id,
      restApiId: resource.restApiId,
      responses: buildResponses(method, resource),
      requestParameters: resource.requestParameters,
      requestTemplates: resource.requestTemplates,
      uri: resource.default.unifiedLambdaURI,
    }

    // If the method is OPTIONS then set type as
    // mock integration
    if (method.httpMethod == 'OPTIONS')
      method.type = 'MOCK'
    else
      method.type = 'AWS'

    return method
  })

  return resource
}


// Create an array with the subresources of a resource
exports.buildSubResources = (resource) => {
  return new Promise((resolve, reject) => {
    if (!resource.Resources)
      resource.Resources = []

    var subResources  = resource.Resources.map((subResource) => {
      subResource.parent = resource
      subResource.restApiId = resource.restApiId
      subResource.responses = resource.responses
      subResource.requestParameters = resource.requestParameters
      subResource.default = resource.default
      return subResource
    })
    resolve(subResources)
  })
}

// Build request Parameters
buildRequestParameters = () => {
  return ''
}

// Build methods responses
buildResponses = (method, resource) => {
  responses = resource.default.responses
  return responses.map((response2) => {
      response = {}
      response.httpMethod = method
      response.resourceId = resource.id
      response.restApiId = resource.restApiId
      response.regex = response2.regex
      response.statusCode = response2.statusCode
      response.responseParameters = buildMethodResponseParameters(response2.responseParameters)
      return response
    })
}

// Build the responses of a method
buildMethodResponseParameters = (responseParameters) => {
  var result = {};
  for (key in responseParameters)
    result[key] = true;
  return result;
}
