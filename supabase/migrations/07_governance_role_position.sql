alter table public.governance
  add column if not exists position text;

update public.governance
set position = case
  when position is not null and btrim(position) <> '' then position
  when lower(btrim(role)) = 'admin' then 'Administrator'
  when lower(btrim(role)) = 'governance' then 'Government Official'
  else role
end;

update public.governance
set role = case
  when lower(btrim(role)) = 'admin' then 'admin'
  else 'governance'
end;

alter table public.governance
  alter column role set default 'governance',
  alter column position set not null;

alter table public.governance
  drop constraint if exists governance_role_check;

alter table public.governance
  add constraint governance_role_check
  check (role in ('admin', 'governance'));
