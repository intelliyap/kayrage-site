-- ============================================================================
-- 002_sessions.sql — Session history table
-- ============================================================================
-- Every meditation session (completed or abandoned) is recorded here.
-- The AI-generated session plan is stored as JSONB for full replay and
-- analytics.
-- ============================================================================

create table public.sessions (
  id               uuid           primary key default gen_random_uuid(),
  user_id          uuid           references public.users on delete cascade not null,
  mode             text           not null
                     check (mode in ('still', 'active', 'transition')),
  active_profile   text
                     check (active_profile is null or active_profile in ('drift', 'pulse', 'depth')),
  focus_level      text           not null
                     check (focus_level in ('sync', 'edge', 'expand', 'void', 'bridge')),
  techniques       text[]         not null,
  duration_planned integer        not null,       -- seconds
  duration_actual  integer,                       -- seconds (filled on completion)
  depth_rating     integer
                     check (depth_rating is null or (depth_rating >= 1 and depth_rating <= 10)),
  state_before     jsonb,                         -- { mood, energy, time_of_day }
  state_after      jsonb,                         -- { mood, energy, notes }
  ai_session_plan  jsonb,                         -- full AI-generated session config
  completed        boolean        default false,
  created_at       timestamptz    default now()
);

-- Indexes for common query patterns
create index idx_sessions_user_id      on public.sessions (user_id);
create index idx_sessions_user_created on public.sessions (user_id, created_at desc);
create index idx_sessions_focus_level  on public.sessions (user_id, focus_level);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.sessions enable row level security;

-- Users can read only their own sessions
create policy "sessions_select_own"
  on public.sessions
  for select
  using (auth.uid() = user_id);

-- Users can insert sessions for themselves
create policy "sessions_insert_own"
  on public.sessions
  for insert
  with check (auth.uid() = user_id);

-- Users can update only their own sessions (e.g. adding depth rating post-session)
create policy "sessions_update_own"
  on public.sessions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can delete only their own sessions
create policy "sessions_delete_own"
  on public.sessions
  for delete
  using (auth.uid() = user_id);
