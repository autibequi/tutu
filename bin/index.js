// --------------------------------------
//       Basic Deployment Processes
// --------------------------------------
var lambda = require('../lib/lambda.js')
var load = require('../lib/loader.js')
var apigateway = require('../lib/apigateway.js')
var deployer = require('../lib/deploy.js')
var dataProcess = require('../lib/dataProcess.js')
var packagers = require('../lib/packagers.js')
var cloudwatchevents = require('../lib/cloudwatchevents.js')
var SETTINGS = require('../lib/settings.js')

// Deploy Standalone Lambdas
exports.deployStandaloneLambdas = () =>
  cloudwatchevents.purgeRules(SETTINGS.PROJECT_PREFIX)
    .then(load.standaloneConfiguration)
    .then(deployer.deployStandalones)

// Deploy API
exports.deploy = () =>
  packagers.buildUnifiedLambdaFunction
    .then(lambda.deployLambdaFunction)
    .then(lambda.addResourceBasedPermissionToAPI)
    .then(dataProcess.buildRootResources)
    .then(deployer.deployResources)
    .then(apigateway.createDeployment)


// Purge APIGateway and API
exports.purgeAndDeploy = () =>
  apigateway.purgeApi
    .then(exports.deploy)
