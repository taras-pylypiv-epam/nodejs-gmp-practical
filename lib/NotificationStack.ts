import * as cdk from 'aws-cdk-lib';
import * as customResources from 'aws-cdk-lib/custom-resources';
import * as ses from 'aws-cdk-lib/aws-ses';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as eventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as iam from 'aws-cdk-lib/aws-iam';

import { Construct } from 'constructs';
import { readFileSync } from 'fs';

import { buildEmailTemplatePath, buildLambdaPath } from '../utils/path';

export class NotificationStack extends cdk.Stack {
    public readonly notificationsQueue: sqs.IQueue;
    public readonly mentorBookingTemplate: string;
    public readonly studentBookingTemplate: string;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const notificationsEmail = process.env.NOTIFICATIONS_EMAIL;
        if (!notificationsEmail) {
            throw new Error(
                'Missing required environment variables: NOTIFICATIONS_EMAIL'
            );
        }

        const notificationsEmailArn = cdk.Arn.format(
            {
                service: 'ses',
                resource: 'identity',
                resourceName: notificationsEmail,
                region: this.region,
                account: cdk.Stack.of(this).account,
            },
            this
        );
        new customResources.AwsCustomResource(
            this,
            'VerifyNotificationsEmail',
            {
                onCreate: {
                    service: 'SES',
                    action: 'verifyEmailIdentity',
                    parameters: {
                        EmailAddress: notificationsEmail,
                    },
                    physicalResourceId: customResources.PhysicalResourceId.of(
                        'VerifyNotificationsEmail'
                    ),
                },
                policy: customResources.AwsCustomResourcePolicy.fromStatements([
                    new iam.PolicyStatement({
                        actions: ['ses:VerifyEmailIdentity'],
                        resources: [notificationsEmailArn],
                    }),
                ]),
            }
        );

        const mentorBookingTemplateName = 'MentorBookingTemplate';
        const studentBookingTemplateName = 'StudentBookingTemplate';
        const mentorBookingTemplateArn = cdk.Arn.format(
            {
                service: 'ses',
                resource: 'template',
                resourceName: mentorBookingTemplateName,
                region: this.region,
                account: cdk.Stack.of(this).account,
            },
            this
        );
        const studentBookingTemplateArn = cdk.Arn.format(
            {
                service: 'ses',
                resource: 'template',
                resourceName: studentBookingTemplateName,
                region: this.region,
                account: cdk.Stack.of(this).account,
            },
            this
        );
        new ses.CfnTemplate(this, 'MentorBookingTemplate', {
            template: {
                templateName: mentorBookingTemplateName,
                subjectPart: 'Booking successfully {{event}}',
                htmlPart: readFileSync(
                    buildEmailTemplatePath('mentorBookingEmail'),
                    'utf8'
                ),
            },
        });
        new ses.CfnTemplate(this, 'StudentBookingTemplate', {
            template: {
                templateName: studentBookingTemplateName,
                subjectPart: 'Booking successfully {{event}}',
                htmlPart: readFileSync(
                    buildEmailTemplatePath('studentBookingEmail'),
                    'utf8'
                ),
            },
        });

        const notificationsDLQ = new sqs.Queue(this, 'NotificationsDLQ', {
            retentionPeriod: cdk.Duration.days(7),
        });
        const notificationsQueue = new sqs.Queue(this, 'NotificationsQueue', {
            visibilityTimeout: cdk.Duration.seconds(45),
            deadLetterQueue: {
                queue: notificationsDLQ,
                maxReceiveCount: 3,
            },
        });

        const notificationsHandler = new lambda.Function(
            this,
            'NotificationsHandler',
            {
                runtime: lambda.Runtime.NODEJS_22_X,
                architecture: lambda.Architecture.ARM_64,
                memorySize: 256,
                timeout: cdk.Duration.seconds(30),
                handler: 'index.handler',
                code: lambda.Code.fromAsset(
                    buildLambdaPath('NotificationsHandler')
                ),
                environment: {
                    NOTIFICATIONS_EMAIL: notificationsEmail,
                    MENTOR_BOOKING_TEMPLATE: mentorBookingTemplateName,
                    STUDENT_BOOKING_TEMPLATE: studentBookingTemplateName,
                },
            }
        );

        notificationsHandler.addEventSource(
            new eventSources.SqsEventSource(notificationsQueue, {
                batchSize: 5,
                maxBatchingWindow: cdk.Duration.seconds(5),
                reportBatchItemFailures: true,
            })
        );
        notificationsHandler.addToRolePolicy(
            new iam.PolicyStatement({
                actions: ['ses:SendTemplatedEmail'],
                resources: [
                    notificationsEmailArn,
                    mentorBookingTemplateArn,
                    studentBookingTemplateArn,
                ],
            })
        );

        this.notificationsQueue = notificationsQueue;
        this.mentorBookingTemplate = mentorBookingTemplateName;
        this.studentBookingTemplate = studentBookingTemplateName;
    }
}
