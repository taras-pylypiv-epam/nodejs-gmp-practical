import type { ServiceResponsePromise } from './responses';

export interface TimeSlot {
    id: string;
    mentorId: string;
    startTime: string;
    endTime: string;
    booked: boolean;
}

export interface ITimeSlotRepository {
    getActiveByMentorId(mentorId: string): Promise<TimeSlot[] | []>;
    getById(timeSlotId: string): Promise<TimeSlot | null>;
    updateBooked(timeSlotId: string, booked: boolean): Promise<TimeSlot | null>;
}

export interface ITimeSlotService {
    getActiveByMentorId(
        mentorId: string
    ): ServiceResponsePromise<TimeSlot[] | []>;
}
