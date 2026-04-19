create table if not exists public.governance (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role text not null,           
  location text not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.governance enable row level security;

create policy "Governance profiles are viewable by everyone" on public.governance
  for select using (true);

create policy "Governance users can update own profile" on public.governance
  for update to authenticated using (auth.uid() = id);

insert into public.governance (id, full_name, role, location) values ('', 'admin', 'admin', 'admin');