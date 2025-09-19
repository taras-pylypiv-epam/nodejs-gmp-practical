#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { APIStack } from '../lib/APIStack';
import { StorageStack } from '../lib/StorageStack';

const app = new cdk.App();
const storageStack = new StorageStack(app, 'MentorBookingStorage', {});
new APIStack(app, 'MentorBookingAPI', {
    mentorsTable: storageStack.mentorsTable,
    timeSlotsTable: storageStack.timeSlotsTable,
    bookingsTable: storageStack.bookingsTable,
});
