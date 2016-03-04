var Archiver = require('archiver');
var SETTINGS = require('./settings.js').constants
var aux = require('./aux.js')
var Fs = require('fs')
var Path = require('path')

// --------------------------------------
//         Unified Package Builder
// --------------------------------------
// Build a unified lambda package and returns a
// buffer of this file
exports.buildUnifiedLambdaFunction = () => {
  return new Promise((resolve, reject) => {
    // Build some folder absolute paths
    var rootFolderPath = aux.getRootFolder()
    var distFolderPath = Path.join(rootFolderPath,
                                   SETTINGS.TEMP_FOLDER_NAME)
    var packagePath = Path.join(distFolderPath,
                                SETTINGS.STAGE_NAME + '_' +
                                SETTINGS.UNIFIED_LAMBDA_NAME + '.zip')
    var packagejson = JSON.parse(Fs.readFileSync(Path.join(rootFolderPath, 'package.json'), 'utf8'))

    // Open Package File Buffer
    var outputBuffer = Fs.createWriteStream(packagePath);

    // Initiate Archiver
    var lambdaPackage = Archiver('zip')
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
        console.log('Package Build, sending to lambda deployer');
        var endpointsFilePath = aux.getRootFolder() + '/' + SETTINGS.ENDPOINTS_FILENAME
        var tutufile = JSON.parse(Fs.readFileSync(endpointsFilePath, 'utf8'))
        if (SETTINGS.DEFAULT_SUBNET_IDS)
          var vpcSubnets = SETTINGS.DEFAULT_SUBNET_IDS.replace(' ', '').split(',')
        if (SETTINGS.DEFAULT_SEC_GROUP_IDS)
          var secGroup = SETTINGS.DEFAULT_SEC_GROUP_IDS.replace(' ', '').split(',')
        tutufile.Lambda.VpcConfig = {
          'SecurityGroupIds': secGroup,
          'SubnetIds': vpcSubnets,
        }
        var lambdaFunction = {
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
    var rootFolderPath = aux.getRootFolder()
    var distFolderPath = Path.join(rootFolderPath,
                                   SETTINGS.TEMP_FOLDER_NAME)
    var packageName = resource.Path.replace(/{|}|\//g, '')
    var packagePath = Path.join(distFolderPath,
                                packageName + '.zip')

    // Open Package File Buffer
    var outputBuffer = Fs.createWriteStream(packagePath);

    // Initiate Archiver
    var lambdaPackage = Archiver('zip')
    lambdaPackage.pipe(outputBuffer);
    lambdaPackage.on('error', (err) => reject(err));

    // Bulk add src folder
    console.log('Packing standalonePackage folder...');
    lambdaPackage.bulk([{
      cwd: Path.join(rootFolderPath, SETTINGS.SOURCE_FOLDER_NAME, resource.Path),
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

    // Callback  closing the zipfile
    outputBuffer.on('close',
      (buff) => {
        console.log('Package Build, sending to lambda deployer');
        var endpointsFilePath = aux.getRootFolder() + '/' + SETTINGS.ENDPOINTS_FILENAME
        var tutufile = JSON.parse(Fs.readFileSync(endpointsFilePath, 'utf8'))
        var lambdaFunction = {
          name: packageName,
          default: tutufile.Lambda,
          Handler: Path.join(SETTINGS.SOURCE_FOLDER_NAME, 'index.handler'),
          codeBuffer: Fs.readFileSync(outputBuffer.path),
        }
        resolve(lambdaFunction)
      }
    )

  })
}
