## Step 05 - Implement user details CRUD operations

1. In the `cdk` folder update the `cdk-stack.ts` as follows
  ```typescript
     ...
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
        restApiName: "Fuel App API",
        handler: userProfileLambda,
        proxy: false,
        defaultMethodOptions: {
          authorizationType: AuthorizationType.COGNITO,
          authorizer: userPoolAuthorizer
        },
        defaultCorsPreflightOptions: {
          allowOrigins: [ "*" ],
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
    ...

  ```

2. Create a new folder inside the `functions` folder called `userProfile`. Add `handler.ts` file in that folder

3. Add the following code to `handler.ts` file
  ```typescript
  import { updateUser, createUser, getUserById } from "./lib/users";

  exports.handler = async (event: any) => {
    let output, statusCode;
    try {
      switch (event.httpMethod) {
        case "GET":
          if (event.pathParameters && event.pathParameters.userId) {
            output = await getUserById(event);
          }
          break;
        case "POST":
          if (event.path === "/users") {
            output = await createUser(event);
          }
          break;
        case "PUT":
          if (event.pathParameters && event.pathParameters.userId) {
            output = await updateUser(event);
          }
          break;
        default:
          throw new Error(`Unsupported operation: "${event.httpMethod}"`);
      }
      console.log(output);
      return {
        statusCode,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          message: `Successfully finished operation: "${event.httpMethod}"`,
          body: output,
        }),
      };
    } catch (err: any) {
      console.error(err);
      return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          message: `Failed to perform operation`,
          errorMsg: err.message,
        }),
      };
    }
  };

  ```

4. Create a sub-folder called `lib` inside the `userProfile` folder and add new file called `users.ts` that contains the CRUD operation runtime code for user details. Add the following code in the `users.ts` file. 

```typescript
  const DynamoDB = require("aws-sdk/clients/dynamodb");
  const docClient = new DynamoDB.DocumentClient();
  const USER_TABLE_NAME = process.env.USER_TABLE_NAME;

  export async function getUserById(event: any) {
    const userId = event.pathParameters.userId;
    const params = {
      TableName: USER_TABLE_NAME,
      Key: {
        id: userId,
      },
    };
    try {
      let output = await docClient.get(params).promise();
      return output;
    } catch (err) {
      throw err;
    }
  };

  export async function createUser(event: any) {
    const body = JSON.parse(event.body);
    console.log(JSON.stringify(event));
    body.id = event.requestContext.authorizer.claims.sub;
    body.phone = event.requestContext.authorizer.claims.phone_number;

    const params = {
      TableName: USER_TABLE_NAME,
      Item: body,
      ConditionExpression: "attribute_not_exists(id)"
    };
    try {
      let output = await docClient.put(params).promise();
      return output;
    } catch (err) {
      throw err;
    }
  };

  export async function updateUser(event: any) {
    const userId = event.pathParameters.userId;
    const body = JSON.parse(event.body);
    const params = {
      TableName: USER_TABLE_NAME,
      Key: {
        id: userId,
      },
      UpdateExpression: "set #name = :name, #nic = :nic, #address = :address",
      ExpressionAttributeNames: {
        "#name": "name",
        "#nic": "nic",
        "#address": "address"
      },
      ExpressionAttributeValues: {
        ":name": body.name,
        ":nic": body.nic,
        ":address": body.address
      },
      ConditionExpression: "attribute_exists(id)",
    };
    try {
      let output = await docClient.update(params).promise();
      return output;
    } catch (err) {
      throw err;
    }
  };

```

5. Deploy with `npm run deploy`

6. Update the `src/index.js` with the `API` configurations
```javascript
  // Manually configure amplify 
  Amplify.configure({
    Auth: { ... },
    API: {
      endpoints: [
        {
          name: "UserAPI",
          endpoint: "<endpoint>"
        }
      ]
    }
  });
```

7. Update the `src/App.js` as follows
  ```javascript
  ...
    const userAPIName = "UserAPI";
    const userRootPath = "/users";

    const getPayload = async (data = {}) => {
      return {
        body: data,
        headers: {
          Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
        }
      };
    }

    const saveUserDetails = async (e) => {
      e.preventDefault();
      try {
        if (!userProfile.name || !userProfile.nic || !userProfile.address) {
          return;
        }
        const payload = await getPayload(userProfile);
        await API.post(userAPIName, userRootPath, payload);
      } catch (err) {
        toast.error(err.message);
        console.log('error creating user profile:', err);
      }
    }
  ...

  ```
8. Deploy again and test user saving feature. `npm run deploy`