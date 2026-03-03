import { NextResponse } from 'next/server';
import { selectBed, type FocusLevel, type SessionMode } from '@/lib/audio/beds-catalog';
import { resolveVoiceCues } from '@/lib/audio/voice-catalog';
import { r2Url } from '@/lib/storage/r2';
import type { ProfileName } from '@/lib/audio/profiles';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PrepareAudioRequest {
  mode: SessionMode;
  profile?: ProfileName | null;
  focusLevel: FocusLevel;
  duration: number;
  techniques: string[];
  guidanceScript: Array<{ time: number; text: string; duration: number }>;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const body: PrepareAudioRequest = await request.json();

    const { mode, profile, focusLevel, guidanceScript } = body;

    // 1. Select the best matching audio bed
    const bed = selectBed(mode, focusLevel, profile);
    if (!bed) {
      return NextResponse.json(
        { error: `No audio bed found for mode=${mode} level=${focusLevel} profile=${profile}` },
        { status: 404 },
      );
    }

    // 2. Resolve guidance script text into voice cue URLs
    const voiceCues = resolveVoiceCues(guidanceScript);

    // 3. Build full URLs from R2 paths
    const bedUrl = r2Url(bed.r2Path);
    const voiceCueUrls: Record<string, string> = {};
    for (const cue of voiceCues) {
      voiceCueUrls[cue.r2Path] = r2Url(cue.r2Path);
    }

    return NextResponse.json({
      bedUrl,
      bed: {
        id: bed.id,
        mode: bed.mode,
        profile: bed.profile,
        focusLevel: bed.focusLevel,
        duration: bed.duration,
        binauralHz: bed.binauralHz,
        bpm: bed.bpm,
        key: bed.key,
      },
      voiceCues,
      voiceCueUrls,
    });
  } catch (err) {
    console.error('prepare-audio error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
