'use strict'
let AWS = require('aws-sdk')
var SETTINGS = require('../settings.js')
let misc = require('../misc.js')
let lambda = new AWS.Lambda({region: SETTINGS.REGION})
let logger = require('../logger.js')

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
  let params = {
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

  logger.debug('Creating Function')
  console.log(params);

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
  let params = {
    Publish: false,
    FunctionName: lambdaFunction.name,
    ZipFile: lambdaFunction.codeBuffer,
  };

  logger.debug('Updating Function Code')
  console.log(params);

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
  logger.debug('Updating Function Config')
  console.log(lambdaFunction);
  let params = {
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
  let params = {
    FunctionName: lambdaFunction.permission.Name,
    StatementId: lambdaFunction.permission.StatementId,
  };

  logger.debug('Removing function permission')
  console.log(params);

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
  let params = {
    Action: lambdaFunction.permission.Action,
    FunctionName: lambdaFunction.permission.Name,
    Principal: lambdaFunction.permission.Principal,
    StatementId: lambdaFunction.permission.StatementId,
    SourceArn: lambdaFunction.permission.SourceArn,
  };

  logger.debug('Add function permission')
  console.log(params);

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
