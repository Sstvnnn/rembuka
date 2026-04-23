create table if not exists public.proposal_periods (
  id uuid primary key default gen_random_uuid(),
  location text not null,
  proposal_start_at timestamptz not null,
  proposal_end_at timestamptz not null,
  voting_start_at timestamptz not null,
  voting_end_at timestamptz not null,
  created_by uuid references public.governance(id) on delete set null,
  updated_by uuid references public.governance(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint proposal_periods_window_check check (
    proposal_start_at < proposal_end_at
    and proposal_end_at < voting_start_at
    and voting_start_at < voting_end_at
  )
);

alter table public.proposal_periods enable row level security;

drop policy if exists "Proposal periods are viewable by authenticated users" on public.proposal_periods;
create policy "Proposal periods are viewable by authenticated users"
on public.proposal_periods
for select
to authenticated
using (true);

drop policy if exists "Governance can manage proposal periods for own location" on public.proposal_periods;
create policy "Governance can manage proposal periods for own location"
on public.proposal_periods
for all
to authenticated
using (
  exists (
    select 1
    from public.governance g
    where g.id = auth.uid()
      and g.role = 'governance'
      and g.location = proposal_periods.location
  )
)
with check (
  exists (
    select 1
    from public.governance g
    where g.id = auth.uid()
      and g.role = 'governance'
      and g.location = proposal_periods.location
  )
);

alter table public.proposals
  add column if not exists period_id uuid references public.proposal_periods(id) on delete cascade,
  add column if not exists reviewed_by uuid references public.governance(id) on delete set null,
  add column if not exists reviewed_at timestamptz;

insert into public.proposal_periods (
  location,
  proposal_start_at,
  proposal_end_at,
  voting_start_at,
  voting_end_at
)
select
  p.location,
  coalesce(min(p.created_at), timezone('utc', now())) - interval '7 day',
  coalesce(max(p.created_at), timezone('utc', now())),
  coalesce(max(p.created_at), timezone('utc', now())) + interval '1 day',
  coalesce(max(p.created_at), timezone('utc', now())) + interval '30 day'
from public.proposals p
where not exists (
  select 1
  from public.proposal_periods pp
  where pp.location = p.location
)
group by p.location;

update public.proposals p
set period_id = pp.id
from public.proposal_periods pp
where pp.location = p.location
  and p.period_id is null;

alter table public.proposals
  alter column period_id set not null;

-- alter table public.proposals
--   drop column if exists expiry_date;

alter table public.proposal_votes
  add column if not exists period_id uuid references public.proposal_periods(id) on delete cascade;

create or replace function public.set_proposal_vote_period()
returns trigger as $$
declare
  proposal_period_id uuid;
begin
  select p.period_id
  into proposal_period_id
  from public.proposals p
  where p.id = new.proposal_id;

  if proposal_period_id is null then
    raise exception 'Proposal period not found for proposal %', new.proposal_id;
  end if;

  new.period_id := proposal_period_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists tr_set_proposal_vote_period on public.proposal_votes;
create trigger tr_set_proposal_vote_period
  before insert or update on public.proposal_votes
  for each row execute function public.set_proposal_vote_period();

update public.proposal_votes v
set period_id = p.period_id
from public.proposals p
where p.id = v.proposal_id
  and v.period_id is null;

alter table public.proposal_votes
  alter column period_id set not null;

alter table public.proposal_votes
  drop constraint if exists proposal_votes_user_id_rank_key,
  drop constraint if exists proposal_votes_user_id_proposal_id_key;

alter table public.proposal_votes
  add constraint proposal_votes_user_period_rank_key unique (user_id, period_id, rank),
  add constraint proposal_votes_user_period_proposal_key unique (user_id, period_id, proposal_id);

drop policy if exists "Authors can update their pending proposals" on public.proposals;
create policy "Authors can update their pending proposals"
on public.proposals
for update
to authenticated
using (
  auth.uid() = author_id
  and status = 'pending'
  and exists (
    select 1
    from public.proposal_periods pp
    where pp.id = proposals.period_id
      and timezone('utc', now()) between pp.proposal_start_at and pp.proposal_end_at
  )
)
with check (
  auth.uid() = author_id
  and status = 'pending'
);

drop policy if exists "Governance can update proposal status" on public.proposals;
create policy "Governance can update proposal status"
on public.proposals
for update
to authenticated
using (
  exists (
    select 1
    from public.governance g
    where g.id = auth.uid()
      and g.role = 'governance'
      and g.location = proposals.location
  )
)
with check (
  exists (
    select 1
    from public.governance g
    where g.id = auth.uid()
      and g.role = 'governance'
      and g.location = proposals.location
  )
);

drop view if exists public.proposal_rankings;

create or replace view public.proposal_rankings as
select
  p.id,
  p.period_id,
  p.author_id,
  coalesce(u.full_name, 'Citizen') as author_name,
  p.title,
  p.description,
  p.category,
  p.location,
  p.status,
  p.estimated_cost,
  pp.proposal_start_at,
  pp.proposal_end_at,
  pp.voting_start_at,
  pp.voting_end_at,
  p.created_at,
  p.updated_at,
  p.reviewed_at,
  coalesce(
    (select array_agg(image_path order by created_at)
     from public.proposal_images
     where proposal_id = p.id),
    '{}'
  ) as image_paths,
  coalesce((select sum(points) from public.proposal_votes where proposal_id = p.id), 0) as total_points,
  coalesce((select count(id) from public.proposal_votes where proposal_id = p.id), 0) as total_votes
from public.proposals p
left join public.users u on u.id = p.author_id
left join public.proposal_periods pp on pp.id = p.period_id;

grant select on public.proposal_rankings to authenticated;
grant select on public.proposal_rankings to anon;

create index if not exists proposal_periods_location_dates_idx
  on public.proposal_periods (location, proposal_start_at, voting_end_at);

create index if not exists proposals_period_status_idx
  on public.proposals (period_id, status, location);

create index if not exists proposal_votes_period_user_idx
  on public.proposal_votes (period_id, user_id);
