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
exports.buildResource = (resource) => {
  // Creates a empty Method Array if it doesnt exist.
  if (!resource.Methods)
    resource.Methods = []

  // Add a OPTIONS method to enable CORS if at least one
  // method different than OPTIONS is on the array
  if (resource.Methods.length > 0)
    resource.Methods.push('OPTIONS')

  // Creates a empty Method Array if it doesnt exist.
  if (!resource.pathParameters)
    resource.pathParameters = []

  // Creates a empty Parameters Array if it doesnt exist.
  if (!resource.Parameters)
    resource.Parameters = []

  // Automatically add the Path name as a Parameters
  // array if it has brackets around it like: {parameter}
  var regExp = /{(.*?)}/g
  while (match = regExp.exec(resource.Endpoint))
    resource.pathParameters.push(match[1])

  // Loop all methods and inject settings to each method deploy
  // returns the input resource with all methods ready to deploy
  resource.Methods = resource.Methods.map((methodName) => {
    var method = {
      httpMethod: methodName,
      authorizationType: 'NONE',
      requestParameters: resource.default.requestParameters,
      resourceId: resource.id,
      restApiId: resource.restApiId,
      responses: buildResponses(methodName, resource),
      requestTemplates: buildRequestTemplates(resource),
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
      subResource.pathParameters = resource.pathParameters
      subResource.default = resource.default
      return subResource
    })
    resolve(subResources)
  })
}

// Build request Parameters
buildRequestTemplates = (resource) => {
  // Join Path Parameters {example} with any resource Parameters ?example="val"
  var requestTemplateArray = resource.pathParameters.concat(resource.Parameters)
  // Always passtrough request data
  var templateString = "{\"data\": $input.json('$')"
  requestTemplateArray.forEach((key) => {
    templateString += ", \"" + key + "\": " + "\"$input.params('" + key + "')\""
  })
  templateString += "}"
  return { "application/json": templateString }
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
