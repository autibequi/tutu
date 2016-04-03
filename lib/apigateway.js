'use strict'
let SETTINGS = require('./settings.js')
let dataProcess = require('./dataProcess.js')
let apigateway = require('./AWS/apigateway.js')
let logger = require('./logger.js')
let misc = require('./misc.js')

// --------------------------------------
//            AWS Aux Functions
// --------------------------------------
// Delete all resources that have the the rootResource as
// Its parent resource
exports.purgeApi = () => {
  logger.status('Purging API');
  return apigateway.getAllResources()
    .then((resources) => {
      let toDeleted = []
      resources.forEach((resource) => {
        if (resource.path.split('/').length == 2 && resource.path != '/')
          toDeleted.push(apigateway.deleteResource(resource))
      })
      logger.status('Purging ' + toDeleted.length + ' root child resources.');
      return Promise.all(toDeleted)
    })
}

// Deploys a Bunch of methods
exports.deployMethods = (resource) => {
  logger.status('Deploying a Methods')
  return misc.mapPromises(resource.Methods, deployMethod)
    .then((methods) => {
      resource.Methods = methods
      return Promise.resolve(resource)
    })
}

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
  return misc.mapPromises(method.responses, putIntegrationAndMethodResponse)
    .then((responses) => {
      method.responses = responses
      return Promise.resolve(method)
    })
}

//  Create a Method and a Integration response of an response
let putIntegrationAndMethodResponse = (response) => {
  logger.status('Deploying Integration')
  return apigateway.putMethodResponse(response)
    .then(apigateway.putIntegrationResponse(response))
}

// Get all resources and select the one with a specific path
exports.getResourceByPath = (path) => {
  return apigateway.getAllResources()
    .then((data) => {
      logger.status('Getting Resource with path: ' + path);
      let result
      data.forEach((resource) => {
        if(resource.path == path)
          result = resource;
      })
      return result
    })
}

// Tries to create the resource
// if it fails tries to find and return the resource id
exports.createOrGetResource = (resource) => {
  return apigateway.createResource(resource)
    .catch((err) => {
      if(err.code == 'ConflictException'){
        console.log(err)
        console.log(err.message)
        let resource_id = err.message.match(/'([^']*)'/)[0].replace(/'/g, '')
        console.log('rescurso id', resource_id)
        resource.id = resource_id
        return resource
      }

      throw err
    })
}
