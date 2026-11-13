-- Run this ONCE in Supabase → SQL Editor → New query → Run.
-- Turns on live updates: when one of you logs a set, the other's app updates in about 1–2 seconds.
-- Safe to run even if you already ran the scoreboard SQL.
-- Shared between your two accounts: streaks, days trained, today's set count, your latest set (exercise, weight, reps),
-- latest PR and rest countdown. Turn off "Share live activity" in More to share only the counts.
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

do $$ begin
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'gym_public') then
    alter publication supabase_realtime add table public.gym_public;
  end if;
end $$;
