var Fs = require('fs')
var Path = require('path')
var Aws = require('aws-sdk')

var SETTINGS = require('./settings.js').constants
var aux = require('./aux.js')
var misc = require('./misc.js')
var dataProcess = require('./dataProcess.js')

var lambda = new Aws.Lambda({region: SETTINGS.REGION})

// --------------------------------------
//         Lambda Deployer
// --------------------------------------

// Try to update the Lambda Function.
// If the function do not exist yet, try to create it.
exports.deployLambdaFunction  = (lambdaFunction) =>
  exports.updateFunctionConfiguration(lambdaFunction)
    .then(exports.updateFunctionCode)
    .catch((err) => {
      console.log('Lambda "', lambdaFunction.name, '" not found, trying to create');
      if (err.code == 'ResourceNotFoundException')
        return exports.createFunction(lambdaFunction)
      throw err
    })
    .then(dataProcess.buildLambdaURI)


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

  return exports.removePermission(lambdaFunction).then(exports.addPermission)
}

// --------------------------------------
//       AWS Promesified Functions
// --------------------------------------
exports.getLambdaFunction = (functionName) => {
  return new Promise((resolve, reject) => {
    lambda.getFunction({FunctionName: functionName},
      (err, data) => {
        if (err)
          reject(err);
        else
          resolve(data);
    });
  });
}

exports.createFunction = (lambdaFunction) => {
  var params = {
    Publish: false,
    Code: { ZipFile: lambdaFunction.codeBuffer },
    FunctionName: lambdaFunction.name,
    Role: SETTINGS.LAMBDA_EXECUTION_ROLE,
    Handler: lambdaFunction.Handler,
    Runtime: lambdaFunction.default.Runtime,
    Description: lambdaFunction.default.Description,
    MemorySize: lambdaFunction.default.MemorySize,
    Timeout: lambdaFunction.default.Timeout,
  };

  if(lambdaFunction.default.vpc)
    params.VpcConfig = lambdaFunction.default.VpcConfig

  return new Promise((resolve, reject) => {
    lambda.createFunction(params,
      (err, data) => {
        if (err)
          reject(err);
        else
          resolve(misc.mergeObjects(lambdaFunction, data));
    });
  });
}

exports.updateFunctionCode = (lambdaFunction) =>{
  var params = {
    Publish: false,
    FunctionName: lambdaFunction.name,
    ZipFile: lambdaFunction.codeBuffer,
  };

  return new Promise((resolve, reject) => {
    lambda.updateFunctionCode(params,
      (err, data) => {
        if (err)
          reject(err);
        else
          resolve(misc.mergeObjects(lambdaFunction, data));
    });
  });
}

exports.updateFunctionConfiguration = (lambdaFunction) => {
  var params = {
    FunctionName: lambdaFunction.name,
    Handler: lambdaFunction.Handler,
    Role: SETTINGS.LAMBDA_EXECUTION_ROLE,
    Description: lambdaFunction.default.Description,
    MemorySize: lambdaFunction.default.MemorySize,
    Timeout: lambdaFunction.default.Timeout,
  };

  if(lambdaFunction.default.vpc)
    params.VpcConfig = lambdaFunction.default.VpcConfig

  return new Promise((resolve, reject) => {
    lambda.updateFunctionConfiguration(params,
      (err, data) => {
        if (err)
          reject(err);
        else
          resolve(misc.mergeObjects(lambdaFunction, data));
    });
  });
}


exports.removePermission = (lambdaFunction) => {
  var params = {
    FunctionName: lambdaFunction.permission.Name,
    StatementId: lambdaFunction.permission.StatementId,
  };

  return new Promise((resolve, reject) => {
    lambda.removePermission(params,
      (err, data) => {
        if (err && err.code != 'ResourceNotFoundException')
          reject(err);
        else
          resolve(misc.mergeObjects(lambdaFunction, data));
    });
  })
}

exports.addPermission = (lambdaFunction) => {
  var params = {
    Action: lambdaFunction.permission.Action,
    FunctionName: lambdaFunction.permission.Name,
    Principal: lambdaFunction.permission.Principal,
    StatementId: lambdaFunction.permission.StatementId,
    SourceArn: lambdaFunction.permission.SourceArn,
  };

  return new Promise((resolve, reject) => {
    lambda.addPermission(params,
      (err, data) => {
        if (err)
          reject(err);
        else
          resolve(misc.mergeObjects(lambdaFunction, data));
    });
  })
}
