#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { APIStack } from '../lib/APIStack';
import { StorageStack } from '../lib/StorageStack';
import { NotificationStack } from '../lib/NotificationStack';

const app = new cdk.App();
const storageStack = new StorageStack(app, 'MentorBookingStorage', {});
const notificationsStack = new NotificationStack(
    app,
    'MentorBookingNotification'
);
new APIStack(app, 'MentorBookingAPI', {
    mentorsTable: storageStack.mentorsTable,
    timeSlotsTable: storageStack.timeSlotsTable,
    bookingsTable: storageStack.bookingsTable,
    notificationsQueue: notificationsStack.notificationsQueue,
    mentorBookingTemplate: notificationsStack.mentorBookingTemplate,
    studentBookingTemplate: notificationsStack.studentBookingTemplate,
    bookingsBucket: storageStack.bookingsBucket,
});
