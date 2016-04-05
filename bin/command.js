#!/usr/bin/env node
'use strict'
let tutu = require('./index.js')
let logger = require('../lib/logger.js')
// Checks if any argument was provided
if (!process.argv[2]){
  console.log('Run "tutu help" for command list')
  process.exit(1)
}

// switch to the correct option
switch(process.argv[2]) {
  case 'purgeAndDeploy':
    tutu.purgeAndDeploy()
      .then((data) => {
        console.log('Deployment Finished');
        console.log(data)
        console.log('-------------------');
      })
      .catch((err) => {
        console.log('Deployment Error');
        console.log(err)
        console.log(err.stack)
        process.exit(1)
      })
    break
  case 'deploy':
    tutu.deploy()
      .then((data) => {
        console.log('Deployment Finished');
        console.log(data)
        console.log('-------------------');
      })
      .catch((err) => {
        console.log('Deployment Error');
        console.log(err)
        console.log(err.stack)
        process.exit(1)
      })
    break
  case 'deployStandalone':
    tutu.deployStandaloneLambdas()
    break
  case 'runserver':
    require('../lib/server.js')
    break
  case 'run':
    require('./runner.js')
    break
  case 'help':
    console.log('-------------------------------------------------\n' +
                '|                    Help                       |\n' +
                '-------------------------------------------------\n' +
                'deploy            - Deploy API\n' +
                'purgeAndDeploy    - Purge and Deploy API\n' +
                'deployStandalone  - Deploy Standalone Lambdas\n' +
                'runserver         - Run ApiGateway local emulator\n' +
                'run               - Test current folder function\n' +
                '-------------------------------------------------')
    break
  default:
    console.log('Bad argument. \n' +
                'Run "tutu help" for command list');
    process.exit(1)
    break
}
