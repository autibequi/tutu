var SETTINGS = require('./settings.js').constants

// --------------------------------------
//            Data Processors
// --------------------------------------
// Create a Lambda URI
exports.buildLambdaURI = (lambdaARN) => {
  return 'arn:aws:apigateway:' + SETTINGS.REGION +
                             ':lambda:path/2015-03-31/functions/' + lambdaARN +
                             '/invocations';
}
