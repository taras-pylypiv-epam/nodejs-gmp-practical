import type { APIGatewayEvent } from 'aws-lambda';
import type {
    CreateBookingBody,
    GetBookingsQueryParams,
} from '../schemas/booking';
import type {
    ControllerResponsePromise,
    ServiceResponsePromise,
} from './responses';

export interface Booking {
    id: string;
    mentorId: string;
    timeSlotId: string;
    startTime: string;
    endTime: string;
    mentorEmail: string;
    studentEmail: string;
}

export interface IBookingRepository {
    create(booking: Booking): Promise<boolean>;
    getAll(): Promise<Booking[] | []>;
    getAllWithFilter(params: GetBookingsQueryParams): Promise<Booking[] | []>;
    getById(bookingId: string): Promise<Booking | null>;
    deleteById(bookingId: string): Promise<boolean>;
}

export interface IBookingService {
    create(
        body: CreateBookingBody,
        studentEmail: string
    ): ServiceResponsePromise<Booking>;
    getAll(): ServiceResponsePromise<Booking[] | []>;
    getAllWithFilter(
        params: GetBookingsQueryParams
    ): ServiceResponsePromise<Booking[] | []>;
    delete(
        bookingId: string,
        studentEmail: string
    ): ServiceResponsePromise<boolean>;
}

export interface IBookingController {
    create(
        body: APIGatewayEvent['body'],
        studentEmail: string
    ): ControllerResponsePromise<Booking>;
    getAll(
        queryParams: APIGatewayEvent['queryStringParameters'] | null
    ): ControllerResponsePromise<Booking[] | []>;
    delete(
        bookingId: string,
        studentEmail: string
    ): ControllerResponsePromise<null>;
}
