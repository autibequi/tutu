var assert = require('chai').assert;
var misc = require("../lib/misc.js");
var apigateway = require("../lib/AWS/apigateway.js");


var foo = function(item){
  return new Promise((resolve,reject) => {
    if (item == true)
      resolve(item)
    else
      reject(item)
  })
}

describe('MISC Testing', function() {
  describe('Test Promise Mapper', function (done) {
    it('It should complete and not return a catch', function () {

      var dict = {
        array: [true, true, true, true]
      }

      return misc.mapPromises(dict, "array", foo)
          .then((data) => {
            assert.equal(JSON.stringify(dict), JSON.stringify(data));
          })
          .catch((err) => {
            done("shouldnt trow err!")
          })
    });

    it('It shoudl return a err', function (done) {
      var dict = {
        array: [true, true, false, true]
      }

      return misc.mapPromises(dict, "array", foo)
          .then((data) => {
            done('shouldnt have data here!')
          })
          .catch((err) => {
            assert.isOk(true, 'DONE!');
            done()
          })
    });
  });
});


describe('Misc Integration Testing', function() {
  describe('Map Promised used on ApiGateway Retrier', function (done) {
    it('Should loop and make all the requests on order than return an array', function () {

      var dict = {
        array: [{}, {}, {}, {}]
      }

      var ans = {
        array: ['OKAY!', 'OKAY!', 'OKAY!', 'OKAY!']
      }

      return misc.mapPromises(dict, "array", apigateway.okay)
          .then((data) => {
            assert.equal(JSON.stringify(ans), JSON.stringify(data));
          })
          .catch((err) => {
            done("shouldnt trow err!")
          })
    });


  });
});
