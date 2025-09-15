import { inject, injectable } from 'tsyringe';
import { IDynamoStore } from '../types/dynamo';
import type { ITimeSlotRepository, TimeSlot } from '../types/timeSlot';

@injectable()
export class TimeSlotRepository implements ITimeSlotRepository {
    constructor(
        @inject('IDynamoStore')
        private readonly db: IDynamoStore
    ) {}

    async getActiveByMentorId(mentorId: string) {
        const timeSlotsTable = process.env.TIME_SLOTS_TABLE!;
        const filters = [
            'mentorId = :mentorId',
            'booked = :booked',
            'startTime >= :now',
        ];
        const filterValues = {
            ':mentorId': mentorId,
            ':booked': false,
            ':now': new Date().toISOString(),
        };

        const result = await this.db.getItemsWithFilter(
            timeSlotsTable,
            filters.join(' AND '),
            filterValues,
            'id, startTime, endTime'
        );

        return (result.Items as TimeSlot[]) ?? [];
    }
}
