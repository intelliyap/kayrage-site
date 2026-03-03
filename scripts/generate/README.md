# KAY-OS Audio Bed Generation Pipeline

Pre-renders audio beds using Tone.js offline rendering, then uploads to S3.

## Prerequisites

- Node.js 18+
- `tone` package (workspace dependency)
- `@aws-sdk/client-s3` (devDependency)

## Workflow

### 1. Render beds

```bash
# Render all beds
npx tsx scripts/generate/render-beds.ts

# Render a specific bed
npx tsx scripts/generate/render-beds.ts still-sync
```

Output goes to `scripts/generate/output/`.

### 2. Upload to S3

Uses standard AWS environment variables:

```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_DEFAULT_REGION=...
export AWS_S3_BUCKET_ARN=arn:aws:s3:::my-bucket

npx tsx scripts/generate/upload-beds.ts
```

Files are uploaded to `audio/beds/` prefix in the bucket.

## Bed Configurations

See `bed-configs.ts` for all render configurations. Current beds:

**Still mode** (4 beds):
- `still-sync` — 10 Hz alpha binaural, 30 min
- `still-edge` — 6 Hz theta binaural, 30 min
- `still-expand` — 4 Hz deep theta, 30 min
- `still-void` — 3 Hz theta-delta, 30 min

**Active mode** (12 beds = 3 profiles x 4 levels):
- `active-{drift|pulse|depth}-{sync|edge|expand|void}` — 30 min each

## Architecture

```
bed-configs.ts      → Defines render parameters
binaural.ts         → Binaural beat generator (Tone.js)
entrainment.ts      → Isochronic, monaural, AM generators
still-mode.ts       → Still mode engine layers
active-mode.ts      → Active mode generative engine
render-beds.ts      → Offline renderer (Tone.Offline)
upload-beds.ts      → S3 upload script
```
