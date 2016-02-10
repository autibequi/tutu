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
        resource.default.unifiedLambdaURI = configurationFile.unifiedLambdaURI
        return resource
      })
    })
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
    return  {
      httpMethod: method,
      resourceId: resource.id,
      restApiId: resource.restApiId,
      responses: buildResponses(method, resource),
      requestParameters: resource.requestParameters,
      requestTemplates: resource.requestTemplates,
      uri: resource.default.unifiedLambdaURI,
      type: 'AWS'
    }
  })
  return resource
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
      response.responseParameters = response2.responseParameters
      return response
    })
}

// Build the responses of a method
exports.buildMethodResponseParameters = (responseParameters) => {
  var result = {};
  for (key in responseParameters)
    result[key] = true;
  return result;
}
