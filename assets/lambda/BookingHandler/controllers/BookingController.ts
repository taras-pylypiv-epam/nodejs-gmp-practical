import { inject, injectable } from 'tsyringe';
import { CreateBookingBodySchema } from '../schemas/booking';

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
