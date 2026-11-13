-- Run this ONCE in Supabase → SQL Editor → New query → Run.
-- Adds the shared stats table for the Scoreboard and "she already trained today" nudges.
-- Only streaks, days trained and PR counts are shared, never workouts, weights, body stats or photos.
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
