var assert = require('chai').assert;
var dataProcess = require("../lib/dataProcess.js");



describe('APIGateway method JSON setup building', function() {
  describe('buildOptionsResponseParameters', function () {
    it('Should loop all an array of methods and create the right JSON', function () {
      var awsner = {
        "method.response.header.Access-Control-Allow-Origin": "\'*\'",
        "method.response.header.Access-Control-Allow-Headers": "\'Content-Type,X-Amz-Date,Authorization,x-Authorization\'",
        "method.response.header.Access-Control-Allow-Methods": "\'GET,POST\'"
      }

      var resource = {
        "Methods": ["GET", {"httpMethod":"POST", "Lambda": { "Handler": "aws_modules/index.handler" }}]
      }

      var responseParams = dataProcess.buildOptionsResponseParameters(resource)
      assert.equal(JSON.stringify(awsner), JSON.stringify(responseParams));
    });
  });
});
