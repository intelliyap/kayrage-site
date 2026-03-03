# KAYRAGE

AI-powered consciousness training platform. Combines binaural audio entrainment, ancient meditation techniques, and AI-guided sessions into a daily practice.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **State**: Zustand v5 with localStorage persistence
- **Database**: Supabase (Postgres + Auth + RLS)
- **Audio**: Web Audio API (binaural generator, bed player, voice cues)
- **Styling**: Tailwind CSS v4, DM Mono + Inter fonts
- **Deployment**: Docker → Traefik on self-hosted VPS

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app works fully offline without any external dependencies. Supabase and R2 audio are optional enhancements.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anonymous key |
| `ANTHROPIC_API_KEY` | No | For AI session generation (falls back to local) |
| `ELEVENLABS_API_KEY` | No | For voice cue synthesis |
| `R2_BUCKET_URL` | No | Cloudflare R2 for pre-rendered audio beds |

## Project Structure

```
app/                    # Next.js App Router pages
  page.tsx              # Home — check-in → session
  session/page.tsx      # Session lifecycle (plan → play → rate)
  dashboard/page.tsx    # Stats, progression, history
  onboarding/page.tsx   # First-time user flow
  browse/               # Technique library browser
  api/                  # API routes (session gen, audio prep, voice synth)

components/
  session/              # SessionPlayer, BreathPacer, AudioVisualizer, etc.
  dashboard/            # ProgressRing, StreakTracker, SessionHistory
  onboarding/           # QuizFlow, AudioDemo, StateCheckIn
  ui/                   # Button, KayrageLogo

lib/
  stores/               # Zustand stores (user, session, audio)
  ai/                   # State assessor, technique selector, script writer
  audio/                # Audio engine, binaural generator, bed/voice players
  techniques/           # 49-technique library with metadata
  progression/          # Focus levels, unlock criteria, session tracking
  supabase/             # Client, types, migrations

tests/                  # Vitest tests
scripts/generate/       # Offline audio bed rendering pipeline
```

## Focus Levels

| Level | Focus # | Description |
|-------|---------|-------------|
| Sync | 3 | Foundation — breath and basic awareness |
| The Edge | 10 | Borderland between waking and sleep |
| Expand | 12 | Perception beyond normal boundaries |
| Void | 15 | No-thought awareness |
| Bridge | 21 | Invite-only — uncharted territory |

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run test         # Run tests
npm run test:watch   # Tests in watch mode
npm run lint         # ESLint
```

## Docker

```bash
docker build -t kayrage-site .
docker run -p 3000:3000 kayrage-site
```

Image auto-published as `dddd4444/kayrage-site:latest` via CI.
