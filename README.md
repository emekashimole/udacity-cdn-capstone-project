# Serverless TODO List Application

For my capstone project in Udacity's Cloud Developer Nanodegree Programme, I built on what was learnt in the serverless course to expand the features of the To-do list application.

# Functionality of the Application

This application allows users to individually manage their to-do list using basic CRUD functionalities. Users can also upload an image as an attachment to a to-do list item. The application processes this image, generates a thumbnail version of it and stores it which can then be fetched when the user views their list. The application also uses a websocket implementation to send messages to existing connections whenever a user uploads an image as an attachment.

## Prerequisites

* <a href="https://manage.auth0.com/" target="_blank">Auth0 account</a>
* <a href="https://github.com" target="_blank">GitHub account</a>
* <a href="https://nodejs.org/en/download/package-manager/" target="_blank">NodeJS</a> version up to 12.xx 
* Serverless 
   * Create a <a href="https://dashboard.serverless.com/" target="_blank">Serverless account</a> user
   * Install the Serverless Framework’s CLI  (up to VERSION=2.21.1). Refer to the <a href="https://www.serverless.com/framework/docs/getting-started/" target="_blank">official documentation</a> for more help.
   ```bash
   npm install -g serverless@2.21.1
   serverless --version
   ```
   * Login and configure serverless to use the AWS credentials 
   ```bash
   # Login to your dashboard from the CLI. It will ask to open your browser and finish the process.
   serverless login
   # Configure serverless to use the AWS credentials to deploy the application
   # You need to have a pair of Access key (YOUR_ACCESS_KEY_ID and YOUR_SECRET_KEY) of an IAM user with Admin access permissions
   sls config credentials --provider aws --key YOUR_ACCESS_KEY_ID --secret YOUR_SECRET_KEY --profile serverless
   ```
   * Install wscat library to test out web socket functionality 
   ```bash
   npm install wscat
   # Use wscat to connect to the application's web socket using the command
   wscat -c WEB_SOCKET_ENDPOINT
   ```

# Frontend

This frontend should work with your serverless application once it is developed, you don't need to make any changes to the code. The only file that you need to edit is the `config.ts` file in the `client` folder. This file configures your client application just as it was done in the course and contains an API endpoint and Auth0 configuration:

```ts
const apiId = '...' API Gateway id
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: '...',    // Domain from Auth0
  clientId: '...',  // Client id from an Auth0 application
  callbackUrl: 'http://localhost:3000/callback'
}
```

# Best Practices

## Logging and Monitoring

The starter code comes with a configured [Winston](https://github.com/winstonjs/winston) logger that creates [JSON formatted](https://stackify.com/what-is-structured-logging-and-why-developers-need-it/) log statements. You can use it to write log messages like this:

```ts
import { createLogger } from '../../utils/logger'
const logger = createLogger('auth')

// You can provide additional information with every log statement
// This information can then be used to search for log statements in a log storage system
logger.info('User was authorized', {
  // Additional information stored with a log statement
  key: 'value'
})
```

Also implemented in the application is AWS X-Ray which helps with distributed tracing, monitoring of performance calls to other serverless components and services.

## IAM Roles Per Function

Instead of defining all permissions under provider/iamRoleStatements, permissions are defined per function in the functions section of the `serverless.yml`. For example:

```yml
functions:
    GetTodos:
        handler:
        iamRoleStatements:
```

## Request Validation

Requests made to the application pass throught inital validation using the `serverless-reqvalidator-plugin`. That way, cost can be saved by only processing valid requests from users.

# How to Run the Application

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless TODO application.

# Postman Collection

An alternative way to test your API, you can use the Postman collection that contains sample requests. You can find a Postman collection in this project.