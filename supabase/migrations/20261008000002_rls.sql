-- สิทธิ์การอ่านเขียน · NFR-06

alter table public.admins    enable row level security;
alter table public.rounds    enable row level security;
alter table public.works     enable row level security;
alter table public.votes     enable row level security;
alter table public.audit_log enable row level security;

revoke all on schema private from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- รอบ อ่านได้ทุกคน แก้ผ่านฟังก์ชันผู้ดูแลเท่านั้น
create policy rounds_read on public.rounds for select using (true);

-- ผลงาน ตารางจริงอ่านได้เฉพาะเจ้าของและผู้ดูแล · BR-001
-- บอร์ดสาธารณะอ่านผ่าน public.board() ซึ่งไม่คืนชื่อเจ้าของ
create policy works_owner_or_admin_read on public.works
  for select using (owner_id = auth.uid() or public.is_admin());

-- หัวใจ ไม่มี policy ใด ๆ · เข้าถึงผ่านฟังก์ชันเท่านั้น · BR-007

create policy admins_admin_all on public.admins
  for all using (public.is_admin()) with check (public.is_admin());

create policy audit_admin_read on public.audit_log
  for select using (public.is_admin());
