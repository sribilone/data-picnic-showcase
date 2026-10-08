-- ข้อมูลเริ่มต้น · แก้อีเมลผู้ดูแลเป็นบัญชี Google ของผู้สอนก่อนรัน

insert into public.admins (email, name) values
  ('teacher@example.com', 'ผู้สอน')
on conflict (email) do nothing;

insert into public.rounds (name, period, code_prefix, hearts_per_user, upload_close_label, vote_close_label)
values
  ('รอบที่ 1', 'ช่วงเช้า', 'A', 3, '14:45', '15:30'),
  ('รอบที่ 2', 'ช่วงบ่าย', 'B', 3, null, null)
on conflict do nothing;
