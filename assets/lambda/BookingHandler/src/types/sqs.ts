import type { SendMessageCommandOutput } from '@aws-sdk/client-sqs';

export interface ISQSClient {
    sendMessage(
        queueUrl: string,
        message: string
    ): Promise<SendMessageCommandOutput>;
}
