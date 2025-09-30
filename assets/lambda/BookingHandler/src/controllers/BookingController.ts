import { inject, injectable } from 'tsyringe';
import {
    CreateBookingBodySchema,
    GetBookingsQueryParamsSchema,
} from '../schemas/booking';

import type { APIGatewayEvent } from 'aws-lambda';
import type { IBookingController, IBookingService } from '../types/booking';

@injectable()
export class BookingController implements IBookingController {
    constructor(
        @inject('IBookingService')
        private readonly bookingService: IBookingService
    ) {}

    async create(body: APIGatewayEvent['body'], studentEmail: string) {
        const { data: parsedBody, success } = CreateBookingBodySchema.safeParse(
            body ? JSON.parse(body) : {}
        );
        if (!success) {
            return { body: { message: 'Invalid request' }, statusCode: 400 };
        }

        const result = await this.bookingService.create(
            parsedBody,
            studentEmail
        );
        if (result.error || !result.data) {
            return {
                body: {
                    message: result.errorMsg ?? 'Failed to create booking',
                },
                statusCode: result.code ?? 409,
            };
        }

        return { body: result.data, statusCode: 201 };
    }

    async getAll(queryParams: APIGatewayEvent['queryStringParameters']) {
        const { data: parsedQueryParams, success } =
            GetBookingsQueryParamsSchema.safeParse(queryParams ?? {});

        if (!success) {
            return { body: { message: 'Invalid request' }, statusCode: 400 };
        }

        const result = Object.keys(parsedQueryParams).length
            ? await this.bookingService.getAllWithFilter(parsedQueryParams)
            : await this.bookingService.getAll();

        if (result.error || !result.data) {
            return {
                body: { message: result.errorMsg ?? 'Failed to get bookings' },
                statusCode: result.code ?? 404,
            };
        }

        return { body: result.data, statusCode: 200 };
    }

    async delete(bookingId: string, studentEmail: string) {
        const result = await this.bookingService.delete(
            bookingId,
            studentEmail
        );
        if (result.error || !result.data) {
            return {
                body: {
                    message: result.errorMsg ?? 'Failed to delete booking',
                },
                statusCode: result.code ?? 409,
            };
        }

        return { body: null, statusCode: 204 };
    }
}
