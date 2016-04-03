var SETTINGS = require('./settings.js')
var dataProcess = require('./dataProcess.js')
var logger = require('./logger.js')
var lambda = require('./AWS/lambda.js')

// --------------------------------------
//         Lambda Deployer
// --------------------------------------

// Try to update the Lambda Function.
// If the function do not exist yet, try to create it.
exports.deployLambdaFunction  = (lambdaFunction) => {
  logger.status('Iniciando deploy de fato')
  return lambda.updateFunctionConfiguration(lambdaFunction)
    .then(lambda.updateFunctionCode)
    .catch((err) => {
      logger.status('Lambda "', lambdaFunction.name, '" not found, trying to create');
      if (err.code == 'ResourceNotFoundException')
        return lambda.createFunction(lambdaFunction)
      throw err
    })
    .then(addLambdaURI)
}


// This functions give a resource based permission to the lambda function
// allowing any resource from the deployed API to access this lambda function
exports.addResourceBasedPermissionToAPI = (lambdaFunction) => {
  lambdaFunction.permission = {
    Name: lambdaFunction.name,
    Action: 'lambda:InvokeFunction',
    Principal: 'apigateway.amazonaws.com',
    StatementId: 'allow_apigateway_run_' + lambdaFunction.name + '_function',
    SourceArn: 'arn:aws:execute-api:'+ SETTINGS.REGION + ':' + SETTINGS.AWS_ACCOUNT + ':' + SETTINGS.APIGATEWAY_REST_API + '/*'
  }
  logger.status('Dando permissão para o Lambda')
  return lambda.removePermission(lambdaFunction).then(lambda.addPermission)

// Create a Lambda URI
let addLambdaURI = (lambdaFunction) => {
  lambdaFunction.lambdaURI = 'arn:aws:apigateway:' + SETTINGS.REGION +
                             ':lambda:path/2015-03-31/functions/' + lambdaFunction.FunctionArn +
                             '/invocations';
  return lambdaFunction
}
