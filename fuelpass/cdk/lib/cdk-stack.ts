import * as cdk from 'aws-cdk-lib';
import { CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { AuthorizationType, CognitoUserPoolsAuthorizer, Cors, LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { join } from 'path';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket that serves the frontend website
    const bucket = new Bucket(this, 'WebsiteBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true
    });

    // S3 deployment
    new BucketDeployment(this, 'BucketDeployment', {
      sources: [Source.asset('../build')],
      destinationBucket: bucket,
    });

    // Create cloudfront distribution
    const distribution = new Distribution(this, 'CloudFrontDistribution', {
      defaultBehavior: { origin: new S3Origin(bucket) },
    });

    // CreateAuthChallenge lambda
    const createAuthChallengeLambda = new NodejsFunction(this, 'CreateAuthChallengeLambda', {
      entry: join(__dirname, `../functions/createAuthChallenge/handler.js`),
      runtime: Runtime.NODEJS_14_X,
      handler: "handler",
      bundling: {
        externalModules: [
          'aws-sdk'
        ]
      }
    });

    // Create a permission policy statement
    const snsPublishPolicy = new PolicyStatement({
      actions: ['sns:Publish'],
      resources: ['*'],
    });

    // Attach the permission policy to the Lambda function role 
    createAuthChallengeLambda.role?.attachInlinePolicy(
      new Policy(this, 'sns-publish-policy', {
        statements: [snsPublishPolicy]
      })
    );

    // VerifyAuthChallengeResponse lambda
    const verifyAuthChallengeResponseLambda = new NodejsFunction(this, 'VerifyAuthChallengeResponseLambda', {
      entry: join(__dirname, `../functions/verifyAuthChallengeResponse/handler.js`),
      runtime: Runtime.NODEJS_14_X,
      handler: "handler"
    });

    // PreSignUp lambda
    const preSignUpLambda = new NodejsFunction(this, 'PreSignUpLambda', {
      entry: join(__dirname, `../functions/preSignUp/handler.js`),
      runtime: Runtime.NODEJS_14_X,
      handler: "handler"
    });

    // DefineAuthChallenge lambda
    const defineAuthChallengeLambda = new NodejsFunction(this, 'DefineAuthChallengeLambda', {
      entry: join(__dirname, `../functions/defineAuthChallenge/handler.js`),
      runtime: Runtime.NODEJS_14_X,
      handler: "handler"
    });

    // Cognito userpool
    const userPool = new UserPool(this, 'UserPool', {
      selfSignUpEnabled: true,
      signInAliases: {
        phone: true
      },
      standardAttributes: {
        phoneNumber: { required: true, mutable: true }
      },
      lambdaTriggers: {
        defineAuthChallenge: defineAuthChallengeLambda,
        createAuthChallenge: createAuthChallengeLambda,
        verifyAuthChallengeResponse: verifyAuthChallengeResponseLambda,
        preSignUp: preSignUpLambda
      }
    });

    // Cognito userpool web client
    const userPoolWebClient = userPool.addClient('UserPoolWebClient', {
      authFlows: { custom: true }
    });

    // User dynamodb table
    const userTable = new Table(this, "UserTable", {
      partitionKey: { name: "id", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // User profile lambda
    const userProfileLambda = new NodejsFunction(this, 'UserProfileLambda', {
      entry: join(__dirname, `../functions/userProfile/handler.js`),
      runtime: Runtime.NODEJS_14_X,
      handler: "handler",
      environment: {
        USER_TABLE_NAME: userTable.tableName,
      },
    });
    userTable.grantReadWriteData(userProfileLambda);

    // UserPool Authorizer
    const userPoolAuthorizer = new CognitoUserPoolsAuthorizer(this, 'UserPoolAuthorizer', {
      cognitoUserPools: [userPool]
    });

    // REST API with ApiGateway for user profile management
    const userProfileAPI = new LambdaRestApi(this, "UserProfileAPI", {
      restApiName: "Fuelpass API",
      handler: userProfileLambda,
      proxy: false,
      defaultMethodOptions: {
        authorizationType: AuthorizationType.COGNITO,
        authorizer: userPoolAuthorizer
      },
      defaultCorsPreflightOptions: {
        allowOrigins: ["*"],
        allowMethods: Cors.ALL_METHODS
      }
    });

    // Create user path: /users
    const users = userProfileAPI.root.addResource("users");
    users.addMethod("POST");

    // Get user and update user paths: /users/{userId}
    const singleUser = users.addResource("{userId}");
    singleUser.addMethod("GET");
    singleUser.addMethod("PUT");

    // Outputs
    new CfnOutput(this, 'CloudFrontDomain', {
      value: distribution.distributionDomainName
    })

    new CfnOutput(this, 'CloudFrontId', {
      value: distribution.distributionId
    })
  }
}
