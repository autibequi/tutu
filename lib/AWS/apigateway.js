'use strict'
let AWS = require('aws-sdk')
var SETTINGS = require('../settings.js')
var logger = require('../logger.js')
let apigateway = new AWS.APIGateway({region: SETTINGS.REGION})

// --------------------------------------
//            AWS Aux Functions
// --------------------------------------
// Get all APIGateway Resources
exports.getAllResources = () => {
  return new Promise((resolve, reject) => {
    let params = {
      restApiId: SETTINGS.APIGATEWAY_REST_API,
      limit: 500
    }
    apigateway.getResources(params, (err, data) => {
      logger.debug('ApiGateway', 'getAllResources', params, err, data)
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

// Delete all resources that have the the rootResource as
// Its parent resource
exports.purgeApi = () => {
  logger.status('Purging API');
  return exports.getAllResources()
    .then((resources) => {
      return Promise.all(resources.map((resource) => {
        if (resource.path.split('/').length == 2 && resource.path != '/')
          return exports.deleteResource(resource)
      }))
    })
}

// Get all resources and select the one with a specific path
exports.getResourceByPath = (path) => {
  return exports.getAllResources()
    .then((data) => {
      logger.status('Getting Resource with path: ' + path);
      let result
      data.forEach((resource) => {
        if(resource.path == path)
          result = resource;
      })
      return Promise.resolve(result)
    })
}

// Tries to create the resource
// if it fails tries to find and return the resource id
exports.createOrGetResource = (resource) => {
  return exports.createResource(resource)
    .catch((err) => {
      if(err.code == 'ConflictException') {
        let resource_id = err.message.match(/'([^']*)'/)[0].replace(/'/g, '')
        resource.id = resource_id
        return Promise.resolve(resource)
      }
       return Promise.reject(err)
    })
}

// --------------------------------------
//  Promesified AWS ApiGateway Functions
// --------------------------------------
exports.getAllResources = () => {
  return new Promise((resolve, reject) => {
   let params = {
      restApiId: SETTINGS.APIGATEWAY_REST_API,
      limit: 500
    }
    apigateway.getResources(params, (err, data) => {
      logger.debug('ApiGateway', 'getAllResources', params, err, data)
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
  let params = {
    resourceId: resource.id,
    restApiId: resource.restApiId,
  };
  return new Promise((resolve, reject) => {
    apigateway.deleteResource(params,
      (err, data) => {
        logger.debug('ApiGateway', 'deleteResource', params, err, data)
        if (err)
          reject(err)
        else
          resolve(data)
    });
  })
  .catch((err) => {
    return exports.retryRequest(err, 'deleteResource', resource)
  })
}

exports.createResource = (resource) => {
  let params = {
    restApiId: resource.restApiId,
    parentId: resource.parent.id,
    pathPart: resource.Endpoint,
  };

  return new Promise((resolve, reject) => {
    apigateway.createResource(params,
      (err, data) => {
        logger.debug('ApiGateway', 'createResource', params, err, data)
        if (err)
          reject(err)
        else
        {
          if (!resource.Resources)
            resource.Resources = []
          resource.id = data.id
          resolve(resource)
        }
    });
  })
  .catch((err) => {
    return exports.retryRequest(err, 'createResource', resource)
  })
}

exports.putMethod = (method) => {
  let params = {
    authorizationType: method.authorizationType,
    httpMethod: method.httpMethod,
    resourceId: method.resourceId,
    restApiId: method.restApiId,
    requestParameters: method.requestParameters,
  };

  return new Promise((resolve, reject) => {
    apigateway.putMethod(params,
      (err, data) => {
        logger.debug('ApiGateway', 'putMethod', params, err, data)
        if (err) {
          reject(err);
        } else {
          method.retryCount = 0
          resolve(method)
        }
      });
  })
  .catch((err) => {
    return exports.retryRequest(err, 'putMethod', method)
  })
}

exports.putIntegration = (method) => {
  let params = {
    type: method.type,
    restApiId: method.restApiId,
    resourceId: method.resourceId,
    httpMethod: method.httpMethod,
    requestTemplates: method.requestTemplates,
  };

  // Creates a Mock Integrations if the method is an OPTION
  if(params.type != 'MOCK'){
    params.uri = method.uri
    params.integrationHttpMethod = 'POST'
    params.credentials = method.credentials
  }

  return new Promise((resolve, reject) => {
    apigateway.putIntegration(params,
      (err, data) => {
        logger.debug('ApiGateway', 'putIntegration', params, err, data)
        if (err){
          reject(err);
        } else {
          method.retryCount = 0
          resolve(method)
        }
      }
    );
  })
  .catch((err) => {
    return exports.retryRequest(err, 'putIntegration', method)
  })
}

exports.putMethodResponse = (methodResponse) => {
  let params = {
    httpMethod: methodResponse.httpMethod,
    resourceId: methodResponse.resourceId,
    statusCode: methodResponse.statusCode,
    restApiId: methodResponse.restApiId,
    responseParameters: methodResponse.methodResponseParameters,
  };

  return new Promise((resolve, reject) => {
    apigateway.putMethodResponse(params,
      (err, data) => {
        logger.debug('ApiGateway', 'putMethodResponse', params, err, data)
        if (err) {
          reject(err);
        } else {
          resolve(data)
        }
      }
    );
  })
  .catch((err) => {
    return exports.retryRequest(err, 'putMethodResponse', methodResponse)
  })
}

exports.putIntegrationResponse = (integrationResponse) => {
  let params = {
    httpMethod: integrationResponse.httpMethod,
    resourceId: integrationResponse.resourceId,
    statusCode: integrationResponse.statusCode,
    restApiId: integrationResponse.restApiId,
    responseTemplates: integrationResponse.responseTemplates,
    responseParameters: integrationResponse.integrationResponseParameters,
    selectionPattern: integrationResponse.selectionPattern,
  };

  return new Promise((resolve, reject) => {
    apigateway.putIntegrationResponse(params,
      (err, data) => {
        logger.debug('ApiGateway', 'putIntegrationResponse', params, err, data)
        if (err) {
          reject(err);
        } else {
          resolve(data)
        }
      }
    );
  })
  .catch((err) => {
    return exports.retryRequest(err, 'putIntegrationResponse', integrationResponse)
  })
}

exports.createDeployment = () => {
  let params = {
    restApiId: SETTINGS.APIGATEWAY_REST_API,
    stageName: SETTINGS.STAGE_NAME,
    description: "Tutu deployment",
    stageDescription: "TUTU " + SETTINGS.STAGE_NAME,
  }

  return new Promise((resolve, reject) => {
    apigateway.createDeployment(params,
    (err, data) => {
      logger.debug('ApiGateway', 'createDeployment', params, err, data)
      if (err)
        reject(err)
      else
        resolve(data)
    })
  })
  .catch((err) => {
    return exports.retryRequest(err, 'createDeployment', '')
  })
}

exports.fail = (params) => {
  var err = {
    code: 'wrong code'
  }
  return Promise.reject(err)
    .catch((err) => {
      return exports.retryRequest(err, 'fail', params)
    })
}

exports.retry = (params) => {
  var err = {
    code: 'BadRequestException'
  }
  return Promise.reject(err)
    .catch((err) => {
      err.retryCount = params.retryCount
      return exports.retryRequest(err, 'retry', params)
    })
}

exports.okay = (params) => {
  var err = {
    code: 'TooManyRequestsException'
  }
  console.log(params)
  if (params.retryCount >= 10)
    return Promise.resolve('OKAY!')

  return Promise.reject(err)
    .catch((err) => {
      err.retryCount = params.retryCount
      return exports.retryRequest(err, 'okay', params)
    })
}

exports.compose = (params) => {
  return exports.okay(params)
    .then(() => {
      params.second = true
      delete(params.retryCount)
      return exports.okay(params)
    })
}

// Retrier
exports.retryRequest = function(err, functionName, param) {
  return new Promise((resolve, reject) => {
    if (param.retryCount == undefined)
      param.retryCount = 0
    param.retryCount++

    if ((err.code == 'TooManyRequestsException' ||
         err.code == 'BadRequestException'         ) &&
        param.retryCount < SETTINGS.API_RETRY_LIMIT) {
      logger.retryLog('ApiGateway', functionName, param)
      setTimeout(() => resolve(exports[functionName](param)), SETTINGS.TIMEOUT)
    } else {
      reject(err)
    }
  })
}
