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
}
