-- Gym Routine: run this once in Supabase → SQL Editor → New query → Run.

-- 1) One row per user holding their workout log, body stats and photo index
create table if not exists public.gym_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.gym_state enable row level security;

drop policy if exists "own state" on public.gym_state;
create policy "own state" on public.gym_state
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2) Private bucket for monthly progress photos
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

-- Each user can only touch files inside their own folder: <user_id>/...
drop policy if exists "photos read own"   on storage.objects;
drop policy if exists "photos insert own" on storage.objects;
drop policy if exists "photos update own" on storage.objects;
drop policy if exists "photos delete own" on storage.objects;

create policy "photos read own" on storage.objects for select to authenticated
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "photos insert own" on storage.objects for insert to authenticated
  with check (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "photos update own" on storage.objects for update to authenticated
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "photos delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- 3) Scoreboard & nudges: each person shares a small stats summary (streaks, days trained, PR count).
--    No workouts, weights, body stats or photos, just the numbers for the scoreboard.
create table if not exists public.gym_public (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  profile    text not null,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.gym_public enable row level security;
drop policy if exists "read summaries" on public.gym_public;
drop policy if exists "write own summary" on public.gym_public;
create policy "read summaries" on public.gym_public for select to authenticated using (true);
create policy "write own summary" on public.gym_public for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
