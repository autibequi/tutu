'use strict'
let AWS = require('aws-sdk')
var SETTINGS = require('../settings.js')
var logger = require('../logger.js')
let apigateway = new AWS.APIGateway({region: SETTINGS.REGION})

exports.getAllResources = () => {
  return new Promise((resolve, reject) => {
    let params = {
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
        if (err)
          reject(err)
        else
          resolve(data)
    });
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
    return retryRequest(err, 'createResource', resource)
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
        if (err)
          reject(err)
        method.retryCount = 0
        resolve(method)
      });
  })
  .catch((err) => {
    return retryRequest(err, 'putMethod', method)
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
    return retryRequest(err, 'putIntegration', method)
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
        if (err) {
          reject(err);
        } else {
          resolve(data)
        }
      }
    );
  })
  .catch((err) => {
    return retryRequest(err, 'putMethodResponse', methodResponse)
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
        if (err) {
          reject(err);
        } else {
          resolve(data)
        }
      }
    );
  })
  .catch((err) => {
    return retryRequest(err, 'putIntegrationResponse', integrationResponse)
  })
}

exports.createDeployment = () => {
  let params = {
    restApiId: SETTINGS.APIGATEWAY_REST_API,
    stageName: SETTINGS.STAGE_NAME,
  }

  return new Promise((resolve, reject) => {
    apigateway.createDeployment(params,
    (err, data) => {
      if (err)
        reject(err)
      else
        resolve(data)
    })
  })
}

// Retrier
var retryRequest = (err, functionName, param) => {
  return new Promise((resolve, reject) => {
    if (param.retryCount == undefined)
      param.retryCount = 0
    param.retryCount++

    if (err.code == 'TooManyRequestsException' &&
        param.retryCount < SETTINGS.API_RETRY_LIMIT) {
      console.log('Retrying', functionName, param.retryCount)
      setTimeout(() => resolve(exports[functionName](param)), SETTINGS.TIMEOUT)
    } else {
      throw err
    }
  })
}
