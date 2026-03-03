// ---------------------------------------------------------------------------
// User Store — Zustand v5
// ---------------------------------------------------------------------------
// Persists user profile, preferences, progression, and streak data.
// Hydrated from Supabase on auth; written back after mutations.
// ---------------------------------------------------------------------------

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Tone = "direct" | "gentle" | "clinical";
export type SessionLength = "short" | "medium" | "long";
export type VoiceGender = "male" | "female";
export type ActiveProfile = "drift" | "pulse" | "depth";
export type FocusLevelId = "sync" | "edge" | "expand" | "void" | "bridge";

export interface UserPreferences {
  tone: Tone;
  sessionLength: SessionLength;
  voiceGender: VoiceGender;
  activeProfile: ActiveProfile;
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
  /** Increment session count and total minutes after a completed session */
  incrementSession: (minutes: number) => void;
  /** Recalculate streak based on the current date and last session */
  updateStreak: () => void;
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
  // Set both to start of UTC day, then compare
  da.setUTCHours(0, 0, 0, 0);
  db.setUTCHours(0, 0, 0, 0);
  const diff = db.getTime() - da.getTime();
  return diff === 86_400_000; // exactly 24 hours
}

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

      incrementSession: (minutes) => {
        const user = get().user;
        if (!user) return;
        const now = new Date().toISOString();
        set({
          user: {
            ...user,
            totalSessions: user.totalSessions + 1,
            totalMinutes: user.totalMinutes + minutes,
            lastSessionAt: now,
          },
        });
      },

      updateStreak: () => {
        const user = get().user;
        if (!user) return;

        const now = new Date().toISOString();

        if (!user.lastSessionAt) {
          // First ever session — start the streak
          set({
            user: {
              ...user,
              currentStreak: 1,
              longestStreak: Math.max(user.longestStreak, 1),
              lastSessionAt: now,
            },
          });
          return;
        }

        if (isSameDay(user.lastSessionAt, now)) {
          // Already practiced today — no streak change
          return;
        }

        if (isConsecutiveDay(user.lastSessionAt, now)) {
          // Consecutive day — increment streak
          const newStreak = user.currentStreak + 1;
          set({
            user: {
              ...user,
              currentStreak: newStreak,
              longestStreak: Math.max(user.longestStreak, newStreak),
              lastSessionAt: now,
            },
          });
        } else {
          // Streak broken — reset to 1
          set({
            user: {
              ...user,
              currentStreak: 1,
              lastSessionAt: now,
            },
          });
        }
      },

      advanceLevel: (newLevel) => {
        const user = get().user;
        if (!user) return;
        set({
          user: {
            ...user,
            currentLevel: newLevel,
          },
        });
      },

      completeOnboarding: () => {
        const user = get().user;
        if (!user) return;
        set({
          user: {
            ...user,
            onboardingCompleted: true,
          },
        });
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
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
