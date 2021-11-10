# 🏗 Scaffold-ETH

> everything you need to build on Ethereum! 🚀

# Login with Ethereum, Scaffold-Eth, and Serverless

## Intro

The topic of 'Login with Ethereum' came up during Vitalik's talk at EthCC.https://youtu.be/oLsb7clrXMQ?t=1450

![](https://i.imgur.com/DHWDbcb.jpg)

I wanted to demonstrate how easy this is to implement in practice using a serverless backend and a simple web3 enabled frontend.

This guide demonstrates how to integrate 'log in with Ethereum' with a serverless API on AWS.

The front end is based on Scaffold-ETH.



https://user-images.githubusercontent.com/4401444/127770033-506de912-243b-4d8d-8e62-0a186733a0d9.mov



### How it works

The API implements a challenge response pattern to confirm the use controls the specified Ethereum address.

1. User requests a challenge from the API

2. The API stores the challenge and retuns it to the user

3. The user signs the challenge and returns it to the API

4. The API validates the signature. If the signature is valid, it signs a JWT and returns it to the user

The JWT can be used for subsequent authenticated requests until it expires.

## Hands on

### Prerequesites

* AWS Account with console and programmatic access
* A domain name registered with AWS
* Local AWS credentials profile
* node version 14

### Install dependencies

Run `yarn install` in the root directory

### Populate credentials file

`./aws/credentials`

```
[scaffold-eth]
aws_access_key_id = YOUR_KEY_ID
aws_secret_access_key = YOUR_SECRET_KEY

```


### Deploy the infra

`npm run deploy`

```
> infrastructure@0.1.0 deploy /Users/isaacpatka/experiments/web3-serverless-auth/scaffold-eth/packages/serverless-infrastructure
> sst deploy

Preparing @serverless-stack/resources
Linting source
=============


Detected tsconfig.json
Compiling TypeScript
Deploying stacks
dev-scaffold-eth-infra-dynamodb: deploying...
Checking deploy status...
dev-scaffold-eth-infra-dynamodb | CREATE_IN_PROGRESS | AWS::CloudFormation::Stack | dev-scaffold-eth-infra-dynamodb
dev-scaffold-eth-infra-dynamodb | CREATE_IN_PROGRESS | AWS::CDK::Metadata | CDKMetadata
dev-scaffold-eth-infra-dynamodb | CREATE_IN_PROGRESS | AWS::DynamoDB::Table | TableCD117FA1
dev-scaffold-eth-infra-dynamodb | CREATE_IN_PROGRESS | AWS::DynamoDB::Table | TableCD117FA1
dev-scaffold-eth-infra-dynamodb | CREATE_IN_PROGRESS | AWS::CDK::Metadata | CDKMetadata
dev-scaffold-eth-infra-dynamodb | CREATE_COMPLETE | AWS::CDK::Metadata | CDKMetadata
Checking deploy status...
Checking deploy status...
Checking deploy status...
Checking deploy status...
Checking deploy status...
dev-scaffold-eth-infra-dynamodb | CREATE_COMPLETE | AWS::DynamoDB::Table | TableCD117FA1
dev-scaffold-eth-infra-dynamodb | CREATE_COMPLETE | AWS::CloudFormation::Stack | dev-scaffold-eth-infra-dynamodb

 ✅  dev-scaffold-eth-infra-dynamodb


Stack dev-scaffold-eth-infra-dynamodb
  Status: deployed
  Outputs:
    TableName: dev-scaffold-eth-infra-dynamodb-TableCD117FA1-1L2JMCWHF9JYK
    TableArn: arn:aws:dynamodb:us-east-1:ACCOUNT_ID:table/dev-scaffold-eth-infra-dynamodb-TableCD117FA1-1L2JMCWHF9JYK
  Exports:
    dev-scaffold-eth-infra-TableName: dev-scaffold-eth-infra-dynamodb-TableCD117FA1-1L2JMCWHF9JYK
    dev-scaffold-eth-infra-TableArn: arn:aws:dynamodb:us-east-1:ACCOUNT_ID:table/dev-scaffold-eth-infra-dynamodb-TableCD117FA1-1L2JMCWHF9JYK

```


![](https://i.imgur.com/QiW3igj.png)

## Deploy the API

### Request a certificate

![](https://i.imgur.com/d6Naabq.png)

### Create the custom API Gateway domain

`npx serverless create_domain`

```
Serverless: DOTENV: Loading environment variables from .env:
Serverless: 	 - JWT_SECRET
Serverless: 	 - SLS_DEBUG
Serverless: 	 - JWT_EXPIRATION_TIME
Serverless: Load command create_domain
Serverless: Load command delete_domain
Serverless: Load command login
Serverless: Load command logout
Serverless: Load command generate-event
Serverless: Load command test
Serverless: Load command dashboard
Serverless: Load command output
Serverless: Load command output:get
Serverless: Load command output:list
Serverless: Load command param
Serverless: Load command param:get
Serverless: Load command param:list
Serverless: Load command studio
Serverless: Invoke create_domain
Serverless Domain Manager: Error:  dev.ext-api.scaffoldeth.xyz does not exist
Serverless Domain Manager: Info: Custom domain dev.ext-api.scaffoldeth.xyz was created.
New domains may take up to 40 minutes to be initialized.
```

### Deploy

`npx serverless deploy`

```
Service Information
service: scaffold-eth-api
stage: dev
region: us-east-1
stack: scaffold-eth-api-dev
resources: 34
api keys:
  None
endpoints:
  OPTIONS - https://l1nnhoyail.execute-api.us-east-1.amazonaws.com/{proxy+}
  GET - https://l1nnhoyail.execute-api.us-east-1.amazonaws.com/v1/sessions
  POST - https://l1nnhoyail.execute-api.us-east-1.amazonaws.com/v1/sessions
  GET - https://l1nnhoyail.execute-api.us-east-1.amazonaws.com/v1/helloAuth
functions:
  defaultCORS: scaffold-eth-api-dev-defaultCORS
  nonce: scaffold-eth-api-dev-nonce
  login: scaffold-eth-api-dev-login
  helloAuth: scaffold-eth-api-dev-helloAuth
  authorize: scaffold-eth-api-dev-authorize
layers:
  None
Serverless Domain Manager: Info: Found apiId: l1nnhoyail for dev.ext-api.scaffoldeth.xyz
Serverless Domain Manager: Info: Created API mapping 'app' for dev.ext-api.scaffoldeth.xyz
Serverless Domain Manager: Summary: Distribution Domain Name
Serverless Domain Manager:    Domain Name: dev.ext-api.scaffoldeth.xyz
Serverless Domain Manager:    Target Domain: d-0nxko42bib.execute-api.us-east-1.amazonaws.com
Serverless Domain Manager:    Hosted Zone Id: YOUR_HOSTED_ZONE
Serverless: Invoke aws:deploy:finalize
```

### Test out the nonce challenge

`GET https://dev.ext-api.scaffoldeth.xyz/app/v1/sessions?PublicAddress=0x83BC06079538264Cc18829c5534387c69820A4E6`

![](https://i.imgur.com/di0RXfg.png)


### Test an authenticated endpoint

`GET https://dev.ext-api.scaffoldeth.xyz/app/v1/helloAuth`

![](https://i.imgur.com/UvznWme.png)

## Test out the front end

#### Start the app with `yarn react-app:start`

#### Navigate to `Example Authentication`

![](https://i.imgur.com/XFCO1yP.png)

#### Log in (signs a challenge in the background)

![](https://i.imgur.com/2UcFEqs.png)

#### Try decoding the JWT and see what it contains


This shows that we are given an auth token for the address specified, and the token expires in 30 minutes

![](https://i.imgur.com/dhAv8h9.png)

#### Test the authenticated endpoint


![](https://i.imgur.com/3VrVUw7.png)

