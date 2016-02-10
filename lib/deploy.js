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
}

// --------------------------------------
// I know there is a way to remove this :/
// See: bluebird Promise.map()
// --------------------------------------
deployMethods = (resource) => {
  return Promise.all(resource.Methods.map(deployMethod))
    .then(() => resource)
}
