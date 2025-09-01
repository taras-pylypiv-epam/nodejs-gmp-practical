import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

export async function handler(
    event: APIGatewayEvent
): Promise<APIGatewayProxyResult> {
    const response = {
        message: `Hello ${event.requestContext.authorizer?.claims['email']}`,
    };

    return {
        body: JSON.stringify(response, null, 2),
        statusCode: 200,
    };
}
