create table if not exists public.citizens (
  nik text primary key,
  full_name text not null,
  email text not null unique,
  location text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.citizens enable row level security;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  nik text not null unique,
  email text not null unique,
  full_name text not null,
  location text,
  citizen_card_path text,
  verification_status text not null default 'missing_card',
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.users enable row level security;

create policy "Users can read own profile" on public.users
  for select to authenticated using (auth.uid() = id);

create policy "Users can insert own profile" on public.users
  for insert to authenticated with check (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);