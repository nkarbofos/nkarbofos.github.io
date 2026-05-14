import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly config: ConfigService) {
    const endpoint = this.config.get<string>('S3_ENDPOINT');
    const region = this.config.get<string>('S3_REGION') ?? 'ru-central1';
    const accessKeyId = this.config.get<string>('S3_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('S3_SECRET_ACCESS_KEY');
    const bucket = this.config.get<string>('S3_BUCKET');
    const publicBaseUrl = this.config.get<string>('S3_PUBLIC_BASE_URL');

    if (
      !endpoint ||
      !accessKeyId ||
      !secretAccessKey ||
      !bucket ||
      !publicBaseUrl
    ) {

      this.s3 = new S3Client({ region });
      this.bucket = bucket ?? '';
      this.publicBaseUrl = publicBaseUrl ?? '';
      return;
    }

    this.s3 = new S3Client({
      region,
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
    });
    this.bucket = bucket;
    this.publicBaseUrl = publicBaseUrl.replace(/\/+$/, '');
  }

  async putObject(args: {
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<{ url: string; key: string }> {
    if (!this.bucket || !this.publicBaseUrl) {
      throw new Error(
        'S3 is not configured: set S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_PUBLIC_BASE_URL',
      );
    }

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: args.key,
        Body: args.body,
        ContentType: args.contentType,
      }),
    );

    return {
      key: args.key,
      url: `${this.publicBaseUrl}/${encodeURIComponent(args.key).replace(/%2F/g, '/')}`,
    };
  }
}
