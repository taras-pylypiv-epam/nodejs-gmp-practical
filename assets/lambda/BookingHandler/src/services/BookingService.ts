import { inject, injectable } from 'tsyringe';
import { v4 as uuidv4 } from 'uuid';

import type {
    Booking,
    IBookingRepository,
    IBookingService,
} from '../types/booking';
import type { IMentorRepository } from '../types/mentor';
import type { ITimeSlotRepository } from '../types/timeSlot';
import type {
    CreateBookingBody,
    GetBookingsQueryParams,
} from '../schemas/booking';

@injectable()
export class BookingService implements IBookingService {
    constructor(
        @inject('IBookingRepository')
        private readonly bookingRepository: IBookingRepository,

        @inject('IMentorRepository')
        private readonly mentorRepository: IMentorRepository,

        @inject('ITimeSlotRepository')
        private readonly timeSlotRepository: ITimeSlotRepository
    ) {}

    async create(body: CreateBookingBody, studentEmail: string) {
        const mentor = await this.mentorRepository.getById(body.mentorId);
        if (!mentor) {
            return { error: true, code: 404, errorMsg: 'Mentor not found' };
        }

        const timeSlot = await this.timeSlotRepository.getById(body.timeSlotId);
        if (!timeSlot) {
            return { error: true, code: 404, errorMsg: 'Time Slot not found' };
        }
        if (timeSlot.mentorId !== mentor.id) {
            return { error: true, errorMsg: 'Mentor not matched' };
        }
        if (timeSlot.booked) {
            return { error: true, errorMsg: 'Time Slot already booked' };
        }
        if (new Date() > new Date(timeSlot.startTime)) {
            return {
                error: true,
                errorMsg: 'Time Slot period is not available anymore',
            };
        }

        const timeSlotUpdateResult = await this.timeSlotRepository.updateBooked(
            timeSlot.id,
            true
        );
        if (!timeSlotUpdateResult) {
            return {
                error: true,
                errorMsg: 'Failed to update Time Slot booking',
            };
        }

        const booking: Booking = {
            id: uuidv4(),
            timeSlotId: body.timeSlotId,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
            mentorEmail: mentor.email,
            studentEmail,
        };
        const bookingCreateResult =
            await this.bookingRepository.create(booking);
        if (!bookingCreateResult) {
            return { error: true, errorMsg: 'Failed to create Booking' };
        }

        return { error: false, data: booking };
    }

    async getAll() {
        const result = await this.bookingRepository.getAll();
        return { error: false, data: result };
    }

    async getAllWithFilter(params: GetBookingsQueryParams) {
        const result = await this.bookingRepository.getAllWithFilter(params);
        return { error: false, data: result };
    }

    async delete(bookingId: string, studentEmail: string) {
        const booking = await this.bookingRepository.getById(bookingId);
        if (!booking) {
            return { error: true, code: 404, errorMsg: 'Booking not found' };
        }
        if (booking.studentEmail !== studentEmail) {
            return { error: true, code: 403, errorMsg: 'Student not matched' };
        }

        const timeSlot = await this.timeSlotRepository.getById(
            booking.timeSlotId
        );
        if (!timeSlot) {
            return { error: true, code: 404, errorMsg: 'Time Slot not found' };
        }

        const timeSlotUpdateResult = await this.timeSlotRepository.updateBooked(
            timeSlot.id,
            false
        );
        if (!timeSlotUpdateResult) {
            return {
                error: true,
                errorMsg: 'Failed to update Time Slot booking',
            };
        }

        const bookingDeleteResult = await this.bookingRepository.deleteById(
            booking.id
        );
        if (!bookingDeleteResult) {
            return { error: true, errorMsg: 'Failed to delete Booking' };
        }

        return { error: false, data: bookingDeleteResult };
    }
}
