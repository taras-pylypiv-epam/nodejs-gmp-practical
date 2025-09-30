import type { ServiceResponsePromise } from './responses';

export enum NotificationType {
    BookingCreated = 'booking.created',
    BookingCancelled = 'booking.cancelled',
}

export interface BookingNotification {
    type: NotificationType.BookingCreated | NotificationType.BookingCancelled;
    template: string;
    toEmail: string;
    mentorBooking?: {
        studentEmail: string;
        startTime: string;
        endTime: string;
    };
    studentBooking?: {
        mentorEmail: string;
        startTime: string;
        endTime: string;
    };
}

export interface INotificationService {
    sendBookingNotification(
        notification: BookingNotification
    ): ServiceResponsePromise<boolean>;
}
