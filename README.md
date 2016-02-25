[![npm version](https://badge.fury.io/js/tutu.svg)](https://badge.fury.io/js/tutu)

# tutu
A simple deployer for APIs made with AWS ApiGateway and AWS Lambda.

<p align="center">
  <img src="http://vignette4.wikia.nocookie.net/chroniclesofillusion/images/d/d1/Jabberjaw.png/revision/latest?cb=20150118193143s" alt="Tutubarão"/>
</p>

# Features
* Automatically Packages the API
* Unified and Standlone Lambdas for each Apigateway endpoint
* Local Lambda test
* Local Server Emulator
* Lambda VPC support
* Automatically adds an Options method with a mock integration
* Resource based permission to ApiGateway Lambda execution

# Setting Up
Before running any command you must have 2 files on the root folder of your project:

### endpoint.json
This file contains the API definition. Check endpoints.json on this repository for further reference.

### tutu.json
This file contains the variables configurations of the project. You can leave this empty if you are using Environment Variables.

You MUST define this CONSTANTS:
* AWS_ACCOUNT
* REGION
* SOURCE_FOLDER_NAME
* APIGATEWAY_REST_API
* LAMBDA_EXECUTION_ROLE

# Commands
## API Deployment
Deploys the configured API
```
$ tutu deploy
```
## Locally running Lambdas
At desired lambda function folder run:
```
$ tutu run {method}
```
You must define the method that you are running
## Running server emulator
Runs a local server at: localhost:8080
```
$ tutu runserver
```
