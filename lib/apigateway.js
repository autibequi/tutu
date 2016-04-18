'use strict'
let SETTINGS = require('./settings.js')
let dataProcess = require('./dataProcess.js')
let apigateway = require('./AWS/apigateway.js')
let logger = require('./logger.js')
let misc = require('./misc.js')

// Conditional resource creation
exports.resourceCreator = (resource) => {
  if (resource.Endpoint)
    return apigateway.createOrGetResource(resource)
  else
    return Promise.resolve(resource)
}

// Deploys a Bunch of methods
exports.deployMethods = (resource) => {
  logger.status('Deploying a Methods')
  return misc.mapPromises(resource, "Methods", deployMethod)
}

exports.createDeployment = () =>
  apigateway.createDeployment()

// Deploy a method
let deployMethod = (method) => {
  logger.status('Deploying Method')
  return apigateway.putMethod(method)
                   .then(apigateway.putIntegration)
                   .then(putIntegrationAndMethodResponses)
}

// Create the responses serially
let putIntegrationAndMethodResponses = (method) => {
  logger.status('Deploying Integration And Method Response')
  return misc.mapPromises(method, "responses", putIntegrationAndMethodResponse)
}

//  Create a Method and a Integration response of an response
let putIntegrationAndMethodResponse = (response) => {
  logger.status('Deploying Integration')
  return apigateway.putMethodResponse(response)
    .then(apigateway.putIntegrationResponse(response))
}
