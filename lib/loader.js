var Fs = require('fs')
var SETTINGS = require('./settings.js')
var aux = require('./aux.js')
var logger = require('./logger.js')

exports.standaloneConfiguration = () => {
  logger.status('Loading standalone file');
  return new Promise((resolve, reject) => {
    var pointlessFilePath = aux.getRootFolder() + '/' + SETTINGS.POINTLESS_FILENAME
    var data = JSON.parse(Fs.readFileSync(pointlessFilePath, 'utf8'))
    resolve(data)
  })
}
