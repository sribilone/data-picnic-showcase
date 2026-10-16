-- สิทธิ์การอ่านเขียน · NFR-06

alter table showcase.admins    enable row level security;
alter table showcase.rounds    enable row level security;
alter table showcase.works     enable row level security;
alter table showcase.votes     enable row level security;
alter table showcase.audit_log enable row level security;

revoke all on schema showcase_private from anon, authenticated;

create or replace function showcase.is_admin()
returns boolean
language sql stable security definer
set search_path = showcase
as $$
  select exists (
    select 1 from showcase.admins
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- รอบ อ่านได้ทุกคน แก้ผ่านฟังก์ชันผู้ดูแลเท่านั้น
create policy rounds_read on showcase.rounds for select using (true);

-- ผลงาน ตารางจริงอ่านได้เฉพาะเจ้าของและผู้ดูแล · BR-001
-- บอร์ดสาธารณะอ่านผ่าน showcase.board() ซึ่งไม่คืนชื่อเจ้าของ
create policy works_owner_or_admin_read on showcase.works
  for select using (owner_id = auth.uid() or showcase.is_admin());

-- หัวใจ ไม่มี policy ใด ๆ · เข้าถึงผ่านฟังก์ชันเท่านั้น · BR-007

create policy admins_admin_all on showcase.admins
  for all using (showcase.is_admin()) with check (showcase.is_admin());

create policy audit_admin_read on showcase.audit_log
  for select using (showcase.is_admin());
