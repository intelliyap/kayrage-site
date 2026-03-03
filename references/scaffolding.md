You are scaffolding a production MVP for KAY-OS, an AI-powered consciousness training platform. This is not a prototype — it's the real product. Scaffold the full project structure with working code for every layer.

## PRODUCT OVERVIEW

KAY-OS trains consciousness through sound and AI-guided meditation. It combines:

- Binaural beat audio entrainment (brainwave frequency targeting)
- A library of 48 meditation techniques drawn from ancient traditions (Vigyana Bhairava Tantra, pranayama, vipassana, yoga nidra, Monroe Institute-style Focus levels)
- AI personalization (dynamic session generation based on user state)
- A progression system with gated Focus level advancement
- Two modes: Still (eyes closed, pure tones) and Active (eyes open, generative electronic music with embedded entrainment)

Target audience: Men in fitness/personal development communities (AM Training Hall). Positioning: "Internal Training" — consciousness technology, not meditation app.

## TECH STACK

- Framework: Next.js 14+ (App Router)
- Styling: Tailwind CSS
- Audio: Tone.js (binaural beats, generative music, entrainment)
- Backend: Supabase (auth, Postgres, storage, edge functions)
- AI: Anthropic Claude API (session generation, technique selection, personalization)
- Voice: ElevenLabs API (AI voice guidance synthesis)
- State: Zustand
- Deployment: Vercel
- PWA: next-pwa for mobile "add to home screen"

## PROJECT STRUCTURE

kayos/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout, PWA meta, dark theme
│   │   ├── page.tsx                # Landing / home screen
│   │   ├── onboarding/
│   │   │   ├── page.tsx            # Onboarding flow (quiz + intro)
│   │   │   └── components/
│   │   ├── session/
│   │   │   ├── page.tsx            # Active session screen
│   │   │   ├── [id]/page.tsx       # Specific session playback
│   │   │   └── components/
│   │   ├── browse/
│   │   │   ├── page.tsx            # Technique library browser
│   │   │   ├── [code]/page.tsx     # Individual technique detail
│   │   │   └── components/
│   │   ├── dashboard/
│   │   │   ├── page.tsx            # Progress, streaks, level
│   │   │   └── components/
│   │   └── api/
│   │       ├── session/generate/route.ts   # AI session generation
│   │       ├── voice/synthesize/route.ts   # Voice synthesis
│   │       └── auth/[...supabase]/route.ts
│   ├── lib/
│   │   ├── audio/
│   │   │   ├── engine.ts           # Core Tone.js audio engine
│   │   │   ├── binaural.ts         # Binaural beat generator
│   │   │   ├── entrainment.ts      # Isochronic + monaural + AM
│   │   │   ├── still-mode.ts       # Still session audio (pure tones + drone)
│   │   │   ├── active-mode.ts      # Active session audio (generative music)
│   │   │   ├── profiles.ts         # Drift / Pulse / Depth config
│   │   │   ├── mixer.ts            # Session mixer (voice + audio coordination)
│   │   │   └── visualizer.ts       # Canvas-based audio visualization
│   │   ├── ai/
│   │   │   ├── session-generator.ts    # Claude API: generate session plan
│   │   │   ├── technique-selector.ts   # AI dharana/technique selection logic
│   │   │   ├── script-writer.ts        # AI voice script generation
│   │   │   └── state-assessor.ts       # User state assessment
│   │   ├── techniques/
│   │   │   ├── library.ts          # Full 48-technique library data
│   │   │   ├── categories.ts       # Need-based categories (calm, sleep, focus, etc.)
│   │   │   ├── methods.ts          # Method groupings (breath, body, visual, etc.)
│   │   │   └── types.ts            # TypeScript types for techniques
│   │   ├── progression/
│   │   │   ├── levels.ts           # Focus level definitions and gating
│   │   │   ├── tracking.ts         # Session tracking and advancement logic
│   │   │   └── criteria.ts         # Unlock criteria per level
│   │   ├── supabase/
│   │   │   ├── client.ts           # Supabase client config
│   │   │   ├── middleware.ts        # Auth middleware
│   │   │   └── types.ts            # Database types
│   │   └── stores/
│   │       ├── session-store.ts    # Active session state
│   │       ├── user-store.ts       # User profile and preferences
│   │       └── audio-store.ts      # Audio engine state
│   ├── components/
│   │   ├── ui/                     # Shared UI primitives
│   │   ├── session/
│   │   │   ├── SessionPlayer.tsx       # Main session playback UI
│   │   │   ├── BreathPacer.tsx         # Animated breath guide ring
│   │   │   ├── GuidanceText.tsx        # Fade-in/out dharana prompts
│   │   │   ├── AudioVisualizer.tsx     # Canvas waveform/particle viz
│   │   │   ├── SessionTimer.tsx        # Elapsed time display
│   │   │   └── FocusLevelIndicator.tsx # Current Focus level badge
│   │   ├── browse/
│   │   │   ├── NeedGrid.tsx            # Need-based category selector
│   │   │   ├── MethodTabs.tsx          # Method filter tabs
│   │   │   ├── TechniqueCard.tsx       # Individual technique in list
│   │   │   └── TechniqueDetail.tsx     # Full technique view
│   │   ├── onboarding/
│   │   │   ├── StateCheckIn.tsx        # Mood/energy/time assessment
│   │   │   ├── QuizFlow.tsx            # Onboarding quiz steps
│   │   │   └── AudioDemo.tsx           # First binaural beat experience
│   │   └── dashboard/
│   │       ├── ProgressRing.tsx        # Level progress visualization
│   │       ├── StreakTracker.tsx        # Daily streak display
│   │       └── SessionHistory.tsx      # Past session list
│   └── styles/
│       └── globals.css             # Tailwind base + custom properties
├── supabase/
│   └── migrations/
│       ├── 001_users.sql           # User profiles table
│       ├── 002_sessions.sql        # Session history table
│       ├── 003_progression.sql     # Level progression table
│       └── 004_techniques.sql      # Technique interactions table
├── public/
│   ├── manifest.json               # PWA manifest
│   └── icons/                      # PWA icons
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json


## DATABASE SCHEMA

### users

```sql
create table public.users (
  id uuid references auth.users primary key,
  display_name text,
  onboarding_completed boolean default false,
  current_level text default 'sync',  -- sync | edge | expand | void | bridge
  total_sessions integer default 0,
  total_minutes integer default 0,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_session_at timestamptz,
  preferences jsonb default '{
    "tone": "direct",
    "session_length": "medium",
    "voice_gender": "male",
    "active_profile": "pulse"
  }'::jsonb,
  created_at timestamptz default now()
);
```

### sessions

```sql
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users not null,
  mode text not null,                    -- 'still' | 'active' | 'transition'
  active_profile text,                   -- 'drift' | 'pulse' | 'depth' (null for still)
  focus_level text not null,             -- 'sync' | 'edge' | 'expand' | 'void'
  techniques text[] not null,            -- array of technique codes ['B-01', 'S-03']
  duration_planned integer not null,     -- seconds
  duration_actual integer,               -- seconds (filled on completion)
  depth_rating integer,                  -- 1-10 self-report after session
  state_before jsonb,                    -- { mood, energy, time_of_day }
  state_after jsonb,                     -- { mood, energy, notes }
  ai_session_plan jsonb,                 -- full AI-generated session config
  completed boolean default false,
  created_at timestamptz default now()
);
```

### progression

```sql
create table public.progression (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users not null,
  level text not null,
  unlocked_at timestamptz default now(),
  sessions_at_level integer default 0,
  avg_depth_rating numeric(3,1),
  techniques_explored text[]             -- unique technique codes used at this level
);
```

## FOCUS LEVEL PROGRESSION SYSTEM

Levels (internal names → user-facing names):

- focus_3 → "Sync" (default, day 1)
- focus_10 → "The Edge" (unlock: 5 Sync sessions completed)
- focus_12 → "Expand" (unlock: 15 Edge sessions + avg depth >= 6)
- focus_15 → "Void" (unlock: 30 Expand sessions + avg depth >= 7)
- focus_21 → "Bridge" (invite only, 50+ Void sessions)

Each level gates:

1. Which techniques are available (advanced techniques locked behind level)
2. Which audio depth the session engine will target
3. Which voice guidance density is used (less guidance at higher levels)

## TECHNIQUE LIBRARY (48 TECHNIQUES)

Organized by method. Each technique has:

- code: string (e.g. "B-01")
- name: string
- method: "Breath" | "Body" | "Visual" | "Sound" | "Perception" | "Inquiry"
- mode: "Still" | "Active" | "Both"
- focusLevels: string[] (which levels this technique is used at)
- difficulty: "Entry" | "Intermediate" | "Advanced"
- minDuration: number (minutes)
- cue: string (the AI voice prompt text)
- source: string (tradition attribution)
- description: string (1-2 sentence explanation)

Full library data (implement all 48):

BREATH (9 techniques):
B-01: Breath Awareness | Both | Focus 3 | Entry | "Feel the air moving in... and out." | VBT #1
B-02: Breath Turning Points | Still | Focus 3-10 | Entry | "In the gap after exhale... just rest." | VBT #2
B-03: Counted Breath (Box) | Both | Focus 3 | Entry | "In for four. Hold for four. Out for four." | Pranayama
B-04: Alternate Nostril | Still | Focus 3 | Entry | "Right nostril closed. Breathe in through the left." | Hatha Yoga
B-05: Breath of Fire | Still | Focus 3 | Intermediate | "Sharp exhales through the nose." | Kundalini Yoga
B-06: Extended Exhale | Both | Focus 3-10 | Entry | "Breathe in for three. Now out... for six." | Pranayama
B-07: Breath at Forehead | Still | Focus 10 | Intermediate | "Follow the breath upward... between your eyebrows." | VBT #5
B-08: Humming Breath | Still | Focus 3-10 | Entry | "Close your lips. Exhale with a steady hum." | Bhramari
B-09: Breath Suspension | Still | Focus 10 | Intermediate | "Exhale completely. Don't breathe. Be in the gap." | VBT #4

BODY (10 techniques):
S-01: Body Scan | Still | Focus 3-10 | Entry | "Feel your feet... your ankles... your shins..." | Yoga Nidra
S-02: Body Dissolution | Still | Focus 10 | Intermediate | "Feel your feet... and let them dissolve." | VBT #20
S-03: Hollow Body | Still | Focus 10 | Intermediate | "Your body is a container... with nothing inside." | VBT #26
S-04: Whole Body Awareness | Both | Focus 3 | Intermediate | "Feel your entire body at once. Every surface." | VBT #40
S-05: Single Point Focus | Still | Focus 3-10 | Entry | "All attention on one point. The center of your chest." | VBT #76
S-06: Sensation Without Reaction | Still | Focus 3-10 | Entry | "Something will arise. Don't move. Just watch." | Vipassana
S-07: Paired Sensations | Still | Focus 10 | Intermediate | "Feel heaviness... and lightness... at the same time." | Yoga Nidra
S-08: Pre-Movement Awareness | Active | Focus 3 | Intermediate | "Before your foot lifts — catch the impulse." | VBT #90
S-09: Five Element Dissolution | Still | Focus 10-12 | Intermediate | "Feel solidity dissolving... like earth into water." | VBT #23
S-10: Inner Fire | Still | Focus 10-12 | Intermediate | "A point of warmth at your navel. It grows." | VBT #73

VISUAL (10 techniques):
V-01: Point of Light | Still | Focus 3-10 | Entry | "A point of light between your eyebrows. Bright." | VBT #30
V-02: Central Channel | Still | Focus 10-12 | Intermediate | "A column of light from base of spine to crown." | VBT #31
V-03: Heart Space | Still | Focus 10-12 | Intermediate | "The space inside your chest... vast... limitless." | VBT #28
V-04: Rising Energy | Still | Focus 10-12 | Intermediate | "Energy rising from the base... upward... to the crown." | VBT #24
V-05: Body of Light | Still | Focus 12 | Intermediate | "Your whole body glowing from inside. Every cell." | VBT #64
V-06: Five Elements Visual | Still | Focus 10-12 | Intermediate | "At the base... a golden light. Earth. Solid." | VBT #69
V-07: Dissolving Form | Still | Focus 12-15 | Advanced | "Everything dissolving... becoming transparent." | VBT #19
V-08: Spatial Expansion | Still | Focus 12 | Advanced | "Awareness expanding... beyond the walls... into sky." | VBT #61
V-09: Darkness Gazing | Still | Focus 10-12 | Intermediate | "Gaze into the darkness. Watch what appears." | VBT #103
V-10: Intention Seed | Still | Focus 10 | Entry | "State your intention. Present tense. Already true." | Yoga Nidra

SOUND (6 techniques):
A-01: Riding the Sound | Both | Focus 3-10 | Entry | "Let the sound carry you. Become it." | VBT #12
A-02: Inner Sound | Still | Focus 10-12 | Intermediate | "Listen for the sound inside. A ringing. A hum." | VBT #16
A-03: Mantra Repetition | Both | Focus 3-10 | Entry | "Repeat silently. Again. Let it become automatic." | VBT #17
A-04: Silence After Sound | Still | Focus 10 | Entry | "Enter the silence." | VBT #18
A-05: Humming Resonance | Still | Focus 3 | Entry | "Find a comfortable hum. Feel where it vibrates." | Nada Yoga
A-06: Sensory Gating | Still | Focus 10-12 | Intermediate | "Close your eyes. Cover your ears. Seal inside." | VBT #49

PERCEPTION (7 techniques):
P-01: Space Between Objects | Active | Focus 3 | Entry | "Don't look at things. Look at the space between." | VBT #34
P-02: Soft Gaze | Active | Focus 3-10 | Entry | "Soften your gaze. Let the edges blur." | VBT #80
P-03: World as Art | Active | Focus 3 | Entry | "Everything you see — a moving painting." | VBT #74
P-04: Non-Reactive Perception | Active | Focus 3 | Intermediate | "See everything. Follow nothing." | VBT #59
P-05: Spatial Awareness Field | Both | Focus 3-10 | Entry | "Feel the space around your body. All sides." | VBT #106
P-06: Awareness of Awareness | Both | Focus 3 | Intermediate | "Notice that you're noticing." | VBT #63
P-07: Decision Point Awareness | Active | Focus 3 | Intermediate | "Every micro-decision. Catch the choosing." | VBT #95

INQUIRY (7 techniques):
I-01: Who Am I? | Still | Focus 12-15 | Advanced | "Who am I? Don't answer. Just ask." | VBT #83
I-02: I Am Without Attributes | Still | Focus 12-15 | Advanced | "Drop your name. Drop your story. Just... I am." | VBT #60
I-03: Observing Thought | Both | Focus 3-10 | Entry | "Watch your thoughts. They come. They go." | VBT #37
I-04: Source of Thought | Still | Focus 10-12 | Advanced | "A thought appeared. Where did it come from?" | VBT #89
I-05: Emotion as Energy | Both | Focus 3-10 | Intermediate | "Drop the story. Feel only the energy." | VBT #65
I-06: Sitting With Desire | Still | Focus 3-10 | Intermediate | "The wanting is here. Don't fight it. Don't feed it." | VBT #57
I-07: Awareness of Awareness | Still | Focus 15 | Advanced | "Be aware... of being aware." | VBT #63

## AUDIO ENGINE SPECIFICATION

### Still Mode Audio Layers

Layer 1 — Binaural Foundation:

- Two sine oscillators (Tone.Oscillator), one per stereo channel
- Carrier frequency: 100-200 Hz range
- Beat frequency by level:
  - Sync (Focus 3): 10 Hz (alpha)
  - Edge (Focus 10): 4-7 Hz (theta) + 8 Hz alpha floor
  - Expand (Focus 12): 3-5 Hz (deep theta) + 40 Hz gamma bursts every 30s
  - Void (Focus 15): 2-4 Hz (theta-delta) + 40 Hz sustained gamma

Layer 2 — Harmonic Drone:

- Tone.Oscillator (sine + subtle triangle harmonic at 3rd partial)
- Static root note, no chord changes
- Very slow filter movement (60+ second cycles)
- Inspired by tanpura — warmth without musical structure

Layer 3 — Ambient Texture:

- Tone.Noise (brown) → Tone.Filter (lowpass, automated) → Reverb
- Volume: very low (-28 to -24 dB)
- Filter cutoff drifts slowly (30-60s cycles)

Layer 4 — Voice (mixed in separately):

- Ducking: music reduces 3-4 dB when voice active
- Same reverb bus as drone layer
- Timing by level:
  - Sync: every 20-30 seconds
  - Edge: every 60-120 seconds
  - Expand: every 2-5 minutes
  - Void: 2-3 prompts total then silence

### Active Mode Audio — Three Profiles

DRIFT (Focus 3 → light 10):

- BPM: 108-118
- Rhythm: Barely-there kick (one per 2 bars), no hi-hats
- Texture: Granular, organic, crackle, found-sound perc
- Harmony: Warm pads, slow chord shifts (1 per 32 bars max)
- Reverb: 10+ seconds, heavy wet
- Binaural: 7 Hz theta in sub-bass
- Reference: Four Tet, Floating Points

PULSE (Focus 3):

- BPM: 118-126
- Rhythm: Clean kick (four-on-floor), sparse offbeat hats
- Texture: Cleaner, tighter reverb, more defined
- Harmony: Minimal — bass note + single pad
- Reverb: 3 seconds
- Binaural: 10 Hz alpha in sub-bass, hat velocity modulation
- Reference: Early Burial, Jon Hopkins

DEPTH (Focus 3 → 10 border):

- BPM: 90-106
- Rhythm: One kick per bar, barely audible. No hats.
- Texture: Pure ambient, massive pads, infinite reverb
- Harmony: Single sustained note or very slow movement
- Reverb: 14+ seconds
- Binaural: 5 Hz theta primary
- Reference: Floating Points + Pharoah Sanders "Promises", Brian Eno

### Tone.js Synth Architecture

```typescript
// Rhythm
kick: Tone.MembraneSynth → Tone.Compressor → master
hat: Tone.NoiseSynth (white, short env) → Tone.Filter (bandpass 7kHz) → delay → master
perc: Tone.MetalSynth → delay → master

// Harmonic
bass: Tone.MonoSynth (sine, lowpass) → master
pad: Tone.PolySynth (sine) → Tone.Chorus → Tone.Filter → reverb → master
drone: Tone.Oscillator (sine) + Tone.Oscillator (triangle, -12dB, 3rd harmonic) → reverb → master

// Texture
ambientNoise: Tone.Noise (brown) → Tone.Filter (lowpass, automated) → master
grainTexture: Tone.Noise (brown) → Tone.Filter (highpass 3kHz) → Tone.Tremolo (0.3Hz) → reverb

// Entrainment (hidden)
binauralL: Tone.Oscillator (sine) → Tone.Panner(-1) → master
binauralR: Tone.Oscillator (sine) → Tone.Panner(+1) → master
subBass: Tone.Oscillator (sine) → Tone.Tremolo(target Hz) → master

// Effects
reverb: Tone.Reverb → master
delay: Tone.FeedbackDelay → reverb
master: Tone.Gain(0.45) → Tone.getDestination()
```

## AI SESSION GENERATION

When user starts a session, the app calls Claude API with:

```typescript
const systemPrompt = `You are the KAY-OS session engine. Given a user's current state, preferences, progression level, and session history, generate a personalized session plan.

Return ONLY valid JSON with this structure:
{
  "mode": "still" | "active",
  "activeProfile": "drift" | "pulse" | "depth" | null,
  "focusLevel": "sync" | "edge" | "expand" | "void",
  "duration": number (seconds),
  "techniques": ["B-01", "S-03", ...],
  "guidanceScript": [
    { "time": 0, "text": "Close your eyes.", "duration": 5 },
    { "time": 30, "text": "Feel your breath.", "duration": 5 },
    ...
  ],
  "audioConfig": {
    "binauralFreq": number,
    "carrier": number,
    "bpm": number | null,
    "key": string | null,
    "reverbDecay": number,
    "noiseLevel": number
  },
  "reasoning": "Brief explanation of why these choices"
}`;

const userMessage = `
User state: ${JSON.stringify(stateAssessment)}
Current level: ${user.currentLevel}
Session history (last 5): ${JSON.stringify(recentSessions)}
Preferences: ${JSON.stringify(user.preferences)}
Available techniques at this level: ${JSON.stringify(availableTechniques)}
Time available: ${timeAvailable} minutes
`;
```

## USER FLOW

1. First launch → Onboarding:
   a. Welcome screen: "US military studied this for 20 years. We turned it into a training system."
   b. How it works: Audio + ancient techniques + AI
   c. Headphones check
   d. First session demo: 3-min Sync (Focus 3) with breath awareness
   e. Save profile
2. Home screen (returning user):
   a. Primary CTA: "Start Session" (AI-generated)
   b. Quick state check-in (mood + energy + time)
   c. AI generates session → user sees plan → taps Begin
   d. Browse section: need-based categories + method filter + full library
3. Session playback:
   a. Full-screen dark UI
   b. Canvas visualizer (profile-specific animations)
   c. Audio plays (binaural + music/tones)
   d. Guidance text fades in/out on schedule
   e. Breath pacer animation (if breath technique active)
   f. Timer
   g. Session complete → depth rating (1-10) → brief reflection → save
4. Dashboard:
   a. Current level + progress to next
   b. Session streak
   c. Total sessions / minutes
   d. Technique exposure map
   e. Depth rating trend

## DESIGN SYSTEM

Theme: Ultra-dark, monochrome with accent colors per state.
Background: #05050C
Text primary: #E5E7EB
Text secondary: #4B5563
Text muted: #2A2A3A
Border: #ffffff06

Accent colors (by profile/level):

- Drift / Theta: #A78BFA (purple)
- Pulse / Alpha: #60A5FA (blue)
- Depth / Recovery: #34D399 (green)
- Level up: #FBBF24 (amber)
- Warning/stop: #EF4444 (red)

Typography:

- Headings: 'DM Mono' or 'JetBrains Mono', monospace
- Body: 'Inter', -apple-system, sans-serif
- Guidance text: 'Inter', light weight (300), italic, generous line-height (1.8)

Spacing: Generous padding (20-32px), breathing room everywhere.
Borders: Near-invisible (1px solid #ffffff06).
Animations: Slow, eased (0.3-0.5s transitions). Nothing fast or jarring.
No emojis in the main UI. Minimal iconography. Text-forward design.

## IMPORTANT CONSTRAINTS

- NEVER use the terms "Hemi-Sync", "Gateway Experience", "Gateway Voyage", "iRest", or "The Monroe Institute" in any user-facing text
- Use KAY-OS's own level names: Sync, The Edge, Expand, Void, Bridge
- Make NO medical/health claims. Use experiential language: "train awareness", "explore consciousness", not "reduce anxiety" or "treat insomnia"
- All session audio is generated in real-time with Tone.js — no pre-recorded meditation tracks
- Voice synthesis happens via API call, not in-browser
- PWA must work offline for session playback (cache audio engine code)
- Headphone detection: prompt user to connect headphones before any session (binaural beats require stereo separation)

## SCAFFOLD INSTRUCTIONS

1. Initialize the Next.js project with TypeScript, Tailwind, and all dependencies
2. Set up the complete file structure as specified above
3. Implement the full technique library as a typed data module
4. Build the Tone.js audio engine with still mode and all three active profiles
5. Create the Supabase schema migrations
6. Build the session generation API route with Claude integration
7. Implement the onboarding flow
8. Build the home screen with AI-suggested and manual browse paths
9. Build the session playback screen with visualizer, guidance text, and timer
10. Build the dashboard with progression tracking
11. Configure PWA manifest and service worker
12. Set up Zustand stores for session, user, and audio state

Start with steps 1-4 (project init, technique library, audio engine) as these are the foundation everything else depends on. Build working code, not stubs.
