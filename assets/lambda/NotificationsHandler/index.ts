import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import * as z from 'zod';

import type { SQSEvent, SQSRecord, SQSBatchItemFailure } from 'aws-lambda';

const notificationsEmail = process.env.NOTIFICATIONS_EMAIL;
const ses = new SESv2Client();

enum NotificationType {
    BookingCreated = 'booking.created',
    BookingCancelled = 'booking.cancelled',
}

const MentorBookingSchema = z.object({
    studentEmail: z.email(),
    startTime: z.iso.datetime(),
    endTime: z.iso.datetime(),
});
const StudentBookingSchema = z.object({
    mentorEmail: z.email(),
    startTime: z.iso.datetime(),
    endTime: z.iso.datetime(),
});
const NotificationSchema = z
    .object({
        type: z.enum(NotificationType),
        template: z.string(),
        toEmail: z.email(),
        mentorBooking: MentorBookingSchema.optional(),
        studentBooking: StudentBookingSchema.optional(),
    })
    .refine(
        (data) =>
            data.mentorBooking !== undefined ||
            data.studentBooking !== undefined,
        {
            message:
                'At least one of mentorBooking, studentBooking must be provided',
        }
    );

type Notification = z.infer<typeof NotificationSchema>;

function formatDate(isoDate: string) {
    return new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'UTC',
        timeZoneName: 'longOffset',
    }).format(new Date(isoDate));
}

function buildTemplateData(notification: Notification) {
    if (notification.mentorBooking) {
        const mentorBooking = notification.mentorBooking;

        return {
            event:
                notification.type === NotificationType.BookingCreated
                    ? 'created'
                    : 'cancelled',
            studentEmail: mentorBooking.studentEmail,
            startTime: formatDate(mentorBooking.startTime),
            endTime: formatDate(mentorBooking.endTime),
        };
    } else if (notification.studentBooking) {
        const studentBooking = notification.studentBooking;

        return {
            event:
                notification.type === NotificationType.BookingCreated
                    ? 'created'
                    : 'cancelled',
            mentorEmail: studentBooking.mentorEmail,
            startTime: formatDate(studentBooking.startTime),
            endTime: formatDate(studentBooking.endTime),
        };
    }

    return null;
}

async function sendNotificationEmail(notification: Notification) {
    const templateData = buildTemplateData(notification);
    const command = new SendEmailCommand({
        FromEmailAddress: notificationsEmail,
        Destination: { ToAddresses: [notification.toEmail] },
        Content: {
            Template: {
                TemplateName: notification.template,
                TemplateData: JSON.stringify(templateData),
            },
        },
    });

    const result = await ses.send(command);

    return {
        success: result.$metadata.httpStatusCode === 200,
        messageId: result.MessageId,
    };
}

async function processMessage(record: SQSRecord) {
    let notification: Notification;

    try {
        notification = JSON.parse(record.body);
    } catch (error) {
        console.log(
            `Failed to parse notification body from record: ${record.messageId}`
        );
        throw new Error((error as Error).message);
    }

    const {
        data: validNotification,
        success,
        error,
    } = NotificationSchema.safeParse(notification);
    if (!success) {
        console.log(
            `Notification is not valid from record: ${record.messageId}`
        );
        throw new Error(error.message);
    }

    const result = await sendNotificationEmail(validNotification);
    if (!result.success) {
        throw new Error(
            `Failed to send notification email for record: ${record.messageId}`
        );
    }

    console.log(`Record processed: ${record.messageId}`);
    console.log(`Notification email sent: ${record.messageId}`);
}

export async function handler(event: SQSEvent) {
    if (!notificationsEmail) {
        throw new Error(
            'Missing required environment variables: NOTIFICATIONS_EMAIL'
        );
    }

    const batchItemFailures: SQSBatchItemFailure[] = [];

    for (const record of event.Records) {
        try {
            await processMessage(record);
        } catch (error) {
            console.log(error);
            batchItemFailures.push({ itemIdentifier: record.messageId });
        }
    }

    return { batchItemFailures };
}
