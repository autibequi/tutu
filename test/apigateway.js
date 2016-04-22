var assert = require('chai').assert;
var apigateway = require("../lib/AWS/apigateway.js")
var SETTINGS = require("../lib/settings.js")

SETTINGS.TIMEOUT = 1

describe('APIGateway', function() {
  describe('Retrier Function', function () {
    it('Should retry a function until the limit is reached', function (done) {

      var params = {
        value: "test"
      }

      return apigateway.retry(params)
          .then((data) => {
            done('It shouldnt return a non rejected promise')
          })
          .catch((err) => {
            assert.equal(SETTINGS.API_RETRY_LIMIT - 1, err.retryCount);
            done()
          })
    });


    it('Should reject a error code different than specified', function (done) {
      var params = {
        value: "test"
      }

      return apigateway.fail(params)
          .then((data) => {
            done('Shouldnt resolve()')
          })
          .catch((err) => {
            done()
          })
    });

  });
});
