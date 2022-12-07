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