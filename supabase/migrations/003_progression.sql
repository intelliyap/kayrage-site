-- ============================================================================
-- 003_progression.sql — Level progression tracking table
-- ============================================================================
-- One row per user per focus level. Created when a level is first unlocked.
-- Updated after every session at that level to maintain running aggregates.
-- ============================================================================

create table public.progression (
  id                  uuid           primary key default gen_random_uuid(),
  user_id             uuid           references public.users on delete cascade not null,
  level               text           not null
                        check (level in ('sync', 'edge', 'expand', 'void', 'bridge')),
  unlocked_at         timestamptz    default now(),
  sessions_at_level   integer        default 0,
  avg_depth_rating    numeric(3, 1),
  techniques_explored text[],

  -- Each user can only have one progression row per level
  unique (user_id, level)
);

-- Index for looking up a user's progression across all levels
create index idx_progression_user_id on public.progression (user_id);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.progression enable row level security;

-- Users can read only their own progression data
create policy "progression_select_own"
  on public.progression
  for select
  using (auth.uid() = user_id);

-- Users can insert their own progression rows (on level unlock)
create policy "progression_insert_own"
  on public.progression
  for insert
  with check (auth.uid() = user_id);

-- Users can update only their own progression rows
create policy "progression_update_own"
  on public.progression
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can delete only their own progression data
create policy "progression_delete_own"
  on public.progression
  for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- Seed the initial "sync" level for new users via a trigger
-- ============================================================================

create or replace function public.create_initial_progression()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.progression (user_id, level, unlocked_at)
  values (new.id, 'sync', now());
  return new;
end;
$$;

create trigger on_user_created_progression
  after insert on public.users
  for each row
  execute function public.create_initial_progression();
