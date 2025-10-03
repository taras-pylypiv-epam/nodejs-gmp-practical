import type { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3';

export interface IS3Store {
    upload(
        bucket: string,
        folder: string,
        body: Buffer<ArrayBuffer>,
        contentType: string
    ): Promise<CompleteMultipartUploadCommandOutput>;
}
