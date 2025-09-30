import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import type { SendMessageCommandOutput } from '@aws-sdk/client-sqs';
import type { ISQSClient } from '../types/sqs';

export class SQS implements ISQSClient {
    private readonly _sqsClient: SQSClient;

    constructor() {
        this._sqsClient = new SQSClient();
    }

    async sendMessage(
        queueUrl: string,
        message: string
    ): Promise<SendMessageCommandOutput> {
        try {
            const command = new SendMessageCommand({
                QueueUrl: queueUrl,
                MessageBody: message,
            });
            const result = await this._sqsClient.send(command);

            return result;
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
}
