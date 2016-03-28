exports.status = (text) =>
  console.log("|| STATUS >>>>>>>", text)

exports.info = (text) =>
  console.log("|| INFO >>>>>>>", text, '\n')

exports.debug = (lib, functionName, params, err, data) => {
  console.log('|| Lib:          ', lib)
  console.log('|| Function Name:', functionName)
  console.log('|| Parameters:   ', params)
  console.log('|| Error:        ', err)
  console.log('|| Data:         ', data)
  console.log('\n')
}
