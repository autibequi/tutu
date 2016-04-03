'use strict'
let apigateway = require('./apigateway.js')
let dataProcess = require('./dataProcess.js')
let lambda = require('./lambda.js')
let packagers = require('./packagers.js')
let cloudwatchevents = require('./cloudwatchevents.js')
let logger = require('./logger.js')
let misc = require('./misc.js')

// --------------------------------------
//               Deployment
// --------------------------------------
// Initial resource deployment loop
exports.deployResources = (resource) =>
  misc.mapPromises(resource.Resources, deployResource)

// Create a Resource and the methods associated
let deployResource = (resource) => {
  logger.status('Deploying a Resource')
  return apigateway.createOrGetResource(resource)
                   .then(exports.deployStandaloneLambdaFunction)
                   .then(dataProcess.buildResource)
                   .then(apigateway.deployMethods)
                   .then(dataProcess.buildSubResources)
                   .then(exports.deployResources)
}

// Build and inject a lambda function to the resource
// if it is a standalone package
exports.deployStandaloneLambdaFunction = (resource) => {
  if (resource.Standalone) {
    logger.status('Deploying Standalone Lambda Function ' + resource.Path)
    return packagers.buildStandaloneLambdaFunction(resource)
      .then(lambda.deployLambdaFunction)
      .then(lambda.addResourceBasedPermissionToAPI)
      .then((lambdaFunction) => {
        resource.lambdaURI = lambdaFunction.lambdaURI
        return Promise.resolve(resource)
      })
  } else return Promise.resolve(resource)
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
