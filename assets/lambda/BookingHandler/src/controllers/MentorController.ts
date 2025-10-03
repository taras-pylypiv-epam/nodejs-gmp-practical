import { inject, injectable } from 'tsyringe';
import { GetMentorsQueryParamsSchema } from '../schemas/mentor';

import type { APIGatewayEvent } from 'aws-lambda';
import type { IMentorController, IMentorService } from '../types/mentor';
import type { ITimeSlotService } from '../types/timeSlot';

@injectable()
export class MentorController implements IMentorController {
    constructor(
        @inject('IMentorService')
        private readonly mentorService: IMentorService,

        @inject('ITimeSlotService')
        private readonly timeSlotService: ITimeSlotService
    ) {}

    async getAll(queryParams: APIGatewayEvent['queryStringParameters']) {
        const { data: parsedQueryParams, success } =
            GetMentorsQueryParamsSchema.safeParse(queryParams ?? {});

        if (!success) {
            return { body: { message: 'Invalid request' }, statusCode: 400 };
        }

        const result = Object.keys(parsedQueryParams).length
            ? await this.mentorService.getAllWithFilter(parsedQueryParams)
            : await this.mentorService.getAll();

        if (result.error || !result.data) {
            return {
                body: { message: result.errorMsg ?? 'Failed to get mentors' },
                statusCode: 404,
            };
        }

        return { body: result.data, statusCode: 200 };
    }

    async getMentorTimeSlots(mentorId: string) {
        const result = await this.timeSlotService.getActiveByMentorId(mentorId);
        if (result.error || !result.data) {
            return {
                body: {
                    message:
                        result.errorMsg ?? 'Failed to get mentor time slots',
                },
                statusCode: 404,
            };
        }

        return { body: result.data, statusCode: 200 };
    }

    async bulkImport(
        body: APIGatewayEvent['body'],
        headers: APIGatewayEvent['headers'],
        isBase64Encoded: boolean
    ) {
        console.log(
            headers['Content-Type'],
            headers['Content-Type']?.startsWith('multipart/form-data'),
            body
        );
        if (
            !headers['Content-Type']?.startsWith('multipart/form-data') ||
            !body
        ) {
            return { body: { message: 'Invalid request' }, statusCode: 400 };
        }

        const result = await this.mentorService.bulkImport(
            body,
            headers['Content-Type'],
            isBase64Encoded
        );
        if (result.error || !result.data) {
            return {
                body: {
                    message: result.errorMsg ?? 'Failed to import mentors',
                },
                statusCode: result.code ?? 409,
            };
        }

        return {
            body: {
                bucket: result.data?.Bucket ?? null,
                key: result.data?.Key ?? null,
            },
            statusCode: 200,
        };
    }
}
