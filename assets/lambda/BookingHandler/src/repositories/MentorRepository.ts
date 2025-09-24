import { inject, injectable } from 'tsyringe';

import type { ScanCommandInput } from '@aws-sdk/lib-dynamodb';
import type { IDynamoStore } from '../types/dynamo';
import type { IMentorRepository, Mentor } from '../types/mentor';
import type { GetMentorsQueryParams } from '../schemas/mentor';

@injectable()
export class MentorRepository implements IMentorRepository {
    constructor(
        @inject('IDynamoStore')
        private readonly db: IDynamoStore
    ) {}

    async getAll() {
        const result = await this.db.getAll(process.env.MENTORS_TABLE);
        return (result.Items as Mentor[]) ?? [];
    }

    async getAllWithFilter(params: GetMentorsQueryParams) {
        const filter: string[] = [];
        const filterValues: ScanCommandInput['ExpressionAttributeValues'] = {};

        if (params.experience) {
            filter.push('experience = :experience');
            filterValues[':experience'] = params.experience;
        }
        if (params.skills) {
            params.skills.forEach((skill, index) => {
                filter.push(`contains(skills, :skills${index})`);
                filterValues[`:skills${index}`] = skill;
            });
        }

        const result = await this.db.getItemsWithFilter(
            process.env.MENTORS_TABLE,
            filter.join(' AND '),
            filterValues
        );
        return (result.Items as Mentor[]) ?? [];
    }

    async getById(mentorId: string) {
        const result = await this.db.getItem(
            process.env.MENTORS_TABLE,
            'id',
            mentorId
        );
        return (result.Item as Mentor) ?? null;
    }
}
