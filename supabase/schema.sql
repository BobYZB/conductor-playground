create extension if not exists pgcrypto;

create table if not exists public.reading_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  doc_slug text not null,
  last_page integer not null check (last_page >= 1),
  updated_at timestamptz not null default now(),
  unique (user_id, doc_slug)
);

create index if not exists reading_progress_user_updated_idx
  on public.reading_progress (user_id, updated_at desc);

alter table public.reading_progress enable row level security;

drop policy if exists "Users can read their own progress" on public.reading_progress;
create policy "Users can read their own progress"
  on public.reading_progress
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own progress" on public.reading_progress;
create policy "Users can insert their own progress"
  on public.reading_progress
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own progress" on public.reading_progress;
create policy "Users can update their own progress"
  on public.reading_progress
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own progress" on public.reading_progress;
create policy "Users can delete their own progress"
  on public.reading_progress
  for delete
  using (auth.uid() = user_id);
