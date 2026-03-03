/**
 * S3 / R2 storage URL helper.
 *
 * Constructs public URLs for audio assets stored in S3 or Cloudflare R2.
 *
 * Priority:
 *   1. NEXT_PUBLIC_AUDIO_BUCKET_URL — explicit base URL (e.g. CDN domain)
 *   2. Falls back to constructing an S3 URL from AWS_S3_BUCKET_ARN + AWS_DEFAULT_REGION
 */

function getBucketBaseUrl(): string {
  // Explicit override — preferred for production (CDN / custom domain)
  if (process.env.NEXT_PUBLIC_AUDIO_BUCKET_URL) {
    return process.env.NEXT_PUBLIC_AUDIO_BUCKET_URL;
  }

  // Derive from AWS env vars (works for S3 with public access)
  const arn = process.env.AWS_S3_BUCKET_ARN;
  const region = process.env.AWS_DEFAULT_REGION;
  if (arn && region) {
    const bucket = arn.split(':::')[1]?.split('/')[0];
    if (bucket) {
      return `https://${bucket}.s3.${region}.amazonaws.com`;
    }
  }

  // Fallback
  return 'https://audio.kayos.app';
}

const BUCKET_BASE_URL = getBucketBaseUrl();

/**
 * Build a full URL for a bucket-stored asset.
 * @param path - Relative path within the bucket (e.g. "audio/beds/still-sync-30m.mp3")
 */
export function r2Url(path: string): string {
  const base = BUCKET_BASE_URL.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');
  return `${base}/${cleanPath}`;
}
