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
    let params = {FunctionName: functionName}
    lambda.getFunction(params,
      (err, data) => {
        logger.debug('Lambda', 'getLambdaFunction', params, err, data)
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

  return new Promise((resolve, reject) => {
    lambda.createFunction(params,
      (err, data) => {
        logger.debug('Lambda', 'createFunction', params, err, data)
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

  return new Promise((resolve, reject) => {
    lambda.updateFunctionCode(params,
      (err, data) => {
        logger.debug('Lambda', 'updateFunctionCode', params, err, data)
        if (err)
          reject(err);
        else
          resolve(misc.mergeObjects(lambdaFunction, data));
    });
  });
}

exports.updateFunctionConfiguration = (lambdaFunction) => {
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
        logger.debug('Lambda', 'updateFunctionConfiguration', params, err, data)
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

  return new Promise((resolve, reject) => {
    lambda.removePermission(params,
      (err, data) => {
        logger.debug('Lambda', 'removePermission', params, err, data)
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

  return new Promise((resolve, reject) => {
    lambda.addPermission(params,
      (err, data) => {
        logger.debug('Lambda', 'addPermission', params, err, data)
        if (err)
          reject(err);
        else
          resolve(misc.mergeObjects(lambdaFunction, data));
    });
  })
}
