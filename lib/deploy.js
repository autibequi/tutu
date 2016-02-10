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
}
