import { diContainer } from './DI/diRegistry';

import type { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import type { IMentorController } from './types/mentor';

const UUID_PATTERN =
    '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';
const MENTOR_TIME_SLOTS_ENDPOINT_REG = new RegExp(
    `^/mentors/${UUID_PATTERN}/timeslots$`
);

export async function handler(
    event: APIGatewayEvent
): Promise<APIGatewayProxyResult> {
    let body;
    let statusCode: number;

    try {
        switch (true) {
            case event.path === '/mentors' && event.httpMethod === 'GET': {
                const controller =
                    diContainer.resolve<IMentorController>('IMentorController');
                ({ body, statusCode } = await controller.getAll(
                    event.queryStringParameters
                ));
                break;
            }
            case MENTOR_TIME_SLOTS_ENDPOINT_REG.test(event.path) &&
                event.pathParameters?.mentorId &&
                event.httpMethod === 'GET': {
                const controller =
                    diContainer.resolve<IMentorController>('IMentorController');
                ({ body, statusCode } = await controller.getMentorTimeSlots(
                    event.pathParameters.mentorId
                ));
                break;
            }
            default:
                statusCode = 404;
                body = { message: 'Resource not found' };

                break;
        }
    } catch (error) {
        console.log(error);

        statusCode = 500;
        body = {
            message: (error as Error).message,
        };
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
    };
}
