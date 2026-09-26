-- Architect 2.0 schema. Run once in the Supabase SQL editor.

create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  name        text not null check (char_length(name) between 1 and 120),
  prompt      text check (char_length(prompt) <= 4000),
  created_at  timestamptz not null default now()
);

create table if not exists public.profiles (
  id          uuid primary key default auth.uid() references auth.users on delete cascade,
  lens        text check (lens in ('simple', 'pro')),
  role        text,
  tools       text[] not null default '{}',
  updated_at  timestamptz not null default now()
);

-- Every user can only ever see and change their own rows.
alter table public.projects enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "own projects" on public.projects;
create policy "own projects" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
