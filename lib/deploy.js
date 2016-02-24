var apigateway = require('./apigateway.js')
var dataProcess = require('./dataProcess.js')
// --------------------------------------
//               Deployment
// --------------------------------------
// Initial resource deployment loop
exports.deployResources = (resources) => {
  var promise = Promise.resolve()
  resources.forEach((resource) => {
    promise = promise.then(() => deployResource(resource))
  })
  return promise.then(() => { return resources })
}

// Create a Resource and the methods associated
deployResource = (resource) => {
  console.log('Deploying a Resource')
  return apigateway.createOrGetResource(resource)
                   .then(dataProcess.deployStandaloneLambdaFunction)
                   .then(dataProcess.buildResource)
                   .then(deployMethods)
                   .then(dataProcess.buildSubResources)
                   .then(exports.deployResources)
}

deployMethods = (resource) => {
  var promise = Promise.resolve()
  resource.Methods.forEach((method) => {
    promise = promise.then(() => deployMethod(method))
  })
  return promise.then(() => { return resource })
}

// Deploy a method
deployMethod = (method) => {
  console.log('Deploying Method')
  return apigateway.putMethod(method)
                   .then(apigateway.putIntegration)
                   .then(putIntegrationAndMethodResponses)
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
  console.log('Deploying Integration')
  return apigateway.putMethodResponse(response)
    .then(() => apigateway.putIntegrationResponse(response))
}
