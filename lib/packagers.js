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
