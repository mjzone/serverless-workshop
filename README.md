## Step 02 - Provisioning CloudFront and S3 with the runtime code

1. Install aws-cdk cli version 2 and typescript globally
``` sh
sudo npm install -g typescript@4.9.3 aws-cdk@2.53.0
```

2. inside the `fuelpass` directory create a new directory called `cdk`. Change directory to the `cdk` and create a new cdk typescript project with the following command
``` sh
cdk init app --language typescript
```

3. Add UserPool and UserPool Client CDK code to the `cdk/lib/cdk-stack.ts` 
```typescript
    ...
    // Cognito userpool
    const userPool = new UserPool(this, 'UserPool', {
      selfSignUpEnabled: true,
      signInAliases: {
        phone: true
      },
      standardAttributes: {
        phoneNumber: { required: true, mutable: true }
      }
    });

    // Cognito userpool web client
    const userPoolWebClient = userPool.addClient('UserPoolWebClient', {
      authFlows: { custom: true }
    });
    ...
  }
}
```

4. Add the Lambda Triggers for the Cognito User Pool. Update `cdk/lib/cdk-stack.ts` the code as follows. 
``` typescript

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
```

5. Create a new folder `functions` inside the `cdk` folder and add the below folders and runtime code for the lambda triggers

6. `cdk/functions/createAuthChallenge/handler.ts` runtime code
```typescript
const AWS = require('aws-sdk');

exports.handler = (event: any, context: any, callback: any) => {
    //Create a random number for otp
    const challengeAnswer = Math.random().toString(10).substr(2, 6);
    const phoneNumber = event.request.userAttributes.phone_number;

    //For Debugging
    console.log(event, context);

    //sns sms
    const sns = new AWS.SNS({ region: 'us-east-1' });
    sns.publish(
        {
            Message: 'Your OTP: ' + challengeAnswer,
            PhoneNumber: phoneNumber,
            MessageStructure: 'string',
            MessageAttributes: {
                'AWS.SNS.SMS.SenderID': {
                    DataType: 'String',
                    StringValue: 'AMPLIFY',
                },
                'AWS.SNS.SMS.SMSType': {
                    DataType: 'String',
                    StringValue: 'Transactional',
                },
            },
        },
        function (err: any, data: any) {
            if (err) {
                console.log(err.stack);
                console.log(data);
                return;
            }
            console.log(`SMS sent to ${phoneNumber} and otp = ${challengeAnswer}`);
            return data;
        }
    );

    //set return params
    event.response.privateChallengeParameters = {};
    event.response.privateChallengeParameters.answer = challengeAnswer;
    event.response.challengeMetadata = 'CUSTOM_CHALLENGE';

    callback(null, event);
};
```

7. `cdk/functions/defineAuthChallenge/handler.ts` runtime code
```typescript
    exports.handler = (event:any, context:any) => {
    // No existing cognito session
    if (event.request.session.length === 0) {
        event.response.issueTokens = false;
        event.response.failAuthentication = false;
        event.response.challengeName = 'CUSTOM_CHALLENGE';
    }
    // Existing cognito session is available
    else if (
        event.request.session.length === 1 &&
        event.request.session[0].challengeName === 'CUSTOM_CHALLENGE' &&
        event.request.session[0].challengeResult === true
    ) {
        event.response.issueTokens = true;
        event.response.failAuthentication = false;
    }
    else {
        event.response.issueTokens = false;
        event.response.failAuthentication = true;
    }
    context.done(null, event);
};

```

8. `cdk/functions/verifyAuthChallengeResponse/handler.ts` runtime code
   ```typescript
    exports.handler = (event: any, context: any) => {
        console.log(event);
        if (
            event.request.privateChallengeParameters.answer === event.request.challengeAnswer
        ) {
            event.response.answerCorrect = true;
        } else {
            event.response.answerCorrect = false;
        }
        context.done(null, event);
    };
   ```

9. `cdk/functions/preSignUp/handler.ts` runtime code
   ```typescript
    exports.handler = (event: any, context: any, callback: any) => {
        // Confirm the user
        event.response.autoConfirmUser = true;

        // Set the email as verified if it is in the request
        if (event.request.userAttributes.hasOwnProperty('email')) {
            event.response.autoVerifyEmail = true;
        }

        // Set the phone number as verified if it is in the request
        if (event.request.userAttributes.hasOwnProperty('phone_number')) {
            event.response.autoVerifyPhone = true;
        }

        // Return to Amazon Cognito
        callback(null, event);
    };
   ```

10.  In the `fuelpass/cdk/lib/cdk-stack.ts` file, below the `createAuthChallengeLambda` lambda infrasturcture code, add the permission policy for SNS.
```typescript
    ...
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
    ...
```

11. Install ESBuild as a dev dependency to package typescript lambda code inside the `cdk` folder
    `npm install --save-dev esbuild@0`


12. Execute `npm run deploy` at the `fuelpass` folder and check if the lambda triggers are set at the cognito userpool