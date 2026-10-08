-- ฟังก์ชันทั้งหมดที่หน้าเว็บเรียก · กติกาบังคับที่ฐานข้อมูล · NFR-05

-- ---------- ตัวช่วย ----------

create or replace function private.voter_key()
returns text
language sql stable security definer
set search_path = public, private, extensions
as $$
  select encode(
    hmac(auth.uid()::text, (select value from private.settings where key = 'voter_pepper'), 'sha256'),
    'hex');
$$;

create or replace function private.require_admin()
returns void
language plpgsql stable security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'ไม่มีสิทธิ์' using errcode = '42501';
  end if;
end $$;

create or replace function private.log(p_action text, p_target text)
returns void
language sql security definer
set search_path = public
as $$
  insert into public.audit_log (admin_email, action, target)
  values (lower(coalesce(auth.jwt() ->> 'email', '')), p_action, coalesce(p_target, ''));
$$;

create or replace function private.counts_visible(p_show_counts text, p_vote_status text)
returns boolean
language sql immutable
as $$
  select case p_show_counts
           when 'always' then true
           when 'never'  then false
           else p_vote_status = 'closed'
         end;
$$;

-- ---------- บอร์ด · SCR-001 SCR-003 SCR-007 ----------

-- รอบที่แสดงอยู่ ไม่มีแถวแปลว่าไม่มีรอบที่แสดง · FR-012
create or replace function public.shown_round()
returns table (id uuid, name text, period text, hearts_per_user int, upload_open boolean,
               vote_status text, counts_visible boolean, upload_close_label text, vote_close_label text)
language sql stable security definer
set search_path = public, private
as $$
  select r.id, r.name, r.period, r.hearts_per_user, r.upload_open, r.vote_status,
         private.counts_visible(r.show_counts, r.vote_status), r.upload_close_label, r.vote_close_label
  from public.rounds r where r.is_shown limit 1;
$$;

-- ผลงานบนบอร์ด ไม่มีชื่อเจ้าของ · FR-007 FR-013 FR-014 BR-001 BR-006 BR-018
create or replace function public.board()
returns table (work_id uuid, code text, style text, tone text, image_path text,
               image_w int, image_h int, hearts int, rank int, is_mine boolean)
language sql stable security definer
set search_path = public, private
as $$
  with r as (select * from public.rounds where is_shown limit 1),
  w as (
    select w.* from public.works w join r on w.round_id = r.id where w.status = 'shown'
  ),
  c as (
    select v.work_id, count(*)::int as n from public.votes v join w on w.id = v.work_id group by v.work_id
  ),
  ranked as (
    select w.*, coalesce(c.n, 0) as n, rank() over (order by coalesce(c.n, 0) desc)::int as rk
    from w left join c on c.work_id = w.id
  )
  select x.id, x.code, x.style, x.tone, x.image_path, x.image_w, x.image_h,
         case when private.counts_visible(r.show_counts, r.vote_status) then x.n end,
         case when private.counts_visible(r.show_counts, r.vote_status) then x.rk end,
         coalesce(x.owner_id = auth.uid(), false)
  from ranked x cross join r
  order by x.code;
$$;

-- หัวใจที่ฉันให้ในรอบที่แสดง · FR-017 FR-031
create or replace function public.my_votes()
returns table (work_id uuid, code text)
language sql stable security definer
set search_path = public, private, extensions
as $$
  select v.work_id, w.code
  from public.votes v
  join public.works w on w.id = v.work_id
  join public.rounds r on r.id = v.round_id and r.is_shown
  where auth.uid() is not null and v.voter_key = private.voter_key()
  order by w.code;
$$;

-- ---------- โหวต · FR-015 ถึง FR-021 ----------

create or replace function public.cast_vote(p_work uuid)
returns void
language plpgsql security definer
set search_path = public, private, extensions
as $$
declare
  w public.works;
  r public.rounds;
  k text;
  used int;
begin
  if auth.uid() is null then
    raise exception 'ต้องเข้าสู่ระบบก่อน' using errcode = '28000';
  end if;
  select * into w from public.works where id = p_work and status = 'shown';
  if not found then raise exception 'ไม่พบผลงาน'; end if;
  select * into r from public.rounds where id = w.round_id;
  if not (r.is_shown and r.vote_status = 'open') then              -- BR-005
    raise exception 'ปิดโหวตแล้ว';
  end if;
  if not r.allow_self_vote and w.owner_id = auth.uid() then         -- BR-004
    raise exception 'โหวตผลงานของตัวเองไม่ได้';
  end if;
  k := private.voter_key();
  perform pg_advisory_xact_lock(hashtext(k));                       -- กันกดพร้อมกันหลายแท็บ
  select count(*) into used from public.votes where round_id = r.id and voter_key = k;
  if exists (select 1 from public.votes where work_id = w.id and voter_key = k) then
    return;                                                         -- BR-003 โหวตซ้ำไม่มีผล
  end if;
  if used >= r.hearts_per_user then                                 -- BR-003 BR-020
    raise exception 'ครบ % หัวใจแล้ว ถอนหัวใจจากผลงานอื่นก่อน', r.hearts_per_user;
  end if;
  insert into public.votes (work_id, round_id, voter_key) values (w.id, r.id, k);
end $$;

create or replace function public.retract_vote(p_work uuid)
returns void
language plpgsql security definer
set search_path = public, private, extensions
as $$
declare
  r public.rounds;
begin
  if auth.uid() is null then
    raise exception 'ต้องเข้าสู่ระบบก่อน' using errcode = '28000';
  end if;
  select r2.* into r from public.rounds r2 join public.works w on w.round_id = r2.id where w.id = p_work;
  if not found then raise exception 'ไม่พบผลงาน'; end if;
  if not (r.is_shown and r.vote_status = 'open') then              -- BR-005
    raise exception 'ปิดโหวตแล้ว';
  end if;
  delete from public.votes where work_id = p_work and voter_key = private.voter_key();
end $$;

-- ---------- ส่งผลงาน · FR-022 ถึง FR-031 ----------

-- ส่งใหม่หรือแก้ไขผลงานเดิมของตัวเอง คืนรหัสผลงาน · FR-026 FR-028
create or replace function public.submit_work(
  p_round uuid, p_image_path text, p_w int, p_h int,
  p_style text, p_tone text, p_consent boolean)
returns text
language plpgsql security definer
set search_path = public
as $$
declare
  r public.rounds;
  existing public.works;
  seq int;
  new_code text;
  claims jsonb := auth.jwt();
begin
  if auth.uid() is null then
    raise exception 'ต้องเข้าสู่ระบบก่อน' using errcode = '28000';
  end if;
  if not coalesce(p_consent, false) then                            -- BR-010
    raise exception 'ยืนยันว่าผลงานไม่มีข้อมูลส่วนบุคคลของผู้อื่นก่อน';
  end if;
  select * into r from public.rounds where id = p_round;
  if not found or not r.upload_open then                            -- BR-009
    raise exception 'ปิดรับผลงานแล้ว';
  end if;
  if split_part(p_image_path, '/', 1) <> p_round::text
     or split_part(p_image_path, '/', 2) <> auth.uid()::text then
    raise exception 'ที่อยู่ไฟล์ไม่ถูกต้อง';
  end if;

  select * into existing from public.works where round_id = p_round and owner_id = auth.uid();
  if found then
    update public.works
       set image_path = p_image_path, image_w = p_w, image_h = p_h,
           style = trim(p_style), tone = trim(p_tone), updated_at = now()
     where id = existing.id;
    return existing.code;
  end if;

  update public.rounds set next_seq = next_seq + 1 where id = p_round returning next_seq - 1 into seq;
  new_code := r.code_prefix || lpad(seq::text, 2, '0');                -- BR-011
  insert into public.works (round_id, code, owner_id, owner_name, owner_email,
                            style, tone, image_path, image_w, image_h)
  values (p_round, new_code, auth.uid(),
          coalesce(claims -> 'user_metadata' ->> 'full_name', claims ->> 'email', ''),
          lower(coalesce(claims ->> 'email', '')),
          trim(p_style), trim(p_tone), p_image_path, p_w, p_h);
  return new_code;
end $$;

-- ยกเลิกการส่งผลงาน คืนที่อยู่ไฟล์ให้หน้าเว็บลบออกจาก Storage · FR-029 BR-012
create or replace function public.cancel_work(p_work uuid)
returns text
language plpgsql security definer
set search_path = public
as $$
declare
  w public.works;
  r public.rounds;
begin
  select * into w from public.works where id = p_work and owner_id = auth.uid();
  if not found then raise exception 'ไม่พบผลงาน'; end if;
  select * into r from public.rounds where id = w.round_id;
  if not r.upload_open then raise exception 'ปิดรับผลงานแล้ว'; end if;
  delete from public.works where id = w.id;                         -- หัวใจหายตาม cascade
  return w.image_path;
end $$;

-- ผลงานของฉันทุกรอบ · FR-030 FR-056
create or replace function public.my_works()
returns table (work_id uuid, round_id uuid, round_name text, code text, style text, tone text,
               image_path text, image_w int, image_h int, status text, upload_open boolean,
               vote_status text, hearts int, rank int, total int)
language sql stable security definer
set search_path = public, private
as $$
  with mine as (select * from public.works where owner_id = auth.uid()),
  per as (
    select w.id, w.round_id, count(v.*)::int as n
    from public.works w left join public.votes v on v.work_id = w.id
    where w.status = 'shown' and w.round_id in (select round_id from mine)
    group by w.id, w.round_id
  ),
  ranked as (
    select id, round_id, n, rank() over (partition by round_id order by n desc)::int as rk,
           count(*) over (partition by round_id)::int as total
    from per
  )
  select m.id, m.round_id, r.name, m.code, m.style, m.tone, m.image_path, m.image_w, m.image_h,
         m.status, r.upload_open, r.vote_status,
         case when private.counts_visible(r.show_counts, r.vote_status) then k.n end,
         case when private.counts_visible(r.show_counts, r.vote_status) then k.rk end,
         k.total
  from mine m
  join public.rounds r on r.id = m.round_id
  left join ranked k on k.id = m.id
  order by r.created_at;
$$;

-- ---------- ผู้ดูแล · FR-032 ถึง FR-055 ----------

create or replace function public.admin_save_round(
  p_id uuid, p_name text, p_period text, p_prefix text, p_hearts int,
  p_allow_self boolean, p_show_counts text, p_upload_label text, p_vote_label text)
returns uuid
language plpgsql security definer
set search_path = public, private
as $$
declare
  rid uuid;
begin
  perform private.require_admin();
  if p_id is null then
    insert into public.rounds (name, period, code_prefix, hearts_per_user, allow_self_vote,
                               show_counts, upload_close_label, vote_close_label)
    values (p_name, coalesce(p_period, ''), upper(p_prefix), p_hearts, p_allow_self,
            p_show_counts, p_upload_label, p_vote_label)
    returning id into rid;
    perform private.log('เพิ่มรอบ', p_name);
  else
    if exists (select 1 from public.rounds
               where id = p_id and vote_status = 'open' and hearts_per_user <> p_hearts) then
      raise exception 'เปลี่ยนจำนวนหัวใจได้เฉพาะตอนที่ยังไม่เปิดโหวต';
    end if;
    update public.rounds
       set name = p_name, period = coalesce(p_period, ''), code_prefix = upper(p_prefix),
           hearts_per_user = p_hearts, allow_self_vote = p_allow_self, show_counts = p_show_counts,
           upload_close_label = p_upload_label, vote_close_label = p_vote_label
     where id = p_id
    returning id into rid;
    perform private.log('แก้ไขรอบ', p_name);
  end if;
  return rid;
end $$;

-- เลือกรอบที่แสดง · BR-002
create or replace function public.admin_show_round(p_round uuid, p_on boolean)
returns void
language plpgsql security definer
set search_path = public, private
as $$
begin
  perform private.require_admin();
  if p_on then
    update public.rounds
       set is_shown = false, upload_open = false,
           vote_status = case when vote_status = 'open' then 'closed' else vote_status end
     where is_shown and id <> p_round;
  end if;
  update public.rounds set is_shown = p_on where id = p_round;
  perform private.log(case when p_on then 'แสดงบนบอร์ด' else 'ซ่อนจากบอร์ด' end,
                      (select name from public.rounds where id = p_round));
end $$;

create or replace function public.admin_set_upload(p_round uuid, p_open boolean)
returns void
language plpgsql security definer
set search_path = public, private
as $$
begin
  perform private.require_admin();
  update public.rounds set upload_open = p_open where id = p_round;
  perform private.log(case when p_open then 'เปิดรับผลงาน' else 'ปิดรับผลงาน' end,
                      (select name from public.rounds where id = p_round));
end $$;

create or replace function public.admin_set_vote(p_round uuid, p_status text)
returns void
language plpgsql security definer
set search_path = public, private
as $$
begin
  perform private.require_admin();
  update public.rounds set vote_status = p_status where id = p_round;
  perform private.log(case p_status when 'open' then 'เปิดโหวต' when 'closed' then 'ปิดโหวต' else 'รีเซ็ตสถานะโหวต' end,
                      (select name from public.rounds where id = p_round));
end $$;

-- ลบรอบที่ยังไม่มีผลงาน · BR-013
create or replace function public.admin_delete_round(p_round uuid)
returns void
language plpgsql security definer
set search_path = public, private
as $$
begin
  perform private.require_admin();
  if exists (select 1 from public.works where round_id = p_round) then
    raise exception 'ลบได้เฉพาะรอบที่ยังไม่มีผลงาน';
  end if;
  perform private.log('ลบรอบ', (select name from public.rounds where id = p_round));
  delete from public.rounds where id = p_round;
end $$;

-- ซ่อนหรือนำกลับขึ้นบอร์ด · BR-014
create or replace function public.admin_set_work_hidden(p_work uuid, p_hidden boolean)
returns void
language plpgsql security definer
set search_path = public, private
as $$
begin
  perform private.require_admin();
  update public.works set status = case when p_hidden then 'hidden' else 'shown' end, updated_at = now()
   where id = p_work;
  if p_hidden then
    delete from public.votes where work_id = p_work;
  end if;
  perform private.log(case when p_hidden then 'ซ่อนผลงาน' else 'นำผลงานกลับขึ้นบอร์ด' end,
                      (select code from public.works where id = p_work));
end $$;

-- ลบผลงาน คืนที่อยู่ไฟล์ให้หน้าเว็บลบออกจาก Storage · BR-015
create or replace function public.admin_delete_work(p_work uuid)
returns text
language plpgsql security definer
set search_path = public, private
as $$
declare
  w public.works;
begin
  perform private.require_admin();
  select * into w from public.works where id = p_work;
  if not found then raise exception 'ไม่พบผลงาน'; end if;
  delete from public.works where id = p_work;
  perform private.log('ลบผลงาน', w.code);
  return w.image_path;
end $$;

-- อันดับพร้อมชื่อเจ้าของ · FR-046 FR-048 BR-018 · ไม่มีข้อมูลผู้โหวต BR-007
create or replace function public.admin_results(p_round uuid)
returns table (rank int, code text, owner_name text, owner_email text,
               style text, tone text, hearts int, image_path text, image_w int, image_h int)
language plpgsql stable security definer
set search_path = public, private
as $$
begin
  perform private.require_admin();
  return query
    with c as (
      select w.*, (select count(*)::int from public.votes v where v.work_id = w.id) as n
      from public.works w where w.round_id = p_round and w.status = 'shown'
    )
    select rank() over (order by c.n desc)::int, c.code, c.owner_name, c.owner_email,
           c.style, c.tone, c.n, c.image_path, c.image_w, c.image_h
    from c
    order by 1, c.code;
end $$;

-- สรุปรอบ · FR-047
create or replace function public.admin_round_stats(p_round uuid)
returns table (works int, hidden int, voters int, hearts int)
language plpgsql stable security definer
set search_path = public, private
as $$
begin
  perform private.require_admin();
  return query
    select (select count(*)::int from public.works where round_id = p_round),
           (select count(*)::int from public.works where round_id = p_round and status = 'hidden'),
           (select count(distinct voter_key)::int from public.votes where round_id = p_round),
           (select count(*)::int from public.votes where round_id = p_round);
end $$;

-- ตรวจก่อนลบข้อมูลหลังจบกิจกรรม · BR-017
create or replace function public.admin_can_purge()
returns boolean
language plpgsql stable security definer
set search_path = public, private
as $$
begin
  perform private.require_admin();
  return not exists (select 1 from public.rounds where upload_open or vote_status = 'open');
end $$;

-- ลบผลงานทั้งรอบ คืนรายการไฟล์ให้หน้าเว็บลบออกจาก Storage · FR-053
create or replace function public.admin_purge_round_works(p_round uuid)
returns setof text
language plpgsql security definer
set search_path = public, private
as $$
begin
  perform private.require_admin();
  if not public.admin_can_purge() then
    raise exception 'ปิดรับผลงานและปิดโหวตทุกรอบก่อน';
  end if;
  perform private.log('ลบข้อมูลรอบ', (select name from public.rounds where id = p_round));
  return query delete from public.works where round_id = p_round returning image_path;
end $$;

-- รายชื่อผู้ดูแล · FR-050 FR-051 BR-016
create or replace function public.admin_add_admin(p_email text, p_name text)
returns void
language plpgsql security definer
set search_path = public, private
as $$
begin
  perform private.require_admin();
  insert into public.admins (email, name) values (lower(trim(p_email)), coalesce(p_name, ''))
  on conflict (email) do update set name = excluded.name;
  perform private.log('เพิ่มผู้ดูแล', lower(trim(p_email)));
end $$;

create or replace function public.admin_remove_admin(p_email text)
returns void
language plpgsql security definer
set search_path = public, private
as $$
begin
  perform private.require_admin();
  if lower(p_email) = lower(coalesce(auth.jwt() ->> 'email', '')) then
    raise exception 'ลบอีเมลของตัวเองไม่ได้';
  end if;
  if (select count(*) from public.admins) <= 1 then
    raise exception 'ต้องมีผู้ดูแลอย่างน้อย 1 คน';
  end if;
  delete from public.admins where email = lower(p_email);
  perform private.log('ลบผู้ดูแล', lower(p_email));
end $$;

-- ---------- สิทธิ์เรียกฟังก์ชัน ----------
revoke execute on all functions in schema public from public, anon;
grant execute on function public.shown_round(), public.board() to anon, authenticated;
grant execute on function
  public.is_admin(), public.my_votes(), public.cast_vote(uuid), public.retract_vote(uuid),
  public.submit_work(uuid, text, int, int, text, text, boolean), public.cancel_work(uuid),
  public.my_works(),
  public.admin_save_round(uuid, text, text, text, int, boolean, text, text, text),
  public.admin_show_round(uuid, boolean), public.admin_set_upload(uuid, boolean),
  public.admin_set_vote(uuid, text), public.admin_delete_round(uuid),
  public.admin_set_work_hidden(uuid, boolean), public.admin_delete_work(uuid),
  public.admin_results(uuid), public.admin_round_stats(uuid),
  public.admin_can_purge(), public.admin_purge_round_works(uuid),
  public.admin_add_admin(text, text), public.admin_remove_admin(text)
to authenticated;
