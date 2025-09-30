import { inject, injectable } from 'tsyringe';
import type { IMentorService, IMentorRepository } from '../types/mentor';
import type { GetMentorsQueryParams } from '../schemas/mentor';

@injectable()
export class MentorService implements IMentorService {
    constructor(
        @inject('IMentorRepository')
        private readonly mentorRepository: IMentorRepository
    ) {}

    async getAll() {
        const result = await this.mentorRepository.getAll();
        return { error: false, data: result };
    }

    async getAllWithFilter(params: GetMentorsQueryParams) {
        const result = await this.mentorRepository.getAllWithFilter(params);
        return { error: false, data: result };
    }
}
