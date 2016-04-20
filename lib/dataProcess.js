var SETTINGS = require('./settings.js')
var apigateway = require('./apigateway.js')
var packagers = require('./packagers.js')
var lambda = require('./lambda.js')
var logger = require('./logger.js')
var misc = require('./misc.js')
var aux = require('./aux.js')
var Path = require('path')
var Fs = require('fs')
// --------------------------------------
//            Data Processors
// --------------------------------------

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
  return misc.mapPromises(resource, "Methods", exports.buildMethod)
             .then(exports.buildSubresources)
}

exports.buildSubresources = (resource) => {
  return new Promise ((resolve, reject) => {
    // Build Sub Resources
    if (!resource.Resources){
      resource.Resources = []
    } else {
      logger.status('Building SubResources')
      resource.Resources = resource.Resources.map((subResource) => {
        subResource.parent = resource
        subResource.restApiId = resource.restApiId
        subResource.pathParameters = resource.pathParameters
        subResource.default = resource.default
        return subResource
      })
    }
    resolve(resource)
  })
}

exports.buildMethod = (methodName, resource) => {
  return new Promise((resolve, reject) => {
    var method = {
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
    if (typeof methodName == 'object') {
      method.type = 'AWS'
      method.httpMethod = methodName.httpMethod
      method.requestTemplates = exports.buildRequestTemplates(resource)
      method.requestParameters = exports.buildRequestParameters(resource)
      method.responses = exports.buildMethodResponses(methodName.httpMethod, resource)

      // Build and Deploy a MethodLambda
      resolve(exports.buildMethodLambda(resource, methodName)
         .then((lambdaFunction) => {
           method.uri = lambdaFunction.lambdaURI
           return method
        }))
    } else {
      if (method.httpMethod == 'OPTIONS') {
        method.type = 'MOCK'
        method.httpMethod = methodName
        method.requestTemplates = exports.buildOptionsRequestTemplates(resource)
        method.responses = exports.buildOptionsResponses(resource)
      } else {
        method.type = 'AWS'
        method.httpMethod = methodName
        method.requestTemplates = exports.buildRequestTemplates(resource)
        method.requestParameters = exports.buildRequestParameters(resource)
        method.responses = exports.buildMethodResponses(methodName, resource)
      }

      resolve(method)
    }
  })
}

// Inject a Method lambda
exports.buildMethodLambda = (resource, methodName) => {
  return packagers.buildMethodLambda(resource, methodName)
                  .then(lambda.deployLambdaFunction)
}

// Build request Parameters
exports.buildRequestTemplates = (resource) => {
  // Join Path Parameters {example} with any resource Parameters ?example="val"
  var requestTemplateArray = []
  requestTemplateArray = requestTemplateArray.concat(resource.pathParameters)
  requestTemplateArray = requestTemplateArray.concat(resource.Parameters)
  requestTemplateArray.push(resource.default.requestTemplates)

  var templateString = "{"
  requestTemplateArray.forEach((item) => {
    if (typeof item == 'string')
      templateString += "\"" + item + "\": " + "\"$input.params('" + item + "')\", "
    else {
      for ( property in item )
        templateString += "\"" + property + "\": " + "\"" + item[property] + "\", "
    }
  })

  templateString = templateString.substring(0, templateString.length - 2)
  templateString += "}"
  return { "application/json": templateString }
}

// Build OPTION request tempalte
exports.buildOptionsRequestTemplates = (resource) => {
  return {"application/json": "{\"statusCode\": 200}"}
}

// Build methods responses
exports.buildMethodResponses = (methodName, resource) => {
  var responses = resource.default.responses
  return responses.map((response) => {
    return {
      httpMethod: methodName,
      resourceId: resource.id,
      restApiId: resource.restApiId,
      selectionPattern: response.selectionPattern,
      statusCode: response.statusCode,
      responseTemplates: response.responseTemplates,
      methodResponseParameters: exports.buildMethodResponseParameters(response.responseParameters),
      integrationResponseParameters: exports.buildIntegrationResponseParameters(response.responseParameters),
    }
  })
}

// Build options reponses
exports.buildOptionsResponses = (resource) => {
  return [{
    httpMethod: 'OPTIONS',
    resourceId: resource.id,
    restApiId: resource.restApiId,
    selectionPattern: null,
    statusCode: "200",
    responseTemplates: {"application/json": ""},
    methodResponseParameters: exports.buildMethodResponseParameters(defaultOptionsResponseParameters),
    integrationResponseParameters: exports.buildOptionsResponseParameters(resource),
  }]
}

// Build the request parameters of a method
exports.buildRequestParameters = (resource) => {
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
exports.buildMethodResponseParameters = (responseParameters) => {
  var result = {};
  for (key in responseParameters)
    result[key] = true;
  return result;
}

// Build the responses of a method
exports.buildIntegrationResponseParameters = (responseParameters) => {
  return responseParameters
}

exports.buildOptionsResponseParameters = (resource) => {
  var methods = ''
  var opr = JSON.parse(JSON.stringify(defaultOptionsResponseParameters));
  resource.Methods.forEach(( name ) => {
    if (name != 'OPTIONS')
      methods += name + ','
  })
  methods = methods.substring(0, methods.length - 1)
  opr["method.response.header.Access-Control-Allow-Methods"] = "'" + methods + "'"
  return opr
}

defaultOptionsResponseParameters = {
  "method.response.header.Access-Control-Allow-Origin": "'*'",
  "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,x-Authorization'",
  "method.response.header.Access-Control-Allow-Methods": "'GET,POST'"
}
