-- ข้อมูลเริ่มต้น · แก้อีเมลผู้ดูแลเป็นอีเมลของผู้สอนก่อนรัน แล้วสมัครด้วยอีเมลนี้ก่อนแจกลิงก์ให้ผู้เรียน

insert into showcase.admins (email, name) values
  ('teacher@example.com', 'ผู้สอน')
on conflict (email) do nothing;

insert into showcase.rounds (name, period, code_prefix, hearts_per_user, upload_close_label, vote_close_label)
values
  ('รอบที่ 1', 'ช่วงเช้า', 'A', 3, '14:45', '15:30'),
  ('รอบที่ 2', 'ช่วงบ่าย', 'B', 3, null, null)
on conflict do nothing;
