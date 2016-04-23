'use strict'
let Archiver = require('archiver');
var SETTINGS = require('./settings.js')
let aux = require('./aux.js')
let Fs = require('fs')
let Path = require('path')
let logger = require('./logger.js')
let Misc = require('./misc.js')
var mkdirp = require('mkdirp');

// --------------------------------------
//         Unified Package Builder
// --------------------------------------
// Build a unified lambda package and returns a
// buffer of this file
exports.buildUnifiedLambdaFunction = () => {
  return new Promise((resolve, reject) => {
    // Build some folder absolute paths
    let rootFolderPath = aux.getRootFolder()
    let distFolderPath = Path.join(rootFolderPath,
                                   SETTINGS.TEMP_FOLDER_NAME)
    let packagePath = Path.join(distFolderPath,
                                SETTINGS.STAGE_NAME + '_' +
                                SETTINGS.UNIFIED_LAMBDA_NAME + '.zip')
    let packagejson = JSON.parse(Fs.readFileSync(Path.join(rootFolderPath, 'package.json'), 'utf8'))

    // Open Package File Buffer
    mkdirp.sync(distFolderPath)
    let outputBuffer = Fs.createWriteStream(packagePath);

    // Initiate Archiver
    let lambdaPackage = Archiver('zip')
    lambdaPackage.pipe(outputBuffer);
    lambdaPackage.on('error', (err) => reject(err));

    // Bulk add src folder
    logger.status('Packing', SETTINGS.SOURCE_FOLDER_NAME, 'folder...');
    lambdaPackage.bulk([{
      cwd: Path.join(rootFolderPath, SETTINGS.SOURCE_FOLDER_NAME),
      dest: SETTINGS.SOURCE_FOLDER_NAME,
      src: ['**/**'],
      expand: true
    }]);

    logger.status('Packing Node_Modules folder...');
    lambdaPackage.bulk([{
        cwd: Path.join(rootFolderPath, 'node_modules'),
        dest: Path.join('node_modules'),
        src: ['**/**'],
        expand: true
    }])

    // Done, baby!
    lambdaPackage.finalize();

    // Callback  closing the zipfile
    outputBuffer.on('close',
      (buff) => {
        logger.status('Package Build, sending to lambda deployer');
        let endpointsFilePath = aux.getRootFolder() + '/' + SETTINGS.ENDPOINTS_FILENAME
        let tutufile = JSON.parse(Fs.readFileSync(endpointsFilePath, 'utf8'))

        if (SETTINGS.DEFAULT_SUBNET_IDS && SETTINGS.DEFAULT_SUBNET_IDS){
          let vpcSubnets = SETTINGS.DEFAULT_SUBNET_IDS.replace(' ', '').split(',')
          let secGroup = SETTINGS.DEFAULT_SEC_GROUP_IDS.replace(' ', '').split(',')

          tutufile.Lambda.VpcConfig = {
            'SecurityGroupIds': secGroup,
            'SubnetIds': vpcSubnets,
          }
        }

        let lambdaFunction = {
          name: SETTINGS.STAGE_NAME + '_' +SETTINGS.UNIFIED_LAMBDA_NAME,
          default: tutufile.Lambda,
          Handler: Path.join(SETTINGS.SOURCE_FOLDER_NAME, 'index.handler'),
          codeBuffer: Fs.readFileSync(outputBuffer.path),
        }
        resolve(lambdaFunction)
      }
    )

  })
}

// build a standalone lambda package and function
exports.buildStandaloneLambdaFunction = (resource) => {
  return new Promise((resolve, reject) => {
    // Build some folder absolute paths
    let rootFolderPath = aux.getRootFolder()
    let distFolderPath = Path.join(rootFolderPath,
                                   SETTINGS.TEMP_FOLDER_NAME)
    let packageName = SETTINGS.STAGE_NAME + resource.Path.replace(/{|}|\//g, '')
    let packagePath = Path.join(distFolderPath,
                                packageName + '.zip')

    // Open Package File Buffer
    mkdirp.sync(distFolderPath)
    let outputBuffer = Fs.createWriteStream(packagePath);

    // Initiate Archiver
    let lambdaPackage = Archiver('zip')
    lambdaPackage.pipe(outputBuffer);
    lambdaPackage.on('error', (err) => reject(err));

    // Bulk add src folder
    console.log('Packing', SETTINGS.SOURCE_FOLDER_NAME, 'folder...');
    lambdaPackage.bulk([{
      cwd: Path.join(rootFolderPath, SETTINGS.SOURCE_FOLDER_NAME),
      dest: SETTINGS.SOURCE_FOLDER_NAME,
      src: ['**/**'],
      expand: true
    }]);

    console.log('Packing Node_Modules folder...');
    lambdaPackage.bulk([{
        cwd: Path.join(rootFolderPath, 'node_modules'),
        dest: Path.join('node_modules'),
        src: ['**/**'],
        expand: true
    }])

    // Done, baby!
    lambdaPackage.finalize();

    // Callback  closing the zipfile
    outputBuffer.on('close',
      (buff) => {
        logger.status('Package Build, sending to lambda deployer');
        let endpointsFilePath = aux.getRootFolder() + '/' + SETTINGS.ENDPOINTS_FILENAME
        let tutufile = JSON.parse(Fs.readFileSync(endpointsFilePath, 'utf8'))

        if (SETTINGS.DEFAULT_SUBNET_IDS && SETTINGS.DEFAULT_SUBNET_IDS){
          let vpcSubnets = SETTINGS.DEFAULT_SUBNET_IDS.replace(' ', '').split(',')
          let secGroup = SETTINGS.DEFAULT_SEC_GROUP_IDS.replace(' ', '').split(',')

          tutufile.Lambda.VpcConfig = {
            'SecurityGroupIds': secGroup,
            'SubnetIds': vpcSubnets,
          }
        }

        let lambdaConfig = Misc.mergeObjects(tutufile.Lambda, resource.Lambda)
        let lambdaFunction = {
          name: packageName,
          default: lambdaConfig,
          Handler: Path.join(SETTINGS.SOURCE_FOLDER_NAME, resource.Path, 'index.handler'),
          codeBuffer: Fs.readFileSync(outputBuffer.path),
        }

        resolve(lambdaFunction)
      })
  })
}

// build a standalone lambda package and function
exports.buildMethodLambda = (resource, method) => {
  return new Promise((resolve, reject) => {
    let rootFolderPath = aux.getRootFolder()
    let distFolderPath = Path.join(rootFolderPath,
                                   SETTINGS.TEMP_FOLDER_NAME)
    let packageName = SETTINGS.STAGE_NAME + resource.Endpoint.replace(/{|}|\//g, '') + "_" + method.httpMethod
    let packagePath = Path.join(distFolderPath,
                                SETTINGS.STAGE_NAME + '_' +
                                SETTINGS.UNIFIED_LAMBDA_NAME + '.zip')

    logger.status('Package Build, sending to lambda deployer');
    let endpointsFilePath = aux.getRootFolder() + '/' + SETTINGS.ENDPOINTS_FILENAME
    let tutufile = JSON.parse(Fs.readFileSync(endpointsFilePath, 'utf8'))

    if (SETTINGS.DEFAULT_SUBNET_IDS && SETTINGS.DEFAULT_SUBNET_IDS){
      let vpcSubnets = SETTINGS.DEFAULT_SUBNET_IDS.replace(' ', '').split(',')
      let secGroup = SETTINGS.DEFAULT_SEC_GROUP_IDS.replace(' ', '').split(',')

      tutufile.Lambda.VpcConfig = {
        'SecurityGroupIds': secGroup,
        'SubnetIds': vpcSubnets,
      }
    }

    let lambdaConfig = Misc.mergeObjects(tutufile.Lambda, resource.Lambda, method.Lambda)
    let lambdaFunction = {
      name: packageName,
      default: lambdaConfig,
      Handler: Path.join(SETTINGS.SOURCE_FOLDER_NAME, method.Lambda.Handler),
      codeBuffer: Fs.readFileSync(packagePath),
    }

    resolve(lambdaFunction)
  })
}
