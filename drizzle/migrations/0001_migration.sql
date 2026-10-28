create policy "admins manage media" on storage.objects for all to authenticated
using (bucket_id = 'media' and public.has_role(auth.uid(),'admin'))
with check (bucket_id = 'media' and public.has_role(auth.uid(),'admin'));