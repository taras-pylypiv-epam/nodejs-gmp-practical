import { inject, injectable } from 'tsyringe';

import type { IDynamoStore } from '../types/dynamo';
import type { Booking, IBookingRepository } from '../types/booking';

@injectable()
export class BookingRepository implements IBookingRepository {
    constructor(
        @inject('IDynamoStore')
        private readonly db: IDynamoStore
    ) {}

    async create(booking: Booking) {
        const result = await this.db.createItem(
            process.env.BOOKINGS_TABLE,
            booking
        );
        return result.$metadata.httpStatusCode === 200;
    }

    async getAll() {
        const result = await this.db.getAll(process.env.BOOKINGS_TABLE);
        return (result.Items as Booking[]) ?? [];
    }

    async getById(bookingId: string) {
        const result = await this.db.getItem(
            process.env.BOOKINGS_TABLE,
            'id',
            bookingId
        );
        return (result.Item as Booking) ?? null;
    }

    async deleteById(bookingId: string) {
        const result = await this.db.deleteItem(
            process.env.BOOKINGS_TABLE,
            'id',
            bookingId
        );
        return result.$metadata.httpStatusCode === 200;
    }
}
