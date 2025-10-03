import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { sdkStreamMixin } from '@aws-sdk/util-stream-node';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import * as csv from 'csv-parse';
import { v4 as uuidv4 } from 'uuid';

import type { S3Event, S3EventRecord } from 'aws-lambda';
import type { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import type { PutCommandOutput } from '@aws-sdk/lib-dynamodb';

interface Mentor {
    id: string;
    name: string;
    email: string;
    skills: string[];
    experience: number;
}

const s3 = new S3Client();
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const mentorsTable = process.env.MENTORS_TABLE;

async function getS3Object(
    bucket: string,
    key: string
): Promise<GetObjectCommandOutput['Body']> {
    const params = {
        Bucket: bucket,
        Key: key,
    };

    try {
        const { Body } = await s3.send(new GetObjectCommand(params));
        return Body;
    } catch (error) {
        console.log(`Error getting object ${key} from S3 bucket ${bucket}`);
        throw error;
    }
}

async function createMentor(mentor: Mentor) {
    try {
        const command = new PutCommand({
            TableName: mentorsTable,
            Item: mentor,
        });
        const result = await dynamo.send(command);

        return result;
    } catch (error) {
        console.log('Error creating mentor');
        throw error;
    }
}

async function processImport(record: S3EventRecord) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    const s3Object = await getS3Object(bucket, key);
    if (!s3Object) {
        throw new Error(`Object ${key} from S3 bucket ${bucket} is empty`);
    }

    const s3ObjectStream = sdkStreamMixin(s3Object);
    const csvOptions = {
        delimiter: ';',
        columns: ['email', 'experience', 'name', 'skills'],
        from_line: 2,
        cast: (value: string, { column }: csv.CastingContext) => {
            if (column === 'skills') {
                return value.split(',');
            } else if (column === 'experience') {
                return parseInt(value);
            }

            return value;
        },
    };

    const parsePromises: Promise<PutCommandOutput>[] = await new Promise(
        (resolve, reject) => {
            const createPromises: Promise<PutCommandOutput>[] = [];

            s3ObjectStream
                .pipe(csv.parse(csvOptions))
                .on('data', (record) => {
                    const mentor: Mentor = {
                        id: uuidv4(),
                        ...record,
                    };
                    const createPromise = createMentor(mentor);
                    createPromises.push(createPromise);
                })
                .on('end', () => resolve(createPromises))
                .on('error', (error) => reject(error));
        }
    );

    const { successCount, errorCount } = await Promise.allSettled(
        parsePromises
    ).then((results) => {
        const successCount = results.reduce((count, createResult) => {
            if (createResult.status === 'fulfilled') {
                return count + 1;
            }

            return count;
        }, 0);

        const errorCount = results.reduce((count, createResult) => {
            if (createResult.status === 'rejected') {
                return count + 1;
            }

            return count;
        }, 0);

        return { successCount, errorCount };
    });

    console.log(successCount, errorCount);
}

export async function handler(event: S3Event) {
    if (!mentorsTable) {
        throw new Error(
            'Missing required environment variables: MENTORS_TABLE'
        );
    }

    for (const record of event.Records) {
        try {
            await processImport(record);
        } catch (error) {
            console.log(error);
        }
    }
}
