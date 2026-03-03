// ---------------------------------------------------------------------------
// Supabase Database Types
// ---------------------------------------------------------------------------
// Hand-authored types matching the schema defined in the SQL migrations.
// Once `supabase gen types typescript` is available in CI, these can be
// auto-generated — but having them hand-written ensures the rest of the
// codebase can compile before the Supabase project is provisioned.
// ---------------------------------------------------------------------------

export type FocusLevelId = "sync" | "edge" | "expand" | "void" | "bridge";
export type SessionMode = "still" | "active" | "transition";
export type ActiveProfile = "drift" | "pulse" | "depth";

// ---------------------------------------------------------------------------
// JSONB payloads
// ---------------------------------------------------------------------------

export interface UserPreferencesJson {
  tone: "direct" | "gentle" | "clinical";
  session_length: "short" | "medium" | "long";
  voice_gender: "male" | "female";
  active_profile: ActiveProfile;
}

export interface StateBeforeJson {
  mood: string;
  energy: string;
  time_of_day: string;
}

export interface StateAfterJson {
  mood: string;
  energy: string;
  notes: string | null;
}

export interface GuidanceScriptEntry {
  time: number;
  text: string;
  duration: number;
}

export interface SessionAudioConfigJson {
  binauralFreq: number;
  carrier: number;
  bpm: number | null;
  key: string | null;
  reverbDecay: number;
  noiseLevel: number;
}

export interface AiSessionPlanJson {
  mode: SessionMode;
  activeProfile: ActiveProfile | null;
  focusLevel: FocusLevelId;
  duration: number;
  techniques: string[];
  guidanceScript: GuidanceScriptEntry[];
  audioConfig: SessionAudioConfigJson;
  reasoning: string;
}

// ---------------------------------------------------------------------------
// Table Row types
// ---------------------------------------------------------------------------

export interface UsersRow {
  id: string; // uuid, references auth.users
  display_name: string | null;
  onboarding_completed: boolean;
  current_level: FocusLevelId;
  total_sessions: number;
  total_minutes: number;
  current_streak: number;
  longest_streak: number;
  last_session_at: string | null; // timestamptz as ISO string
  preferences: UserPreferencesJson;
  created_at: string; // timestamptz as ISO string
}

export interface SessionsRow {
  id: string; // uuid
  user_id: string; // uuid
  mode: SessionMode;
  active_profile: ActiveProfile | null;
  focus_level: FocusLevelId;
  techniques: string[]; // text[]
  duration_planned: number; // seconds
  duration_actual: number | null; // seconds
  depth_rating: number | null; // 1-10
  state_before: StateBeforeJson | null;
  state_after: StateAfterJson | null;
  ai_session_plan: AiSessionPlanJson | null;
  completed: boolean;
  created_at: string; // timestamptz as ISO string
}

export interface ProgressionRow {
  id: string; // uuid
  user_id: string; // uuid
  level: FocusLevelId;
  unlocked_at: string; // timestamptz as ISO string
  sessions_at_level: number;
  avg_depth_rating: number | null; // numeric(3,1)
  techniques_explored: string[] | null; // text[]
}

export interface TechniqueInteractionsRow {
  id: string; // uuid
  user_id: string; // uuid
  session_id: string; // uuid
  technique_code: string;
  focus_level: FocusLevelId;
  duration_seconds: number | null;
  depth_rating: number | null; // inherited from session
  completed: boolean;
  created_at: string; // timestamptz as ISO string
}

// ---------------------------------------------------------------------------
// Insert types (omit server-generated columns)
// ---------------------------------------------------------------------------

export type UsersInsert = Omit<UsersRow, "created_at"> & {
  created_at?: string;
};

export type SessionsInsert = Omit<SessionsRow, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type ProgressionInsert = Omit<ProgressionRow, "id" | "unlocked_at"> & {
  id?: string;
  unlocked_at?: string;
};

export type TechniqueInteractionsInsert = Omit<
  TechniqueInteractionsRow,
  "id" | "created_at"
> & {
  id?: string;
  created_at?: string;
};

// ---------------------------------------------------------------------------
// Update types (all columns optional except id)
// ---------------------------------------------------------------------------

export type UsersUpdate = Partial<Omit<UsersRow, "id">>;
export type SessionsUpdate = Partial<Omit<SessionsRow, "id">>;
export type ProgressionUpdate = Partial<Omit<ProgressionRow, "id">>;
export type TechniqueInteractionsUpdate = Partial<
  Omit<TechniqueInteractionsRow, "id">
>;

// ---------------------------------------------------------------------------
// Database interface (used to type the Supabase client)
// ---------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UsersRow;
        Insert: UsersInsert;
        Update: UsersUpdate;
      };
      sessions: {
        Row: SessionsRow;
        Insert: SessionsInsert;
        Update: SessionsUpdate;
      };
      progression: {
        Row: ProgressionRow;
        Insert: ProgressionInsert;
        Update: ProgressionUpdate;
      };
      technique_interactions: {
        Row: TechniqueInteractionsRow;
        Insert: TechniqueInteractionsInsert;
        Update: TechniqueInteractionsUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
