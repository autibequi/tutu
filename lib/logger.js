var SETTINGS = require('./settings.js')

exports.status = (text) =>
  console.log("<**> STATUS:", text)

exports.info = (text) =>
  console.log("INFO >>>>>>>", text, '\n')

exports.debug = (lib, functionName, params, err, data) => {
  if(SETTINGS.DEBUG_MODE == true){
    console.log('')
    console.log('------------------')
    console.log('|| API CALL DEBUG:')
    console.log('|| Lib:          ', lib)
    console.log('|| Function Name:', functionName)
    console.log('|| Parameters:   ', params)
    if (err)
      console.log('|| Error:        ', '\n', err)
    if (data)
      console.log('|| Data:         ', '\n', data)
    console.log('------------------')
    console.log('')
  }
}
