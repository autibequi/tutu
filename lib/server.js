// local testing server
//Lets require/import the HTTP module
var http = require('http');
var aux = require('./aux.js')
var Path = require('path')
var Url  = require('url');
var Misc = require('./misc.js')

//Lets define a port we want to listen to
const PORT = 8080;
const BULLET = '>>';
const unifiedIndex = Path.join(aux.getRootFolder(),
                               'aws_modules',
                               'index.js')

// Load Unified
var unifiedLambda = require(unifiedIndex)

// Handle server requests
handleRequest = (request, response) => {
  // Creates event
  var event = buildEvent(request)
  // Create context
  var context = buildContextHandler(response)
  // Dispatch event and context to the handler
  // TODO: check if the requested function is standalone
  // and redirect to the index.js of that function 
  return unifiedLambda.handler(event, context)
}

// Creates a server
http.createServer(handleRequest).listen(PORT, () => {
    console.log("Server listening on: http://localhost:%s", PORT);
});

// --------------------------------------
//                Builders
// --------------------------------------
buildEvent = (request) => {
  var parsedUrl = Url.parse(request.url, true)
  var event = {
    endpoint: parsedUrl.pathname,
    method: request.method,
    data: request.body,
  }
  return Misc.mergeObjects(event, parsedUrl.query)
}

buildContextHandler = (response) => {
  return {
    succeed: (result) => {
      console.log()
      console.log(BULLET, 'SUCCESS:', JSON.stringify(result));
      buildResponse(event, result, response)
      response.end(JSON.stringify(result))
    },
    fail: (result) => {
      console.log()
      console.log(BULLET, 'FAIL:', JSON.stringify(result));
      buildResponse(event, result, response)
      response.end(JSON.stringify(result))
    },
    done: (err, result) => {
      console.log()
      console.log(BULLET, 'DONE ERR:', JSON.stringify(err));
      console.log(BULLET, 'DONE RES:', JSON.stringify(result));
      buildResponse(event, result, response)
      response.end(JSON.stringify(result))
    },
  }
}

// Builds the response using apigateway configuration of the desired endpoint
// This will inject the headers and everthing else
buildResponse = (event, result, response) => {

}
