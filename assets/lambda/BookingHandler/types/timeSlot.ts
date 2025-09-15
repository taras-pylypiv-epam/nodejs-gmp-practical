export interface TimeSlot {
    id: string;
    mentorId: string;
    startTime: string;
    endTime: string;
    available: boolean;
}

export interface ITimeSlotRepository {
    getActiveByMentorId(mentorId: string): Promise<TimeSlot[] | []>;
}

export interface ITimeSlotService {
    getActiveByMentorId(mentorId: string): Promise<TimeSlot[] | [] | null>;
}
