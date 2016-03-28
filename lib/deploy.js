'use strict'
let apigateway = require('./apigateway.js')
let dataProcess = require('./dataProcess.js')
let lambda = require('./lambda.js')
let packagers = require('./packagers.js')
let cloudwatchevents = require('./cloudwatchevents.js')
let logger = require('./logger.js')
// --------------------------------------
//               Deployment
// --------------------------------------
// Initial resource deployment loop
exports.deployResources = (resources) => {
  let promise = Promise.resolve()
  resources.forEach((resource) => {
    promise = promise.then(() => deployResource(resource))
  })
  return promise.then(() => { return resources })
}

// Create a Resource and the methods associated
let deployResource = (resource) => {
  console.log('Deploying a Resource')
  return apigateway.createOrGetResource(resource)
                   .then(exports.deployStandaloneLambdaFunction)
                   .then(dataProcess.buildResource)
                   .then(deployMethods)
                   .then(dataProcess.buildSubResources)
                   .then(exports.deployResources)
}

let deployMethods = (resource) => {
  let promise = Promise.resolve()
  resource.Methods.forEach((method) => {
    promise = promise.then(() => deployMethod(method))
  })
  return promise.then(() => { return resource })
}

// Deploy a method
let deployMethod = (method) => {
  console.log('Deploying Method')
  return apigateway.putMethod(method)
                   .then(apigateway.putIntegration)
                   .then(putIntegrationAndMethodResponses)
}

// Create the responses serially
let putIntegrationAndMethodResponses = (method) => {
  let promise = Promise.resolve()
  method.responses.forEach((response) => {
    promise = promise.then(() => putIntegrationAndMethodResponse(response))
  })
  return promise.then((responses) => { return method })
}

//  Create a Method and a Integration response of an response
let putIntegrationAndMethodResponse = (response) => {
  console.log('Deploying Integration')
  return apigateway.putMethodResponse(response)
    .then(() => apigateway.putIntegrationResponse(response))
}

// Build and inject a lambda function to the resource
// if it is a standalone package
exports.deployStandaloneLambdaFunction = (resource) => {
  logger.status('Deploying Standalone Lambda Function ' + resource.Path)
  if (resource.Standalone)
    return packagers.buildStandaloneLambdaFunction(resource)
                    .then(lambda.deployLambdaFunction)
                    .then(lambda.addResourceBasedPermissionToAPI)
                    .then((lambdaFunction) => {
                      logger.status('ARRRRRRRRRRRRRRRRRRRr')
                      resource.lambdaURI = lambdaFunction.lambdaURI
                      return Promise.resolve(resource)
                    })
  else
    return Promise.resolve(resource)
}

let deployStuff = (resource) => {
  return exports.deployStandaloneLambdaFunction(resource)
    .then(cloudwatchevents.deployRule)
    .then(cloudwatchevents.deployTarget(resource))
}

exports.deployStandalones = (standaloneLambdas) => {
  logger.status('Deploying Standalone Lambdas');
  // let promise = Promise.resolve()
  // standaloneLambdas.forEach((resource) => {
  //   resource.Standalone = true
  //   promise = promise.then(deployStuff(resource))
  // })
  // return promise.then(Promise.resolve(standaloneLambdas))
  standaloneLambdas[0].Standalone = true
  return deployStuff(standaloneLambdas[0])
}
