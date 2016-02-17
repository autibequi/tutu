var Fs = require('fs');
var Path = require('path')
var Finder = require('fs-finder')
var dataProcess = require('./dataProcess')
var SETTINGS = require('./settings.js').constants

// --------------------------------------
//             Aux Functions
// --------------------------------------
// Get the rootFolder absolute path of the project.
// The rootFolder is defined by the tutufile.json path
exports.getRootFolder = () => {
    var configFilePath = Finder.in(process.cwd())
                               .lookUp(process.env.HOME)
                               .findFiles(SETTINGS.CONFIG_FILENAME);
    return Path.dirname(configFilePath[0])
}
