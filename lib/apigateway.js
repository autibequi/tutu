'use strict'
let SETTINGS = require('./settings.js')
let dataProcess = require('./dataProcess.js')
let apigateway = require('./AWS/apigateway.js')

// --------------------------------------
//            AWS Aux Functions
// --------------------------------------
// Delete all resources that have the the rootResource as
// Its parent resource
exports.purgeApi = () => {
  console.log('Purging API');
  return apigateway.getAllResources()
    .then((resources) => {
      let toDeleted = []
      resources.forEach((resource) => {
        if (resource.path.split('/').length == 2 && resource.path != '/')
          toDeleted.push(apigateway.deleteResource(resource))
      })
      console.log('Purging', toDeleted.length, 'root child resources.');
      return Promise.all(toDeleted)
    })
}



// Get all resources and select the one with a specific path
exports.getResourceByPath = (path) => {
  return apigateway.getAllResources()
    .then((data) => {
      console.log('Getting Resource with path:', path);
      let result
      data.forEach((resource) => {
        if(resource.path == path)
          result = resource;
      })
      return result
    })
}

// Tries to create the resource
// if it fails tries to find and return the resource id
exports.createOrGetResource = (resource) => {
  return apigateway.createResource(resource).
    catch((err) => {
      if(err.code == 'ConflictException'){
        console.log(err)
        console.log(err.message)
        let resource_id = err.message.match(/'([^']*)'/)[0].replace(/'/g, '')
        console.log('rescurso id', resource_id)
        resource.id = resource_id
        return resource
      }

      throw err
    })
}
