// ---------------------------------------------------------------------------
// User Store — Zustand v5
// ---------------------------------------------------------------------------
// Persists user profile, preferences, progression, and streak data.
// Hydrated from Supabase on auth; written back after mutations.
// ---------------------------------------------------------------------------

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  processSessionCompletion,
  type CompletedSession,
  type UserStats,
} from "@/lib/progression/tracking";
import type { FocusLevelId } from "@/lib/stores/user-types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Tone = "direct" | "gentle" | "clinical";
export type SessionLength = "short" | "medium" | "long";
export type VoiceGender = "male" | "female";
export type ActiveProfile = "drift" | "pulse" | "depth";
export type { FocusLevelId };

export interface UserPreferences {
  tone: Tone;
  sessionLength: SessionLength;
  voiceGender: VoiceGender;
  activeProfile: ActiveProfile;
}

/** Per-level stats for progression tracking */
export interface LevelStatsEntry {
  sessionsCompleted: number;
  totalDepthRating: number;
  avgDepthRating: number;
  techniquesExplored: string[];
}

/** A completed session record for history display */
export interface SessionHistoryEntry {
  id: string;
  mode: string;
  focusLevel: string;
  techniques: string[];
  durationPlanned: number;
  durationActual: number;
  depthRating: number;
  completedAt: string; // ISO 8601
}

export interface UserProfile {
  id: string;
  displayName: string | null;
  currentLevel: FocusLevelId;
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionAt: string | null; // ISO 8601 timestamp
  preferences: UserPreferences;
  onboardingCompleted: boolean;
  createdAt: string; // ISO 8601 timestamp
  /** Per-level progression stats */
  levelStats: Record<string, LevelStatsEntry>;
  /** Completed session history (most recent first, capped at 50) */
  sessionHistory: SessionHistoryEntry[];
}

export interface UserState {
  /** The authenticated user profile (null when signed out or loading) */
  user: UserProfile | null;
  /** Whether the user data is being fetched */
  isLoading: boolean;
  /** Whether the store has been hydrated at least once */
  isHydrated: boolean;
}

export interface UserActions {
  /** Set the full user profile (e.g. after fetching from Supabase) */
  setUser: (user: UserProfile | null) => void;
  /** Partially update user preferences */
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  /**
   * Record a completed session: updates global counts, per-level stats,
   * streak, level progression, and session history in one call.
   */
  recordSession: (session: {
    mode: string;
    focusLevel: string;
    techniques: string[];
    durationPlanned: number;
    durationActual: number;
    depthRating: number;
    completed: boolean;
  }) => { advanced: boolean; newLevel: string | null };
  /** Advance the user to a new focus level */
  advanceLevel: (newLevel: FocusLevelId) => void;
  /** Mark onboarding as completed */
  completeOnboarding: () => void;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
  /** Mark the store as hydrated */
  setHydrated: () => void;
  /** Sign out — clear user data */
  clearUser: () => void;
}

export type UserStore = UserState & UserActions;

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

export const defaultPreferences: UserPreferences = {
  tone: "direct",
  sessionLength: "medium",
  voiceGender: "male",
  activeProfile: "pulse",
};

const defaultUser: UserProfile = {
  id: "local",
  displayName: null,
  currentLevel: "sync",
  totalSessions: 0,
  totalMinutes: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastSessionAt: null,
  preferences: defaultPreferences,
  onboardingCompleted: false,
  createdAt: "2024-01-01T00:00:00.000Z",
  levelStats: {},
  sessionHistory: [],
};

const initialState: UserState = {
  user: defaultUser,
  isLoading: false,
  isHydrated: false,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Check whether two ISO date strings fall on the same calendar day (UTC). */
function isSameDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10);
}

/** Check whether date `a` is exactly one calendar day before `b` (UTC). */
function isConsecutiveDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  da.setUTCHours(0, 0, 0, 0);
  db.setUTCHours(0, 0, 0, 0);
  const diff = db.getTime() - da.getTime();
  return diff === 86_400_000;
}

function updateStreak(user: UserProfile): Pick<UserProfile, "currentStreak" | "longestStreak"> {
  const now = new Date().toISOString();

  if (!user.lastSessionAt) {
    return { currentStreak: 1, longestStreak: Math.max(user.longestStreak, 1) };
  }

  if (isSameDay(user.lastSessionAt, now)) {
    return { currentStreak: user.currentStreak, longestStreak: user.longestStreak };
  }

  if (isConsecutiveDay(user.lastSessionAt, now)) {
    const newStreak = user.currentStreak + 1;
    return { currentStreak: newStreak, longestStreak: Math.max(user.longestStreak, newStreak) };
  }

  return { currentStreak: 1, longestStreak: user.longestStreak };
}

const MAX_HISTORY = 50;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) => {
        set({ user, isLoading: false });
      },

      updatePreferences: (prefs) => {
        const user = get().user;
        if (!user) return;
        set({
          user: {
            ...user,
            preferences: { ...user.preferences, ...prefs },
          },
        });
      },

      recordSession: (session) => {
        const user = get().user;
        if (!user) return { advanced: false, newLevel: null };

        // Build UserStats from current profile for processSessionCompletion
        const currentStats: UserStats = {
          currentLevel: user.currentLevel,
          totalSessions: user.totalSessions,
          totalMinutes: user.totalMinutes,
          levelStats: Object.fromEntries(
            Object.entries(user.levelStats).map(([k, v]) => [
              k,
              { ...v, techniquesExplored: [...v.techniquesExplored] },
            ]),
          ),
        };

        const completedSession: CompletedSession = {
          focusLevel: session.focusLevel,
          durationActual: session.durationActual,
          depthRating: session.depthRating,
          techniques: session.techniques,
          completed: session.completed,
        };

        const result = processSessionCompletion(completedSession, currentStats);
        const streak = updateStreak(user);
        const now = new Date().toISOString();

        // Build history entry
        const historyEntry: SessionHistoryEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          mode: session.mode,
          focusLevel: session.focusLevel,
          techniques: session.techniques,
          durationPlanned: session.durationPlanned,
          durationActual: session.durationActual,
          depthRating: session.depthRating,
          completedAt: now,
        };

        const newHistory = [historyEntry, ...user.sessionHistory].slice(0, MAX_HISTORY);

        set({
          user: {
            ...user,
            currentLevel: result.updatedStats.currentLevel as FocusLevelId,
            totalSessions: result.updatedStats.totalSessions,
            totalMinutes: result.updatedStats.totalMinutes,
            levelStats: result.updatedStats.levelStats,
            sessionHistory: newHistory,
            lastSessionAt: now,
            ...streak,
          },
        });

        return {
          advanced: result.advanced,
          newLevel: result.newLevel?.id ?? null,
        };
      },

      advanceLevel: (newLevel) => {
        const user = get().user;
        if (!user) return;
        set({ user: { ...user, currentLevel: newLevel } });
      },

      completeOnboarding: () => {
        const user = get().user;
        if (!user) return;
        set({ user: { ...user, onboardingCompleted: true } });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setHydrated: () => {
        set({ isHydrated: true });
      },

      clearUser: () => {
        set({ user: null, isLoading: false });
      },
    }),
    {
      name: "kayos-user",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
      migrate: (persisted, version) => {
        // v1 → v2: add levelStats and sessionHistory
        if (version < 2) {
          const state = persisted as { user?: Record<string, unknown> };
          if (state.user) {
            state.user.levelStats = state.user.levelStats ?? {};
            state.user.sessionHistory = state.user.sessionHistory ?? [];
          }
        }
        return persisted as UserStore;
      },
    },
  ),
);
