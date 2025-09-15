import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import moment from 'moment';

interface Mentor {
    id: string;
    name: string;
    skills: string[];
    experience: number;
}

interface TimeSlot {
    id: string;
    mentorId: string;
    startTime: string;
    endTime: string;
    booked: boolean;
}

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

function generateTimeSlots(startHour: number, endHour: number) {
    const slots = [];
    const startTime = moment().add(6, 'months').startOf('day').hour(startHour);
    const endTime = moment().add(6, 'months').startOf('day').hour(endHour);

    while (startTime.isSameOrBefore(endTime)) {
        const slot: { start: string; end: string } = {
            start: startTime.toISOString(),
            end: '',
        };

        startTime.add(30, 'minutes');
        slot.end = startTime.toISOString();

        slots.push(slot);
    }

    return slots;
}

function createRandomMentor(): Mentor {
    return {
        id: uuidv4(),
        name: faker.person.fullName(),
        skills: faker.helpers.arrayElements(
            ['nextjs', 'reactjs', 'nodejs', 'aws'],
            { min: 2, max: 4 }
        ),
        experience: faker.number.int({ min: 2, max: 8 }),
    };
}

function createRandomTimeSlots(mentorId: string): TimeSlot[] {
    const timeWindows = [
        [10, 12],
        [12, 14],
        [14, 16],
    ];
    const randomTimeWindow =
        timeWindows[Math.floor(Math.random() * timeWindows.length)];
    const timeSlots = generateTimeSlots(
        randomTimeWindow[0],
        randomTimeWindow[1]
    );

    return timeSlots.map((timeSlot) => ({
        id: uuidv4(),
        mentorId: mentorId,
        startTime: timeSlot.start,
        endTime: timeSlot.end,
        booked: false,
    }));
}

async function batchWriteItems(table: string, items: Mentor[] | TimeSlot[]) {
    const requests = items.map((item) => ({
        PutRequest: {
            Item: item,
        },
    }));
    const params = {
        RequestItems: {
            [table]: requests,
        },
    };

    try {
        const data = await dynamo.send(new BatchWriteCommand(params));
        console.log('[Batch Write] Successful:', data);

        if (
            data.UnprocessedItems &&
            Object.keys(data.UnprocessedItems).length > 0
        ) {
            console.log(
                '[Batch Write] Some items were not processed:',
                data.UnprocessedItems
            );
        }
    } catch (error) {
        console.error('[Batch Write] Error:', error);
    }
}

export async function handler() {
    if (!process.env.MENTORS_TABLE && !process.env.TIME_SLOTS_TABLE) {
        throw new Error(
            'Missing required environment variables: MENTORS_TABLE, TIME_SLOTS_TABLE'
        );
    }

    const mentors = faker.helpers.multiple(createRandomMentor, { count: 5 });
    const timeSlots = mentors.reduce((slots: TimeSlot[], mentor) => {
        const mentorTimeSlots = createRandomTimeSlots(mentor.id);
        return slots.concat(mentorTimeSlots);
    }, []);

    await batchWriteItems(process.env.MENTORS_TABLE!, mentors);
    await batchWriteItems(process.env.TIME_SLOTS_TABLE!, timeSlots);
}
