var Aws = require('aws-sdk')
var SETTINGS = require('../settings.js')
var lambda = new Aws.Lambda({region: SETTINGS.REGION})

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

  if(lambdaFunction.default.VpcConfig)
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

  if(lambdaFunction.default.VpcConfig)
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
