var assert = require('chai').assert;
var apigateway = require("../lib/AWS/apigateway.js")
var SETTINGS = require("../lib/settings.js")

SETTINGS.TIMEOUT = 1

describe('APIGateway retrier', function() {
  describe('retier', function () {
    it('should return a promise', function (done) {

      var params = {
        value: "test"
      }

      return apigateway.okay(params)
          .catch((err) => {
            console.log(err)
            done()
          })
    });


    it('should return a reject', function (done) {
      var params = {
        value: "test"
      }

      return apigateway.fail(params)
          .catch((err) => {
            console.log(err)
            done()
          })
    });

  });
});
