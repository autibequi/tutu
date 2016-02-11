var Fs = require('fs')
var Finder = require('fs-finder')
var misc = require('./misc.js')

// --------------------------------------
//            Settings Builder
// --------------------------------------
// This file build the settings using the default configuration
// and overriding it with data from the current ENV and tutu.json
// configuration file

// Load Default Settings
DEFAULT = {
    'REGION': 'us-east-1',
    'CONFIG_FILENAME': 'tutu.json',
    'SOURCE_FOLDER_NAME': 'src',
    'LIB_FOLDER_NAME': 'lib',
    'ENDPOINTS_FILENAME': 'endpoints.json',
    'APIGATEWAY_REST_API': '',
    'TEMP_FOLDER_NAME': 'dist',
    'UNIFIED_LAMBDA_PACKAGE_NAME': 'unified.zip',
    'LAMBDA_EXECUTION_ROLE': '',
    'API_GATEWAY_EXECUTION_ROLE': '',
}

// Load Env Settings
env = {
    'REGION': process.env.TUTU_REGION,
    'APIGATEWAY_REST_API': process.env.TUTU_APIGATEWAY_REST_API_ID,
    'LAMBDA_EXECUTION_ROLE': process.env.TUTU_LAMBDA_EXECUTION_ROLE,
    'API_GATEWAY_EXECUTION_ROLE': process.env.TUTU_API_GATEWAY_EXECUTION_ROLE,
}

// Remove empty ENV vars
ENVIRONMENT = {}
for (key in env)
  if (env[key] != undefined)
    ENVIRONMENT[key] = env[key]

// Load Tutu File Settings
var tutuFilePath = Finder.in(process.cwd())
                           .lookUp(process.env.HOME)
                           .findFiles(DEFAULT.CONFIG_FILENAME)[0]

var TUTU = JSON.parse(Fs.readFileSync(tutuFilePath, 'utf8'))

exports.constants = misc.mergeObjects(DEFAULT, ENVIRONMENT, TUTU)
