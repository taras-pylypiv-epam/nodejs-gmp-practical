import { inject, injectable } from 'tsyringe';
import type { IDynamoStore } from '../types/dynamo';
import type { ITimeSlotRepository, TimeSlot } from '../types/timeSlot';

@injectable()
export class TimeSlotRepository implements ITimeSlotRepository {
    constructor(
        @inject('IDynamoStore')
        private readonly db: IDynamoStore
    ) {}

    async getActiveByMentorId(mentorId: string) {
        const timeSlotsTable = process.env.TIME_SLOTS_TABLE;
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
            filterValues
        );

        return (result.Items as TimeSlot[]) ?? [];
    }

    async getById(timeSlotId: string) {
        const result = await this.db.getItem(
            process.env.TIME_SLOTS_TABLE,
            'id',
            timeSlotId
        );
        return (result.Item as TimeSlot) ?? null;
    }

    async updateBooked(timeSlotId: string, booked: boolean) {
        const result = await this.db.updateItem(
            process.env.TIME_SLOTS_TABLE,
            'id',
            timeSlotId,
            'SET booked = :booked',
            { ':booked': booked }
        );
        return (result.Attributes as TimeSlot) ?? null;
    }
}
