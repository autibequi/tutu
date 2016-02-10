var apigateway = require('./apigateway.js')
var dataProcess = require('./dataProcess.js')
// --------------------------------------
//               Deployment
// --------------------------------------
// Initial resource deployment loop
exports.deployResources = (resources) => {
  console.log('Deploying Resource list');
  return Promise.all(resources.map((resource) => {
    return deployResource(resource)
  }))
}

// Create a Resource and the methods associated
deployResource = (resource) => {
  return apigateway.createResource(resource)
    .then(dataProcess.buildMethodSettings)
    .then(deployMethods)
}

// Deploy a method
deployMethod = (method) => {
  return apigateway.putMethod(method)
    .then(apigateway.putIntegration)
    .then(putIntegrationAndMethodResponses)
}

//  Create a Method and a Integration response of an response
putIntegrationAndMethodResponse = (response) => {
  return apigateway.putMethodResponse(response)
    .then(apigateway.putIntegrationResponse(response))
}

// --------------------------------------
// I know there is a way to remove this :/
// See: bluebird Promise.map()
// --------------------------------------
deployMethods = (resource) => {
  return Promise.all(resource.Methods.map(deployMethod))
    .then(() => resource)
}

// Create the responses serially
putIntegrationAndMethodResponses = (method) => {
  var promise = Promise.resolve()
  method.responses.forEach((response) => {
    promise = promise.then(() => putIntegrationAndMethodResponse(response))
  })
  return promise.then((responses) => { return method })
}
