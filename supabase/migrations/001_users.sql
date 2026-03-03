-- ============================================================================
-- 001_users.sql — User profiles table
-- ============================================================================
-- Stores user profile data, preferences, progression state, and streaks.
-- The `id` column references Supabase Auth so every row maps 1:1 to an
-- authenticated user.
-- ============================================================================

create table public.users (
  id               uuid references auth.users on delete cascade primary key,
  display_name     text,
  onboarding_completed boolean    default false,
  current_level    text           default 'sync'
                     check (current_level in ('sync', 'edge', 'expand', 'void', 'bridge')),
  total_sessions   integer        default 0,
  total_minutes    integer        default 0,
  current_streak   integer        default 0,
  longest_streak   integer        default 0,
  last_session_at  timestamptz,
  preferences      jsonb          default '{
    "tone": "direct",
    "session_length": "medium",
    "voice_gender": "male",
    "active_profile": "pulse"
  }'::jsonb,
  created_at       timestamptz    default now()
);

-- Index on last_session_at for streak calculations and dashboard queries
create index idx_users_last_session on public.users (last_session_at);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.users enable row level security;

-- Users can read only their own row
create policy "users_select_own"
  on public.users
  for select
  using (auth.uid() = id);

-- Users can insert their own row (on first sign-up)
create policy "users_insert_own"
  on public.users
  for insert
  with check (auth.uid() = id);

-- Users can update only their own row
create policy "users_update_own"
  on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Users can delete only their own row (account deletion)
create policy "users_delete_own"
  on public.users
  for delete
  using (auth.uid() = id);
