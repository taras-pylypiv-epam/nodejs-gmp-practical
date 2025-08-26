#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { MentorBookingStack } from '../lib/MentorBookingStack';

const app = new cdk.App();
new MentorBookingStack(app, 'MentorBookingStack', { });
