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
