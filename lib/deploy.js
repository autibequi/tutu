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
  var resourcePromise = apigateway.createResource(resource)
                          .then(dataProcess.buildResource)

  return Promise.all([resourcePromise.then(deployMethods),
                      resourcePromise.then(dataProcess.buildSubResources)
                        .then(exports.deployResources)])
}

deployMethods = (resource) => {
  return Promise.all(resource.Methods.map(deployMethod))
    .then(() => resource)
}

// Deploy a method
deployMethod = (method) => {
  var putMethodPromise = apigateway.putMethod(method)
  return Promise.all([putMethodPromise.then(apigateway.putIntegration),
                      putMethodPromise.then(putIntegrationAndMethodResponses)])
}

// Create the responses serially
putIntegrationAndMethodResponses = (method) => {
  var promise = Promise.resolve()
  method.responses.forEach((response) => {
    promise = promise.then(() => putIntegrationAndMethodResponse(response))
  })
  return promise.then((responses) => { return method })
}

//  Create a Method and a Integration response of an response
putIntegrationAndMethodResponse = (response) => {
  return apigateway.putMethodResponse(response)
    .then(() => apigateway.putIntegrationResponse(response))
}
