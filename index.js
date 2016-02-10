
var apigateway = require('./lib/apigateway.js')
var deploy = require('./lib/deploy.js')
var dataProcess = require('./lib/dataProcess.js')
var aux = require('./lib/aux.js')
var SETTINGS = require('./lib/settings.js').constants


apigateway.purgeApi()
  .then(() => dataProcess.buildLambdaURI('arn:aws:lambda:us-east-1:522617982767:function:dev-ManageProjectsId-GET'))
  .then(aux.loadEndpointData)
  .then(dataProcess.prepareRootResources)
  .then(deploy.deployResources)
  .then((data) => console.log(data))
  .catch((err) => console.log(err.stack))
