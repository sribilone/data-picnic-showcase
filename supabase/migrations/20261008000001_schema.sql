-- Showcase โหวตผลงาน Infographic · โครงสร้างตาราง
-- อ้างอิง docs/01_FRD.md

create extension if not exists pgcrypto with schema extensions;
-- ใช้ schema ของตัวเอง ไม่ชนกับระบบอื่นใน project เดียวกัน
create schema if not exists showcase;
create schema if not exists showcase_private;
grant usage on schema showcase to anon, authenticated, service_role;
alter default privileges in schema showcase grant all on tables to anon, authenticated, service_role;
alter default privileges in schema showcase grant all on sequences to anon, authenticated, service_role;

-- ผู้ดูแล · BR-016
create table showcase.admins (
  email      text primary key check (email = lower(email)),
  name       text not null default '',
  created_at timestamptz not null default now()
);

-- รอบ · FR-032 ถึง FR-040
create table showcase.rounds (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  period             text not null default '',
  code_prefix        text not null check (code_prefix ~ '^[A-Z]$'),          -- BR-011
  hearts_per_user    int  not null default 3 check (hearts_per_user in (1, 3, 5)), -- BR-003
  allow_self_vote    boolean not null default false,                          -- BR-004
  show_counts        text not null default 'after_close'
                     check (show_counts in ('after_close', 'always', 'never')), -- BR-006
  upload_open        boolean not null default false,                          -- BR-009
  vote_status        text not null default 'not_started'
                     check (vote_status in ('not_started', 'open', 'closed')), -- BR-005
  is_shown           boolean not null default false,                          -- BR-002
  upload_close_label text,
  vote_close_label   text,
  next_seq           int  not null default 1,
  created_at         timestamptz not null default now()
);
create unique index rounds_one_shown on showcase.rounds (is_shown) where is_shown;   -- BR-002
create unique index rounds_prefix_unique on showcase.rounds (code_prefix);

-- ผลงาน · FR-022 ถึง FR-031
create table showcase.works (
  id          uuid primary key default gen_random_uuid(),
  round_id    uuid not null references showcase.rounds (id) on delete cascade,
  code        text not null,
  owner_id    uuid references auth.users (id) on delete set null,
  owner_name  text not null,          -- เก็บ ณ ตอนส่ง ลบบัญชีแล้วชื่อยังอยู่ · ข้อ 7.4
  owner_email text not null,
  style       text not null check (char_length(style) between 1 and 120),
  tone        text not null check (char_length(tone) between 1 and 120),
  image_path  text not null,
  image_w     int  not null check (image_w > 0),
  image_h     int  not null check (image_h > 0),
  status      text not null default 'shown' check (status in ('shown', 'hidden')), -- BR-014
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (round_id, code)
);
create unique index works_one_per_owner on showcase.works (round_id, owner_id)
  where owner_id is not null;                                                  -- BR-009

-- หัวใจ · ไม่เก็บตัวตนผู้โหวต · BR-007
create table showcase.votes (
  work_id    uuid not null references showcase.works (id) on delete cascade,  -- BR-012 BR-014
  round_id   uuid not null references showcase.rounds (id) on delete cascade,
  voter_key  text not null,                                                  -- HMAC ทางเดียว
  created_at timestamptz not null default now(),
  primary key (work_id, voter_key)                                           -- BR-003
);
create index votes_round_voter on showcase.votes (round_id, voter_key);

-- ประวัติการกระทำของผู้ดูแล · FR-054 FR-055
create table showcase.audit_log (
  id          bigint generated always as identity primary key,
  admin_email text not null,
  action      text not null,
  target      text not null default '',
  created_at  timestamptz not null default now()
);

-- ค่าลับ อ่านได้เฉพาะฟังก์ชัน security definer
create table showcase_private.settings (
  key   text primary key,
  value text not null
);
insert into showcase_private.settings (key, value)
values ('voter_pepper', encode(extensions.gen_random_bytes(32), 'hex'))
on conflict (key) do nothing;
