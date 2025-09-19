import type { APIGatewayEvent } from 'aws-lambda';
import type { CreateBookingBody } from '../schemas/booking';
import type { ControllerResultPromise, ServiceResultPromise } from './results';

export interface Booking {
    id: string;
    mentorId: string;
    timeSlotId: string;
    mentorEmail: string;
    studentEmail: string;
}

export interface IBookingRepository {
    create(booking: Booking): Promise<boolean>;
    deleteById(bookingId: string): Promise<boolean>;
    getAll(): Promise<Booking[] | []>;
    getById(bookingId: string): Promise<Booking | null>;
}

export interface IBookingService {
    create(
        body: CreateBookingBody,
        studentEmail: string
    ): ServiceResultPromise<Booking>;
    delete(
        bookingId: string,
        studentEmail: string
    ): ServiceResultPromise<boolean>;
}

export interface IBookingController {
    create(
        body: APIGatewayEvent['body'],
        studentEmail: string
    ): ControllerResultPromise<Booking>;
    delete(
        bookingId: string,
        studentEmail: string
    ): ControllerResultPromise<null>;
}
