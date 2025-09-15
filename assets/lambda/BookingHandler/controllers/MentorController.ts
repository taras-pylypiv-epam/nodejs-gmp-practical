import { inject, injectable } from 'tsyringe';
import { GetAllQueryParamsSchema } from '../schemas/mentor';

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
            GetAllQueryParamsSchema.safeParse(queryParams ?? {});

        if (!success) {
            return { body: { message: 'Invalid request' }, statusCode: 400 };
        }

        let result;

        if (Object.keys(parsedQueryParams).length) {
            result =
                await this.mentorService.getAllWithFilter(parsedQueryParams);
        } else {
            result = await this.mentorService.getAll();
        }

        return { body: result, statusCode: 200 };
    }

    async getMentorTimeSlots(mentorId: string) {
        const result = await this.timeSlotService.getActiveByMentorId(mentorId);
        if (!result) {
            return { body: { message: 'Mentor not found' }, statusCode: 404 };
        }

        return { body: result, statusCode: 200 };
    }
}
