// --------------------------------------
//       Basic Deployment Processes
// --------------------------------------
var lambda = require('../lib/lambda.js')
var apigateway = require('../lib/apigateway.js')
var deploy = require('../lib/deploy.js')
var dataProcess = require('../lib/dataProcess.js')
var packagers = require('../lib/packagers.js')
var cloudwatchevents = require('../lib/cloudwatchevents.js')

// Deploy Standalone Lambdas
exports.deployStandaloneLambdas = () => {
  return cloudwatchevents.purgeRules()
    .then(cloudwatchevents.loadStandaloneFile)
    .then(cloudwatchevents.deployStandaloneLambdas)
}

// Deploy API
exports.deploy = () => {
  return packagers.buildUnifiedLambdaFunction
    .then(lambda.deployLambdaFunction)
    .then(lambda.addResourceBasedPermissionToAPI)
    .then(dataProcess.buildRootResources)
    .then(deploy.deployResources)
    .then(apigateway.createDeployment)
}

// Purge APIGateway and API
exports.purgeAndDeploy = () => {
  return apigateway.purgeApi
    .then(exports.deploy)
}
