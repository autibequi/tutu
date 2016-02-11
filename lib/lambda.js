var Fs = require('fs');
var Path = require('path');
var Aws = require('aws-sdk')

var SETTINGS = require('./settings.js').constants
var aux = require('./aux.js')

var lambda = new Aws.Lambda({region: SETTINGS.REGION});

// --------------------------------------
//         Unified Package Builder
// --------------------------------------
var Archiver = require('archiver');

// Build a unified lambda package and returns a
// buffer of this file
exports.buildUnifiedLambdaPackage = () => {
  return new Promise((resolve, reject) => {
    // Build some folder absolute paths
    var rootFolderPath = aux.getRootFolder()
    var distFolderPath = Path.join(rootFolderPath,
                                   SETTINGS.TEMP_FOLDER_NAME)
    var packagePath = Path.join(distFolderPath,
                                SETTINGS.UNIFIED_LAMBDA_PACKAGE_NAME)

    // Open Package File Buffer
    var outputBuffer = Fs.createWriteStream(packagePath);
    outputBuffer.on('close',
      (buff) => {
        var packageBuffer = Fs.readFileSync(outputBuffer.path);
        resolve(packageBuffer)
      })

    // Initiate Archiver
    var lambdaPackage = Archiver('zip')
    lambdaPackage.pipe(outputBuffer);
    lambdaPackage.on('error', (err) => reject(err));

    // Bulk add src folder
    console.log('Packing src folder...');
    lambdaPackage.bulk([{
      cwd: Path.join(rootFolderPath, SETTINGS.SOURCE_FOLDER_NAME),
      dest: SETTINGS.SOURCE_FOLDER_NAME,
      src: ['**/**'],
      expand: true
    }]);

    // Bulk add node_modules folder
    console.log('Packing node modules...');
    lambdaPackage.bulk([{
      cwd: Path.join(rootFolderPath, 'node_modules'),
      dest: 'node_modules',
      src: ['**/**'],
      expand: true
    }]);

    // Done, baby!
    lambdaPackage.finalize();
  })
}

// --------------------------------------
//       AWS Promesified Functions
// --------------------------------------
exports.getLambdaFunction(functionName){
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

exports.createFunction(lambdaFunction){
  var params = {
    Publish: false,
    Code: { ZipFile: lambdaFunction.codeBuffer },
    FunctionName: lambdaFunction.functionName,
    Role: SETTINGS.LAMBDA_EXECUTION_ROLE,
    Handler: lambdaFunction.default.Handler,
    Runtime: lambdaFunction.default.Runtime,
    Description: lambdaFunction.default.Description,
    MemorySize: lambdaFunction.default.MemorySize,
    Timeout: lambdaFunction.default.Timeout,
  };

  return new Promise((resolve, reject) => {
    lambda.createFunction(params,
      (err, data) => {
        if (err)
          reject(err);
        else
          resolve(data);
    });
  });
}

exports.updateFunctionCode(lambdaFunction){
  var params = {
    Publish: false,
    FunctionName: lambdaFunction.functionName,
    ZipFile: lambdaFunction.codeBuffer,
  };

  return new Promise((resolve, reject) => {
    lambda.updateFunctionCode(params,
      (err, data) => {
        if (err)
          reject(err);
        else
          resolve(data);
    });
  });
}

exports.updateFunctionConfiguration(lambdaFunction){
  var params = {
    FunctionName: lambdaFunction.functionName,
    Handler: lambdaFunction.default.Handler,
    Role: SETTINGS.LAMBDA_EXECUTION_ROLE,
    Description: lambdaFunction.default.Description,
    MemorySize: lambdaFunction.default.MemorySize,
    Timeout: lambdaFunction.default.Timeout,
  };

  return new Promise((resolve, reject) => {
    lambda.updateFunctionConfiguration(params,
      (err, data) => {
        if (err)
          reject(err);
        else
          resolve(data);
    });
  });
}
