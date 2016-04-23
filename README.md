# tutu
A simple deployer for APIs made with AWS ApiGateway and AWS Lambda.

###### Disclame
This method of deployment is deprecated. Amazon added support to directly import swagger files to the APIGateway which is a way faster way to deploy.

## Features
* Automatically creates and upload Lambda packages
* Unified or Standalone
* Local Lambda test
* VPC support
* Automagically adds CORS
* Lambda resource based permission

## Setting Up
Before running any command you must have 2 files on the root folder of your project:

### endpoint.json
This file contains the API definition. Check docs/endpoints_example.json on this repository for further reference.

### tutu.json
This file contains the variables configurations of the project. You can leave this empty if you are using Environment Variables.

You must define thoses constants:
* AWS_ACCOUNT
* REGION
* SOURCE_FOLDER_NAME
* APIGATEWAY_REST_API
* LAMBDA_EXECUTION_ROLE

## Commands
### API Deployment
Deploys the configured API
```
$ tutu deploy
```

### Purge And Deploy
Purge an API and then deploys it. (Recommended)
```
$ tutu purgeAndDeploy
```

### Locally running Lambdas
Inside the desired lambda function folder run:
```
$ tutu run {method}
```
You must define the method that you are running

## How it works

Tutu is simple, it first creates an JSON object with almost all the information needed before creating a deploying it to APIGateway then a series of promisified AWS-SDK calls use these information to make the necessary request to amazon and create the API. Those calls also inject the lacking information in this object.

### Basic Structures

The basic structure used is a Endpoint. Each endpoint is composed of a Lambda function reference, a APIGateway resource and a method.

The second main structure is the method itself. The method is composed of a method request object, a method integration object, a method integration response object and a response object. The build of those objects can be found better explained on the AWS Documentation.

### Deploy Flow

First a lambda must be deployed and and return a ARN reference then APIGateway first is created, example, /v1/hello.

After that each method for this resource will be deployed pointing the resource method to the specified lambda function. This process is repeated for each resource of the resource tree.

### Defaults

To avoid repetition Tutu use the idea of default values. Those are such as default response and lambda that will be used in the deployment of a method if no other is specified.
