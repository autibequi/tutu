#!/usr/bin/env node
var path = require('path');
var BULLET = '>>';

var SETTINGS = require('../lib/settings.js').constants
var aux = require('../lib/aux.js')
var lambda = require(path.join(aux.getRootFolder(), SETTINGS.SOURCE_FOLDER_NAME));


var context = {
  succeed: function lambdaSuccess(obj) {
    console.log()
    console.log(BULLET, 'SUCCESS:', JSON.stringify(obj));
  },
  fail: function lambdaFail(obj) {
    console.log()
    console.log(BULLET, 'FAIL:', JSON.stringify(obj));
  },
  done: function lambdaFail(obj, obj2) {
    console.log()
    console.log(BULLET, 'FAIL:', JSON.stringify(obj, obj2));
  }
}

if (process.argv.length < 4) {
  console.log('Please, pick a metho do run test: (get, post, delete, etc...)');
  process.exit(1)
}

var method = process.argv[3].toLowerCase();
var localPath = process.cwd();
var event = require(path.join(localPath, 'event.json'));

var folders = localPath.split(path.sep);
var awsIndex = folders.lastIndexOf('aws_modules');
var relativePath = folders.slice(awsIndex + 1);

event[method].method = method.toUpperCase();
event[method].path = relativePath.join('/');

lambda.handler(event[method], context);
