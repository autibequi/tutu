var AWS = require('aws-sdk')
var apigateway = new AWS.APIGateway({region: 'us-east-1'})
var SETTINGS = require('./settings.js').constants

// --------------------------------------
//            AWS Aux Functions
// --------------------------------------
// Delete all resources that have the the rootResource as
// Its parent resource
exports.purgeApi = () => {
  console.log('Purging API');
  return exports.getAllResources()
    .then((resources) => {
      var toDeleted = []
      resources.forEach((resource) => {
        if (resource.path.split('/').length == 2 && resource.path != '/')
          toDeleted.push(exports.deleteResource(resource))
      })
      console.log('Purging', toDeleted.length, 'root child resources.');
      return Promise.all(toDeleted)
    })
}

exports.getAllResources = () => {
  return new Promise((resolve, reject) => {
    params = {
      restApiId: SETTINGS.APIGATEWAY_REST_API,
      limit: 500
    }
    apigateway.getResources(params, (err, data) => {
      if (err)
        reject(err)
      else
        resolve(data.items.map((resource) => {
          resource.restApiId = SETTINGS.APIGATEWAY_REST_API
          return resource
        }))
    })
  })
}

// Get all resources and select the one with a specific path
exports.getResourceByPath = (path) => {
  return exports.getAllResources()
    .then((data) => {
      console.log('Getting Resource with path:', path);
      var result
      data.forEach((resource) => {
        if(resource.path == path)
          result = resource;
      })
      return result
    })
}

// --------------------------------------
//  Promesified AWS ApiGateway Functions
// --------------------------------------
exports.getAllResources = () => {
  return new Promise((resolve, reject) => {
    params = {
      restApiId: SETTINGS.APIGATEWAY_REST_API,
      limit: 500
    }
    apigateway.getResources(params, (err, data) => {
      if (err)
        reject(err)
      else
        resolve(data.items.map((resource) => {
          resource.restApiId = SETTINGS.APIGATEWAY_REST_API
          return resource
        }))
    })
  })
}

exports.deleteResource = (resource) => {
  var params = {
    resourceId: resource.id,
    restApiId: resource.restApiId
  };
  return new Promise((resolve, reject) => {
    apigateway.deleteResource(params,
      (err, data) => {
        if (err)
          reject(err)
        else
          resolve(data)
    });
  })
}
