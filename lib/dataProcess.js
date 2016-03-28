var SETTINGS = require('./settings.js')
var apigateway = require('./apigateway.js')
var packagers = require('./packagers.js')
var lambda = require('./lambda.js')
var logger = require('./logger.js')
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
      resourceId: resource.id,
      restApiId: resource.restApiId,
    }

    // Inject the standalone lambdaURI
    // if it is a standalone package
    if (resource.Standalone)
      method.uri = resource.lambdaURI
    else
      method.uri = resource.default.unifiedLambdaURI

    // If the method is OPTIONS then set type as
    // mock integration
    if (method.httpMethod == 'OPTIONS') {
      method.type = 'MOCK'
      method.requestTemplates = buildOptionsRequestTemplates(resource)
      method.responses = buildOptionsResponses(resource)
    } else {
      method.type = 'AWS'
      method.requestTemplates = buildRequestTemplates(resource)
      method.requestParameters = buildRequestParameters(resource)
      method.responses = buildMethodResponses(methodName, resource)
    }

    return method
  })

  return resource
}


// Create an array with the subresources of a resource
exports.buildSubResources = (resource) => {
  return new Promise((resolve, reject) => {
    if (!resource.Resources)
      resolve([])

    logger.status('Building SubResources')
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
  // TODO: FIX THIS:
  templateString += ", \"Authorization\":\"$input.params('x-Authorization')\""
  templateString += ', "method": "$context.httpMethod"'
  templateString += ', "endpoint": "$context.resourcePath"'
  requestTemplateArray.forEach((key) => {
    templateString += ", \"" + key + "\": " + "\"$input.params('" + key + "')\""
  })
  templateString += "}"
  return { "application/json": templateString }
}

// Build OPTION request tempalte
buildOptionsRequestTemplates = (resource) => {
  return {"application/json": "{\"statusCode\": 200}"}
}

// Build methods responses
buildMethodResponses = (methodName, resource) => {
  var responses = resource.default.responses
  return responses.map((response) => {
    return {
      httpMethod: methodName,
      resourceId: resource.id,
      restApiId: resource.restApiId,
      selectionPattern: response.selectionPattern,
      statusCode: response.statusCode,
      responseTemplates: response.responseTemplates,
      methodResponseParameters: buildMethodResponseParameters(response.responseParameters),
      integrationResponseParameters: buildIntegrationResponseParameters(response.responseParameters),
    }
  })
}

// Build options reponses
buildOptionsResponses = (resource) => {
  return [{
    httpMethod: 'OPTIONS',
    resourceId: resource.id,
    restApiId: resource.restApiId,
    selectionPattern: null,
    statusCode: "200",
    responseTemplates: {"application/json": ""},
    methodResponseParameters: buildMethodResponseParameters(defaultOptionsResponseParameters),
    integrationResponseParameters: buildOptionsResponseParameters(resource),
  }]
}

// Build the request parameters of a method
buildRequestParameters = (resource) => {
  var requestParameters = {}

  // Add parameters querystrings
  resource.Parameters.forEach((param) => {
    var location = 'method.request.querystring.' + param
    requestParameters[location] = true;
  })

  // Add default requestparameters if exists
  for (key in resource.default.requestParameters){
    var location = resource.default.requestParameters[key]
    requestParameters[location] = true;
  }

  return requestParameters;
}

// Build the responses of a method
buildMethodResponseParameters = (responseParameters) => {
  var result = {};
  for (key in responseParameters)
    result[key] = true;
  return result;
}

// Build the responses of a method
buildIntegrationResponseParameters = (responseParameters) => {
  return responseParameters
}

buildOptionsResponseParameters = (resource) => {
  var methods = ''
  var opr = defaultOptionsResponseParameters
  resource.Methods.map(( name ) => {
    if (name != 'OPTIONS')
      methods += name + ','
  })
  opr["method.response.header.Access-Control-Allow-Methods"] = "'" + methods + "'"
  return opr
}

defaultOptionsResponseParameters = {
  "method.response.header.Access-Control-Allow-Origin": "'*'",
  "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,x-Authorization'",
  "method.response.header.Access-Control-Allow-Methods": "'GET,POST'"
}
