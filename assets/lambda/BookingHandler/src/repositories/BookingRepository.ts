import { inject, injectable } from 'tsyringe';
import { BookingDateQueryParam } from '../schemas/booking';

import type { ScanCommandInput } from '@aws-sdk/lib-dynamodb';
import type { IDynamoStore } from '../types/dynamo';
import type { Booking, IBookingRepository } from '../types/booking';
import type { GetBookingsQueryParams } from '../schemas/booking';

@injectable()
export class BookingRepository implements IBookingRepository {
    private readonly bookingsTable: string;

    constructor(
        @inject('IDynamoStore')
        private readonly db: IDynamoStore
    ) {
        this.bookingsTable = process.env.BOOKINGS_TABLE;
    }

    async create(booking: Booking) {
        const result = await this.db.createItem(this.bookingsTable, booking);
        return result.$metadata.httpStatusCode === 200;
    }

    async getAll() {
        const result = await this.db.getAll(this.bookingsTable);
        return (result.Items as Booking[]) ?? [];
    }

    async getAllWithFilter(params: GetBookingsQueryParams) {
        const today = new Date().toISOString();
        const filter: string[] = [];
        const filterValues: ScanCommandInput['ExpressionAttributeValues'] = {
            ':startTime': today,
        };

        if (params.date === BookingDateQueryParam.Upcoming) {
            filter.push('startTime >= :startTime');
        } else if (params.date === BookingDateQueryParam.Historical) {
            filter.push('startTime < :startTime');
        }

        const result = await this.db.getItemsWithFilter(
            this.bookingsTable,
            filter.join(' AND '),
            filterValues
        );
        return (result.Items as Booking[]) ?? [];
    }

    async getById(bookingId: string) {
        const result = await this.db.getItem(
            this.bookingsTable,
            'id',
            bookingId
        );
        return (result.Item as Booking) ?? null;
    }

    async deleteById(bookingId: string) {
        const result = await this.db.deleteItem(
            this.bookingsTable,
            'id',
            bookingId
        );
        return result.$metadata.httpStatusCode === 200;
    }
}
