#!/usr/bin/env node
'use strict'
let tutu = require('./index.js')
let logger = require('../lib/logger.js')
let aux = require('../lib/aux.js')

// Checks if any argument was provided
if (!process.argv[2]){
  console.log('Run "tutu help" for command list')
  process.exit(1)
}

// switch to the correct option
switch(process.argv[2]) {
  case 'purgeAndDeploy':
    tutu.purgeAndDeploy()
        .then(aux.displaySuccess)
        .catch(aux.displayError)
    break
  case 'deploy':
    tutu.deploy()
        .then(aux.displaySuccess)
        .catch(aux.displayError)
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
                'run               - Test current folder function\n' +
                '-------------------------------------------------')
    break
  default:
    console.log('Bad argument. \n' +
                'Run "tutu help" for command list');
    process.exit(1)
    break
}
