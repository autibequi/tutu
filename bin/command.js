#!/usr/bin/env node
var tutu = require('./index.js')

// Checks if any argument was provided
if (!process.argv[2]){
  console.log('Run "tutu help" for command list')
  process.exit(1)
}

// switch to the correct option
switch(process.argv[2]) {
  case 'purgeAndDeploy':
    tutu.purgeAndDeploy().then(display)
    break
  case 'deploy':
    tutu.deploy().then(display)
    break
  case 'deployStandalone':
    tutu.deployStandaloneLambdas().then(display)
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

// Display Deployment Result
var display = Promise.resolve()
  .then((data) => console.log(data))
  .catch((err) => {
    console.log(err.stack)
    process.exit(1)
  })
