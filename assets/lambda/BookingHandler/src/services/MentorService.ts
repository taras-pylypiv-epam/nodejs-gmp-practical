import { inject, injectable } from 'tsyringe';
import { getCurrentTimestamp } from '../utils/date';

import type { IMentorService, IMentorRepository } from '../types/mentor';
import type { IS3Store } from '../types/s3';
import type { GetMentorsQueryParams } from '../schemas/mentor';

@injectable()
export class MentorService implements IMentorService {
    private readonly bookingsBucket: string;

    constructor(
        @inject('IMentorRepository')
        private readonly mentorRepository: IMentorRepository,

        @inject('IS3Store')
        private readonly s3Store: IS3Store
    ) {
        this.bookingsBucket = process.env.BOOKINGS_BUCKET;
    }

    async getAll() {
        const result = await this.mentorRepository.getAll();
        return { error: false, data: result };
    }

    async getAllWithFilter(params: GetMentorsQueryParams) {
        const result = await this.mentorRepository.getAllWithFilter(params);
        return { error: false, data: result };
    }

    async bulkImport(
        body: string,
        contentType: string,
        isBase64Encoded: boolean
    ) {
        const folder = `import/mentors/${getCurrentTimestamp()}`;

        const result = await this.s3Store.upload(
            this.bookingsBucket,
            folder,
            Buffer.from(body, isBase64Encoded ? 'base64' : 'utf8'),
            contentType
        );

        return { error: false, data: result };
    }
}
