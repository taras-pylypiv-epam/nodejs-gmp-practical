import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as customResources from 'aws-cdk-lib/custom-resources';
import * as s3 from 'aws-cdk-lib/aws-s3';

import { buildLambdaPath } from '../utils/path';

export class StorageStack extends cdk.Stack {
    public readonly mentorsTable: dynamodb.ITableV2;
    public readonly timeSlotsTable: dynamodb.ITableV2;
    public readonly bookingsTable: dynamodb.ITableV2;
    public readonly bookingsBucket: s3.IBucket;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const mentorsTable = new dynamodb.TableV2(this, 'MentorsTable', {
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            tableName: 'Mentors',
            billing: dynamodb.Billing.onDemand(),
        });
        const timeSlotsTable = new dynamodb.TableV2(this, 'TimeSlotsTable', {
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            tableName: 'TimeSlots',
            billing: dynamodb.Billing.onDemand(),
        });
        const bookingsTable = new dynamodb.TableV2(this, 'BookingsTable', {
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            tableName: 'Bookings',
            billing: dynamodb.Billing.onDemand(),
        });

        const seederHandler = new lambda.Function(
            this,
            'BookingSeederHandler',
            {
                description: 'Booking seeder handler',
                runtime: lambda.Runtime.NODEJS_22_X,
                architecture: lambda.Architecture.ARM_64,
                memorySize: 256,
                timeout: cdk.Duration.seconds(5),
                handler: 'index.handler',
                code: lambda.Code.fromAsset(buildLambdaPath('BookingSeeder')),
                environment: {
                    MENTORS_TABLE: mentorsTable.tableName,
                    TIME_SLOTS_TABLE: timeSlotsTable.tableName,
                },
            }
        );
        const bookingSeeder = new customResources.AwsCustomResource(
            this,
            'BookingSeeder',
            {
                onCreate: {
                    service: 'Lambda',
                    action: 'invoke',
                    parameters: {
                        FunctionName: seederHandler.functionName,
                    },
                    physicalResourceId:
                        customResources.PhysicalResourceId.of('BookingSeeder'),
                },
                policy: cdk.custom_resources.AwsCustomResourcePolicy.fromSdkCalls(
                    {
                        resources: [mentorsTable.tableArn],
                    }
                ),
            }
        );

        const bookingsBucket = new s3.Bucket(this, 'BookingsBucket', {
            versioned: true,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        });

        const importHandler = new lambda.Function(this, 'ImportHandler', {
            runtime: lambda.Runtime.NODEJS_22_X,
            architecture: lambda.Architecture.ARM_64,
            memorySize: 256,
            timeout: cdk.Duration.seconds(5),
            handler: 'index.handler',
            code: lambda.Code.fromAsset(buildLambdaPath('ImportHandler')),
            environment: {
                MENTORS_TABLE: mentorsTable.tableName,
            },
        });

        seederHandler.grantInvoke(bookingSeeder);
        mentorsTable.grantWriteData(seederHandler);
        timeSlotsTable.grantWriteData(seederHandler);

        importHandler.addEventSource(
            new lambdaEventSources.S3EventSource(bookingsBucket, {
                events: [s3.EventType.OBJECT_CREATED_PUT],
                filters: [{ prefix: 'import/' }, { suffix: '.csv' }],
            })
        );
        bookingsBucket.grantRead(importHandler);
        mentorsTable.grantWriteData(importHandler);

        this.mentorsTable = mentorsTable;
        this.timeSlotsTable = timeSlotsTable;
        this.bookingsTable = bookingsTable;

        this.bookingsBucket = bookingsBucket;
    }
}
