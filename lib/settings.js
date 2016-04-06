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
    'POINTLESS_FILENAME': 'pointless.json',
    'APIGATEWAY_REST_API': '',
    'TEMP_FOLDER_NAME': 'dist',
    'UNIFIED_LAMBDA_NAME': 'unifiedLambda',
    'LAMBDA_EXECUTION_ROLE': '',
    'PROJECT_PREFIX': 'dev_',
    'API_GATEWAY_EXECUTION_ROLE': '',
    'AWS_ACCOUNT': '',
    'API_RETRY_LIMIT': 20,
    'TIMEOUT': 1000,
    'STAGE_NAME': 'dev_',
    'DEBUG_MODE': false,
    'RETRIER_LOG_MODE': false,
}

// Load Env Settings
env = {
    'REGION': process.env.TUTU_REGION,
    'APIGATEWAY_REST_API': process.env.TUTU_APIGATEWAY_REST_API_ID,
    'LAMBDA_EXECUTION_ROLE': process.env.TUTU_LAMBDA_EXECUTION_ROLE,
    'API_GATEWAY_EXECUTION_ROLE': process.env.TUTU_API_GATEWAY_EXECUTION_ROLE,
    'AWS_ACCOUNT': process.env.TUTU_AWS_ACCOUNT,
    'STAGE_NAME': process.env.TUTU_STAGE_NAME,
    'DEFAULT_SEC_GROUP_IDS': process.env.TUTU_VPC_SEC_GROUPS,
    'DEFAULT_SUBNET_IDS': process.env.TUTU_VPC_SUBNETS,
    'RETRIER_LOG_MODE': process.env.TUTU_RETRIER_LOG_MODE,
    'DEBUG_MODE': process.env.TUTU_DEBUG_MODE,
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

// Export Settings constants
module.exports = misc.mergeObjects(DEFAULT, ENVIRONMENT, TUTU)
