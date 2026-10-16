-- ที่เก็บภาพผลงาน · BR-008
-- ที่อยู่ไฟล์ {round_id}/{user_id}/{เวลา}.jpg

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('showcase-works', 'showcase-works', true, 10485760, array['image/png', 'image/jpeg'])
on conflict (id) do nothing;

create policy showcase_works_upload_own_folder on storage.objects
  for insert to authenticated
  with check (bucket_id = 'showcase-works' and (storage.foldername(name))[2] = auth.uid()::text);

create policy showcase_works_delete_own_or_admin on storage.objects
  for delete to authenticated
  using (bucket_id = 'showcase-works' and ((storage.foldername(name))[2] = auth.uid()::text or showcase.is_admin()));
