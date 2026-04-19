
create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null, -- 'Infrastructure', 'Education', 'Health', 'Environment', 'Social'
  location text not null,
  image_url text,
  status text not null default 'pending', -- 'pending', 'verified', 'rejected', 'voting', 'approved', 'completed'
  estimated_cost numeric default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Rank 1 = 3 points, Rank 2 = 2 points, Rank 3 = 1 point
create table if not exists public.proposal_votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  rank integer not null check (rank in (1, 2, 3)),
  points integer not null check (points in (1, 2, 3)),
  created_at timestamptz not null default timezone('utc', now()),
  -- A user can only have singular rank
  unique (user_id, rank),
  -- User cant vote same proposal 
  unique (user_id, proposal_id)
);

create table if not exists public.budget_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  amount numeric not null,
  category text not null,
  description text,
  fiscal_year integer not null default extract(year from now()),
  is_active boolean default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_tax_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  annual_income numeric default 0,
  estimated_tax_paid numeric default 0,
  last_updated timestamptz not null default timezone('utc', now())
);

alter table public.proposals enable row level security;
alter table public.proposal_votes enable row level security;
alter table public.budget_items enable row level security;
alter table public.user_tax_profiles enable row level security;

-- policies for proposals
create policy "Proposals are viewable by everyone" on public.proposals
  for select using (true);

create policy "Citizens can submit proposals" on public.proposals
  for insert to authenticated with check (auth.uid() = author_id);

create policy "Authors can update their pending proposals" on public.proposals
  for update to authenticated 
  using (auth.uid() = author_id and status = 'pending');

-- policies for voting
create policy "Votes are viewable by everyone" on public.proposal_votes
  for select using (true);

create policy "Users can vote for proposals" on public.proposal_votes
  for insert to authenticated with check (auth.uid() = user_id);

create policy "Users can change their votes" on public.proposal_votes
  for update to authenticated using (auth.uid() = user_id);

create policy "Users can remove their votes" on public.proposal_votes
  for delete to authenticated using (auth.uid() = user_id);

-- policies for budget
create policy "Budget items are viewable by everyone" on public.budget_items
  for select using (true);

-- policies for tax
create policy "Users can view own tax profile" on public.user_tax_profiles
  for select to authenticated using (auth.uid() = user_id);

create policy "Users can insert own tax profile" on public.user_tax_profiles
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own tax profile" on public.user_tax_profiles
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- sets point base rank
create or replace function public.set_proposal_vote_points()
returns trigger as $$
begin
  if new.rank = 1 then
    new.points := 3;
  elsif new.rank = 2 then
    new.points := 2;
  elsif new.rank = 3 then
    new.points := 1;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger tr_set_proposal_vote_points
  before insert or update on public.proposal_votes
  for each row execute function public.set_proposal_vote_points();


create or replace view public.proposal_rankings as
select 
  p.id,
  p.author_id,
  p.title,
  p.description,
  p.category,
  p.location,
  p.image_url,
  p.status,
  p.estimated_cost,
  p.created_at,
  p.updated_at,
  coalesce(sum(v.points), 0) as total_points,
  count(v.id) as total_votes
from public.proposals p
left join public.proposal_votes v on p.id = v.proposal_id
group by p.id;

grant select on public.proposal_rankings to authenticated;
grant select on public.proposal_rankings to anon;

create policy "Users can view other users names" on public.users
  for select using (true);dont fo

INSERT INTO public.budget_items (title, amount, category, description, fiscal_year)
VALUES
  ('Regional Road Maintenance', 5000000000, 'Infrastructure', 'Repair and maintenance of primary and secondary roads across the district.', 2024),
  ('Public School Digitalization', 2500000000, 'Education', 'Providing laptops and high-speed internet to 50 local schools.', 2024),
  ('Healthcare Subsidy Program', 4000000000, 'Health', 'Funding for local clinics and medicine subsidies for low-income families.', 2024),
  ('Waste Management System', 1500000000, 'Environment', 'Modernizing garbage collection and recycling facilities.', 2024),
  ('Community Sports Centers', 1000000000, 'Social', 'Construction of multipurpose sports courts in three sub-districts.', 2024),
  ('Emergency Response Unit', 800000000, 'Safety', 'Procurement of new ambulances and fire safety equipment.', 2024);

INSERT INTO public.user_tax_profiles (user_id, annual_income, estimated_tax_paid) VALUES ('2386c15f-f80c-46a9-8857-c7f7c9523f71',60000000, 300000) ON CONFLICT (user_id) DO UPDATE SET annual_income = EXCLUDED.annual_income, estimated_tax_paid = EXCLUDED.estimated_tax_paid, last_updated = now();

ALTER TABLE public.proposals DROP COLUMN IF EXISTS image_url;

ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS language text DEFAULT 'id';

CREATE TABLE IF NOT EXISTS public.proposal_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  image_path text NOT NULL,
  created_at timestamptz DEFAULT timezone('utc', now())
);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('proposal-attachments', 'proposal-attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'proposal-attachments');

CREATE POLICY "Authors can upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'proposal-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

ALTER TABLE public.proposal_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Images viewable by everyone" ON public.proposal_images 
FOR SELECT USING (true);

CREATE POLICY "Authors can manage images" ON public.proposal_images 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.proposals
    WHERE id = proposal_images.proposal_id AND author_id = auth.uid()
  )
);

DROP VIEW IF EXISTS public.proposal_rankings;

CREATE OR REPLACE VIEW public.proposal_rankings AS
SELECT
  p.id,
  p.author_id,
  p.title,
  p.description,
  p.category,
  p.location,
  p.status,
  p.estimated_cost,
  p.created_at,
  p.language,
  COALESCE(
    (SELECT array_agg(image_path) FROM public.proposal_images WHERE proposal_id = p.id),
    '{}'
  ) as image_paths,
  COALESCE(SUM(v.points), 0) as total_points,
  COUNT(v.id) as total_votes
FROM public.proposals p
LEFT JOIN public.proposal_votes v ON p.id = v.proposal_id
GROUP BY p.id;

GRANT SELECT ON public.proposal_rankings TO authenticated;
GRANT SELECT ON public.proposal_rankings TO anon;


DROP VIEW IF EXISTS public.proposal_rankings;

ALTER TABLE public.proposals DROP COLUMN IF EXISTS language;


ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS expiry_date timestamptz;


CREATE OR REPLACE VIEW public.proposal_rankings AS
SELECT
  p.id,
  p.author_id,
  COALESCE(u.full_name, 'Citizen') as author_name,
  p.title,
  p.description,
  p.category,
  p.location,
  p.status,
  p.estimated_cost,
  p.expiry_date,
  p.created_at,
  p.updated_at,
  COALESCE(
    (SELECT array_agg(image_path) FROM public.proposal_images WHERE proposal_id = p.id),
    '{}'
  ) as image_paths,
  COALESCE((SELECT SUM(points) FROM public.proposal_votes WHERE proposal_id = p.id), 0) as total_points,
  COALESCE((SELECT COUNT(id) FROM public.proposal_votes WHERE proposal_id = p.id), 0) as total_votes
FROM public.proposals p
LEFT JOIN public.users u ON p.author_id = u.id;

GRANT SELECT ON public.proposal_rankings TO authenticated;
GRANT SELECT ON public.proposal_rankings TO anon;

CREATE POLICY "Governance can update proposal status"
ON public.proposals
FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.governance WHERE id = auth.uid())
);