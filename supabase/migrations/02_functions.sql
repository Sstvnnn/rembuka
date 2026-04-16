create or replace function public.find_citizen_by_nik(input_nik text)
returns table (nik text, full_name text, email text, location text)
language sql security definer set search_path = public as $$
  select c.nik, c.full_name, c.email, c.location
  from public.citizens as c
  where c.nik = regexp_replace(input_nik, '\D', '', 'g')
    and c.is_active = true
  limit 1;
$$;

create or replace function public.find_citizen_by_nik_email(input_nik text, input_email text)
returns table (nik text, full_name text, email text, location text)
language sql security definer set search_path = public as $$
  select c.nik, c.full_name, c.email, c.location
  from public.citizens as c
  where c.nik = regexp_replace(input_nik, '\D', '', 'g')
    and lower(c.email) = lower(trim(input_email))
    and c.is_active = true
  limit 1;
$$;

grant execute on function public.find_citizen_by_nik(text) to anon, authenticated;
grant execute on function public.find_citizen_by_nik_email(text, text) to anon, authenticated;