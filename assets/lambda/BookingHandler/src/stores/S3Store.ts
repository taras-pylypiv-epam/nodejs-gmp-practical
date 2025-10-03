import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import busboy from 'busboy';

import type { Busboy } from 'busboy';
import type { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3';
import type { IS3Store } from '../types/s3';

export class S3Store implements IS3Store {
    private readonly _s3client: S3Client;

    constructor() {
        this._s3client = new S3Client();
    }

    async upload(
        bucket: string,
        folder: string,
        body: Buffer<ArrayBuffer>,
        contentType: string
    ): Promise<CompleteMultipartUploadCommandOutput> {
        const bb: Busboy = busboy({
            headers: { 'content-type': contentType },
        });

        return new Promise((resolve, reject) => {
            bb.on('file', (_name, file, info) => {
                const { filename, mimeType } = info;
                const upload = new Upload({
                    client: this._s3client,
                    params: {
                        Bucket: bucket,
                        Key: `${folder}/${filename}`,
                        Body: file,
                        ContentType: mimeType,
                    },
                });

                upload
                    .done()
                    .then((data) => {
                        console.log('S3 Upload Success:', data.Key);
                        resolve(data);
                    })
                    .catch((error) => {
                        console.log('S3 Upload Error:', error);
                        reject(new Error('Failed to upload to S3'));
                    });
            });

            bb.on('error', (error) => {
                console.log('Busboy Error:', error);
                reject(new Error('Error parsing form data'));
            });

            bb.end(body);
        });
    }
}
