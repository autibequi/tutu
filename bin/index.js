'use strict'
// --------------------------------------
//       Basic Deployment Processes
// --------------------------------------
let lambda = require('../lib/lambda.js')
let load = require('../lib/loader.js')
let apigateway = require('../lib/apigateway.js')
let deployer = require('../lib/deploy.js')
let dataProcess = require('../lib/dataProcess.js')
let packagers = require('../lib/packagers.js')
let cloudwatchevents = require('../lib/cloudwatchevents.js')
let logger = require('../lib/logger.js')
var SETTINGS = require('../lib/settings.js')

// Deploy Standalone Lambdas
exports.deployStandaloneLambdas = () =>
  cloudwatchevents.purgeRules(SETTINGS.PROJECT_PREFIX)
    .then(load.standaloneConfiguration)
    .then(deployer.deployStandalones)

// Deploy API
exports.deploy = () =>
  packagers.buildUnifiedLambdaFunction()
    .then(lambda.deployLambdaFunction)
    .then(lambda.addResourceBasedPermissionToAPI)
    .then(dataProcess.buildRootResources)
    .then(deployer.deployResources)
    .then(apigateway.createDeployment)


// Purge APIGateway and API
exports.purgeAndDeploy = () =>
  apigateway.purgeApi()
    .then(exports.deploy)
