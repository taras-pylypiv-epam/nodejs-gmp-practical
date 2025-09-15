import type { APIGatewayEvent } from 'aws-lambda';
import type { GetAllQueryParams } from '../schemas/mentor';
import type { TimeSlot } from './timeSlot';

export interface Mentor {
    id: string;
    name: string;
    skills: string[];
    experience: number;
}

export interface IMentorRepository {
    getAll(): Promise<Mentor[] | []>;
    getAllWithFilter(params: GetAllQueryParams): Promise<Mentor[] | []>;
    getById(mentorId: string): Promise<Mentor | null>;
}

export interface IMentorService {
    getAll(): Promise<Mentor[] | []>;
    getAllWithFilter(params: GetAllQueryParams): Promise<Mentor[] | []>;
}

export interface IMentorController {
    getAll(
        queryParams: APIGatewayEvent['queryStringParameters'] | null
    ): Promise<{
        body: { message: string } | Mentor[] | [];
        statusCode: number;
    }>;

    getMentorTimeSlots(mentorId: string): Promise<{
        body: { message: string } | TimeSlot[] | [];
        statusCode: number;
    }>;
}
