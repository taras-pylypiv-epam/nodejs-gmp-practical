import { inject, injectable } from 'tsyringe';
import type { ITimeSlotService, ITimeSlotRepository } from '../types/timeSlot';
import type { IMentorRepository } from '../types/mentor';

@injectable()
export class TimeSlotService implements ITimeSlotService {
    constructor(
        @inject('ITimeSlotRepository')
        private readonly timeSlotRepository: ITimeSlotRepository,

        @inject('IMentorRepository')
        private readonly mentorRepository: IMentorRepository
    ) {}

    async getActiveByMentorId(mentorId: string) {
        const mentor = await this.mentorRepository.getById(mentorId);
        if (!mentor) {
            return { error: true, errorMsg: 'Mentor not found' };
        }

        const result =
            await this.timeSlotRepository.getActiveByMentorId(mentorId);
        return { error: false, data: result };
    }
}
