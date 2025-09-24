import type { APIGatewayEvent } from 'aws-lambda';
import type { GetMentorsQueryParams } from '../schemas/mentor';
import type {
    ControllerResponsePromise,
    ServiceResponsePromise,
} from './responses';
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
    getAll(): ServiceResponsePromise<Mentor[] | []>;
    getAllWithFilter(
        params: GetMentorsQueryParams
    ): ServiceResponsePromise<Mentor[] | []>;
}

export interface IMentorController {
    getAll(
        queryParams: APIGatewayEvent['queryStringParameters'] | null
    ): ControllerResponsePromise<Mentor[] | []>;

    getMentorTimeSlots(
        mentorId: string
    ): ControllerResponsePromise<TimeSlot[] | []>;
}
