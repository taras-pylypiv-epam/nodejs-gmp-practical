import { inject, injectable } from 'tsyringe';
import type { IMentorService, IMentorRepository } from '../types/mentor';
import type { GetAllQueryParams } from '../schemas/mentor';

@injectable()
export class MentorService implements IMentorService {
    constructor(
        @inject('IMentorRepository')
        private readonly mentorRepository: IMentorRepository
    ) {}

    async getAll() {
        return await this.mentorRepository.getAll();
    }

    async getAllWithFilter(params: GetAllQueryParams) {
        return await this.mentorRepository.getAllWithFilter(params);
    }
}
