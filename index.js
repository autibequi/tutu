var apigateway = require('./lib/apigateway.js')

apigateway.purgeApi()
  .then((data) => console.log(data))
  .catch((err) => console.log(err.stack))
