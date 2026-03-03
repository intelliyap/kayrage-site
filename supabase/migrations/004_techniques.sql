-- ============================================================================
-- 004_techniques.sql — Technique interactions tracking table
-- ============================================================================
-- Records each individual technique used within a session. This powers:
-- - Technique exposure maps on the dashboard
-- - AI personalisation (which techniques resonate with this user)
-- - Per-technique depth analytics
-- ============================================================================

create table public.technique_interactions (
  id               uuid           primary key default gen_random_uuid(),
  user_id          uuid           references public.users on delete cascade not null,
  session_id       uuid           references public.sessions on delete cascade not null,
  technique_code   text           not null,       -- e.g. 'B-01', 'V-03'
  focus_level      text           not null
                     check (focus_level in ('sync', 'edge', 'expand', 'void', 'bridge')),
  duration_seconds integer,                       -- time spent on this technique within session
  depth_rating     integer                        -- inherited from session depth rating
                     check (depth_rating is null or (depth_rating >= 1 and depth_rating <= 10)),
  completed        boolean        default false,
  created_at       timestamptz    default now()
);

-- Indexes for common queries
create index idx_technique_interactions_user
  on public.technique_interactions (user_id);

create index idx_technique_interactions_session
  on public.technique_interactions (session_id);

create index idx_technique_interactions_code
  on public.technique_interactions (user_id, technique_code);

-- Composite index for "which techniques has this user used at this level"
create index idx_technique_interactions_user_level
  on public.technique_interactions (user_id, focus_level);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.technique_interactions enable row level security;

-- Users can read only their own technique interactions
create policy "technique_interactions_select_own"
  on public.technique_interactions
  for select
  using (auth.uid() = user_id);

-- Users can insert their own technique interactions
create policy "technique_interactions_insert_own"
  on public.technique_interactions
  for insert
  with check (auth.uid() = user_id);

-- Users can update only their own technique interactions
create policy "technique_interactions_update_own"
  on public.technique_interactions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can delete only their own technique interactions
create policy "technique_interactions_delete_own"
  on public.technique_interactions
  for delete
  using (auth.uid() = user_id);
