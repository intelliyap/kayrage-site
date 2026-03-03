/**
 * Upload rendered audio beds to S3-compatible storage (AWS S3 / Cloudflare R2).
 *
 * Usage: npx tsx scripts/generate/upload-beds.ts
 *
 * Uses standard AWS environment variables:
 *   AWS_ACCESS_KEY_ID
 *   AWS_SECRET_ACCESS_KEY
 *   AWS_DEFAULT_REGION
 *   AWS_S3_BUCKET_ARN  (e.g. arn:aws:s3:::my-bucket)
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = path.join(__dirname, 'output');
const S3_PREFIX = 'audio/beds/';

/** Extract bucket name from an S3 ARN like "arn:aws:s3:::my-bucket" */
function bucketNameFromArn(arn: string): string {
  // ARN format: arn:aws:s3:::bucket-name or arn:aws:s3:::bucket-name/key-prefix
  const parts = arn.split(':::');
  if (parts.length < 2) throw new Error(`Invalid S3 ARN: ${arn}`);
  return parts[1].split('/')[0];
}

function getS3Client(): S3Client {
  const region = process.env.AWS_DEFAULT_REGION;
  if (!region) {
    throw new Error('Missing AWS_DEFAULT_REGION environment variable');
  }

  // AWS SDK picks up AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY automatically
  return new S3Client({ region });
}

async function uploadFile(client: S3Client, bucket: string, filePath: string): Promise<void> {
  const filename = path.basename(filePath);
  const key = `${S3_PREFIX}${filename}`;
  const body = fs.readFileSync(filePath);

  const contentType = filename.endsWith('.mp3')
    ? 'audio/mpeg'
    : filename.endsWith('.wav')
      ? 'audio/wav'
      : 'application/octet-stream';

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );

  console.log(`  Uploaded: s3://${bucket}/${key}`);
}

async function main() {
  const arn = process.env.AWS_S3_BUCKET_ARN;
  if (!arn) {
    throw new Error('Missing AWS_S3_BUCKET_ARN environment variable');
  }

  const bucket = bucketNameFromArn(arn);

  if (!fs.existsSync(OUTPUT_DIR)) {
    console.error(`Output directory not found: ${OUTPUT_DIR}`);
    console.error('Run render-beds.ts first.');
    process.exit(1);
  }

  const files = fs.readdirSync(OUTPUT_DIR).filter(
    (f) => f.endsWith('.mp3') || f.endsWith('.wav'),
  );

  if (files.length === 0) {
    console.error('No audio files found in output directory.');
    process.exit(1);
  }

  console.log(`Uploading ${files.length} files to s3://${bucket}/${S3_PREFIX}`);

  const client = getS3Client();

  for (const file of files) {
    await uploadFile(client, bucket, path.join(OUTPUT_DIR, file));
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
