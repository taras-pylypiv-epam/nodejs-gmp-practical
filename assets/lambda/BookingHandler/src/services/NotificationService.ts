import { inject, injectable } from 'tsyringe';
import type {
    INotificationService,
    BookingNotification,
} from '../types/notification';
import type { ISQSClient } from '../types/sqs';

@injectable()
export class NotificationService implements INotificationService {
    private readonly notificationsQueue: string;

    constructor(
        @inject('ISQSClient')
        private readonly sqsClient: ISQSClient
    ) {
        this.notificationsQueue = process.env.NOTIFICATIONS_QUEUE;
    }

    async sendBookingNotification(notification: BookingNotification) {
        const result = await this.sqsClient.sendMessage(
            this.notificationsQueue,
            JSON.stringify(notification)
        );

        return { error: result.$metadata.httpStatusCode !== 200 };
    }
}
