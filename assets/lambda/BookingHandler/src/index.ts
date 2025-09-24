import { diContainer } from './DI/diRegistry';

import type { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import type { IMentorController } from './types/mentor';
import type { IBookingController } from './types/booking';

const UUID_PATTERN =
    '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';
const MENTOR_TIME_SLOTS_ENDPOINT_REG = new RegExp(
    `^/mentors/${UUID_PATTERN}/timeslots$`
);
const BOOKING_ENDPOINT_REG = new RegExp(`^/bookings/${UUID_PATTERN}$`);

export async function handler(
    event: APIGatewayEvent
): Promise<APIGatewayProxyResult> {
    if (
        !process.env.MENTORS_TABLE ||
        !process.env.TIME_SLOTS_TABLE ||
        !process.env.BOOKINGS_TABLE
    ) {
        throw new Error(
            'Missing required environment variables: MENTORS_TABLE, TIME_SLOTS_TABLE, BOOKINGS_TABLE'
        );
    }

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
            case event.path === '/bookings' && event.httpMethod === 'POST': {
                const controller =
                    diContainer.resolve<IBookingController>(
                        'IBookingController'
                    );
                ({ body, statusCode } = await controller.create(
                    event.body,
                    event.requestContext.authorizer!.claims['email']
                ));
                break;
            }
            case BOOKING_ENDPOINT_REG.test(event.path) &&
                event.pathParameters?.bookingId &&
                event.httpMethod === 'DELETE': {
                const controller =
                    diContainer.resolve<IBookingController>(
                        'IBookingController'
                    );
                ({ body, statusCode } = await controller.delete(
                    event.pathParameters.bookingId,
                    event.requestContext.authorizer!.claims['email']
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
