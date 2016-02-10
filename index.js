var fs = require('fs');

var apigateway = require('./lib/apigateway.js')
var deploy = require('./lib/deploy.js')
var dataProcess = require('./lib/dataProcess.js')
var aux = require('./lib/aux.js')
var SETTINGS = require('./lib/settings.js').constants

var endpointsFilePath = aux.getRootFolder() + '/' + SETTINGS.ENDPOINTS_FILENAME

apigateway.purgeApi()
  .then(() => dataProcess.buildLambdaURI('arn:aws:lambda:us-east-1:522617982767:function:dev-ManageProjectsId-GET'))
  .then(() => JSON.parse(fs.readFileSync(endpointsFilePath, 'utf8')))
  .then(dataProcess.prepareRootResources)
  .then(deploy.deployResources)
  .then((data) => console.log(data))
  .catch((err) => console.log(err.stack))
