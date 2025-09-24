import type { APIGatewayEvent } from 'aws-lambda';
import type { GetMentorsQueryParams } from '../schemas/mentor';
import type { ServiceResultPromise, ControllerResultPromise } from './results';
import type { TimeSlot } from './timeSlot';

export interface Mentor {
    id: string;
    name: string;
    email: string;
    skills: string[];
    experience: number;
}

export interface IMentorRepository {
    getAll(): Promise<Mentor[] | []>;
    getAllWithFilter(params: GetMentorsQueryParams): Promise<Mentor[] | []>;
    getById(mentorId: string): Promise<Mentor | null>;
}

export interface IMentorService {
    getAll(): ServiceResultPromise<Mentor[] | []>;
    getAllWithFilter(
        params: GetMentorsQueryParams
    ): ServiceResultPromise<Mentor[] | []>;
}

export interface IMentorController {
    getAll(
        queryParams: APIGatewayEvent['queryStringParameters'] | null
    ): ControllerResultPromise<Mentor[] | []>;

    getMentorTimeSlots(
        mentorId: string
    ): ControllerResultPromise<TimeSlot[] | []>;
}
