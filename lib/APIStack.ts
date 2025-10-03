import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as s3 from 'aws-cdk-lib/aws-s3';

import { buildLambdaPath } from '../utils/path';

interface APIStackProps extends cdk.StackProps {
    readonly mentorsTable: dynamodb.ITableV2;
    readonly timeSlotsTable: dynamodb.ITableV2;
    readonly bookingsTable: dynamodb.ITableV2;
    readonly notificationsQueue: sqs.IQueue;
    readonly mentorBookingTemplate: string;
    readonly studentBookingTemplate: string;
    readonly bookingsBucket: s3.IBucket;
}

export class APIStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: APIStackProps) {
        super(scope, id, props);

        const studentPool = new cognito.UserPool(this, 'StudentPool', {
            userPoolName: 'StudentPool',
            selfSignUpEnabled: true,
            signInAliases: { email: true },
            autoVerify: { email: true },
        });
        new cognito.UserPoolClient(this, 'StudentPoolClient', {
            userPool: studentPool,
            generateSecret: false,
            authFlows: { userPassword: true },
        });
        const studentAuthorizer = new apigw.CognitoUserPoolsAuthorizer(
            this,
            'StudentAuthorizer',
            {
                cognitoUserPools: [studentPool],
                authorizerName: 'StudentAuthorizer',
            }
        );
        const studentAuthorizerOption = {
            authorizer: studentAuthorizer,
            authorizationType: apigw.AuthorizationType.COGNITO,
        };

        const adminPool = new cognito.UserPool(this, 'AdminPool', {
            userPoolName: 'AdminPool',
            selfSignUpEnabled: true,
            signInAliases: { email: true },
            autoVerify: { email: true },
        });
        new cognito.UserPoolClient(this, 'AdminPoolClient', {
            userPool: adminPool,
            generateSecret: false,
            authFlows: { userPassword: true },
        });
        const adminAuthorizer = new apigw.CognitoUserPoolsAuthorizer(
            this,
            'AdminAuthorizer',
            {
                cognitoUserPools: [adminPool],
                authorizerName: 'AdminAuthorizer',
            }
        );
        const adminAuthorizerOption = {
            authorizer: adminAuthorizer,
            authorizationType: apigw.AuthorizationType.COGNITO,
        };

        const bookingHandler = new lambda.Function(this, 'BookingHandler', {
            runtime: lambda.Runtime.NODEJS_22_X,
            architecture: lambda.Architecture.ARM_64,
            memorySize: 256,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(buildLambdaPath('BookingHandler')),
            environment: {
                MENTORS_TABLE: props.mentorsTable.tableName,
                TIME_SLOTS_TABLE: props.timeSlotsTable.tableName,
                BOOKINGS_TABLE: props.bookingsTable.tableName,
                NOTIFICATIONS_QUEUE: props.notificationsQueue.queueUrl,
                MENTOR_BOOKING_TEMPLATE: props.mentorBookingTemplate,
                STUDENT_BOOKING_TEMPLATE: props.studentBookingTemplate,
                BOOKINGS_BUCKET: props.bookingsBucket.bucketName,
            },
        });

        const bookingApi = new apigw.RestApi(this, 'BookingAPI', {
            restApiName: 'BookingAPI',
            description: 'Serves lambda function for Booking API',
            binaryMediaTypes: ['multipart/form-data', 'text/csv'],
        });
        const bookingIntegration = new apigw.LambdaIntegration(
            bookingHandler,
            {}
        );

        const mentorsResource = bookingApi.root.addResource('mentors');
        const mentorTimeSlotsResource = mentorsResource
            .addResource('{mentorId}')
            .addResource('timeslots');
        const bookingsResource = bookingApi.root.addResource('bookings');
        const bookingResource = bookingsResource.addResource('{bookingId}');
        const importResource = bookingApi.root.addResource('import');
        const importMentorsResource = importResource.addResource('mentors');

        // GET /mentors
        mentorsResource.addMethod(
            'GET',
            bookingIntegration,
            studentAuthorizerOption
        );
        // GET /mentors/{mentorId}/timeslots
        mentorTimeSlotsResource.addMethod(
            'GET',
            bookingIntegration,
            studentAuthorizerOption
        );
        // GET /bookings
        bookingsResource.addMethod(
            'GET',
            bookingIntegration,
            studentAuthorizerOption
        );
        // POST /bookings
        bookingsResource.addMethod(
            'POST',
            bookingIntegration,
            studentAuthorizerOption
        );
        // DELETE /bookings/{bookingId}
        bookingResource.addMethod(
            'DELETE',
            bookingIntegration,
            studentAuthorizerOption
        );
        // POST /import/mentors
        importMentorsResource.addMethod(
            'POST',
            bookingIntegration,
            adminAuthorizerOption
        );

        props.mentorsTable.grantReadWriteData(bookingHandler);
        props.timeSlotsTable.grantReadWriteData(bookingHandler);
        props.bookingsTable.grantReadWriteData(bookingHandler);

        props.notificationsQueue.grantSendMessages(bookingHandler);

        props.bookingsBucket.grantWrite(bookingHandler);
    }
}
