var apigateway = require('./lib/apigateway.js')
var dataProcess = require('./lib/dataProcess.js')

apigateway.purgeApi()
  .then(() => dataProcess.buildLambdaURI('arn:aws:lambda:us-east-1:522617982767:function:dev-ManageProjectsId-GET'))
  .then((data) => console.log(data))
  .catch((err) => console.log(err.stack))
