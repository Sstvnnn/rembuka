insert into storage.buckets (id, name, public)
values ('citizen-cards', 'citizen-cards', false)
on conflict (id) do nothing;

create policy "Anonymous and authenticated users can upload citizen cards"
on storage.objects for insert to anon, authenticated
with check (bucket_id = 'citizen-cards');

create policy "Anyone can view citizen cards"
on storage.objects for select to anon, authenticated
using (bucket_id = 'citizen-cards');