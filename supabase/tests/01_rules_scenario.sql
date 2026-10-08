\set ON_ERROR_STOP 0
insert into auth.users values
 ('00000000-0000-0000-0000-000000000001','teacher@example.com'),
 ('00000000-0000-0000-0000-000000000011','s11@example.com'),
 ('00000000-0000-0000-0000-000000000012','s12@example.com'),
 ('00000000-0000-0000-0000-000000000013','s13@example.com');
create function pg_temp.as_user(n text) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub','00000000-0000-0000-0000-0000000000'||n,'email',
    case n when '01' then 'teacher@example.com' else 's'||n||'@example.com' end,
    'user_metadata', json_build_object('full_name','นักศึกษา '||n))::text, false) $$;
set role authenticated;

\echo -- admin opens round 1
select pg_temp.as_user('01');
select public.admin_show_round((select id from public.rounds where code_prefix='A'), true);
select public.admin_set_upload((select id from public.rounds where code_prefix='A'), true);
select public.admin_set_vote((select id from public.rounds where code_prefix='A'), 'open');

\echo -- student not admin tries admin fn (expect error)
select pg_temp.as_user('11');
select public.admin_set_vote((select id from public.rounds where code_prefix='A'), 'closed');

\echo -- three students submit
select pg_temp.as_user('11'); select public.submit_work((select id from public.rounds where code_prefix='A'), (select id from public.rounds where code_prefix='A')||'/00000000-0000-0000-0000-000000000011/1.jpg', 1600, 1200, 'ไอโซเมตริก', 'ฟ้าอมเขียว', true);
select pg_temp.as_user('12'); select public.submit_work((select id from public.rounds where code_prefix='A'), (select id from public.rounds where code_prefix='A')||'/00000000-0000-0000-0000-000000000012/1.jpg', 900, 1200, 'มินิมอล', 'เขียว', true);
select pg_temp.as_user('13'); select public.submit_work((select id from public.rounds where code_prefix='A'), (select id from public.rounds where code_prefix='A')||'/00000000-0000-0000-0000-000000000013/1.jpg', 600, 1200, 'ป๊อปอาร์ต', 'เหลือง', true);
\echo -- resubmit edits same code (expect A01)
select pg_temp.as_user('11'); select public.submit_work((select id from public.rounds where code_prefix='A'), (select id from public.rounds where code_prefix='A')||'/00000000-0000-0000-0000-000000000011/2.jpg', 1600, 900, 'ไอโซเมตริก', 'ฟ้า', true);
\echo -- no consent (expect error)
select public.submit_work((select id from public.rounds where code_prefix='A'), 'x', 1,1,'a','b', false);
\echo -- wrong path (expect error)
select public.submit_work((select id from public.rounds where code_prefix='A'), 'other/path.jpg', 1,1,'a','b', true);

\echo -- direct read of works as student 11 (only own row)
select code, owner_name from public.works;
\echo -- board as student 11 (no names, counts hidden)
select code, hearts, rank, is_mine from public.board();

\echo -- voting: self vote (expect error)
select public.cast_vote((select work_id from public.board() where code='A01'));
\echo -- vote A02, A03, then duplicate A02 (no effect)
select public.cast_vote((select work_id from public.board() where code='A02'));
select public.cast_vote((select work_id from public.board() where code='A03'));
select public.cast_vote((select work_id from public.board() where code='A02'));
select * from public.my_votes();
\echo -- set hearts 1 then vote again? use student 12 voting
select pg_temp.as_user('12');
select public.cast_vote((select work_id from public.board() where code='A01'));
select public.cast_vote((select work_id from public.board() where code='A03'));
select pg_temp.as_user('13');
select public.cast_vote((select work_id from public.board() where code='A01'));
select public.cast_vote((select work_id from public.board() where code='A02'));
\echo -- hearts limit: admin sets hearts 1 for round A? test with student 13 extra after lowering
select pg_temp.as_user('01');
select public.admin_save_round(id, name, period, code_prefix, 1, allow_self_vote, show_counts, upload_close_label, vote_close_label) from public.rounds where code_prefix='A';
select pg_temp.as_user('11');
select public.retract_vote((select work_id from public.board() where code='A03'));
select public.cast_vote((select work_id from public.board() where code='A03'));
\echo -- direct votes table read (expect 0 rows / denied)
select count(*) from public.votes;

\echo -- admin stats and results (names visible)
select pg_temp.as_user('01');
select * from public.admin_round_stats((select id from public.rounds where code_prefix='A'));
select rank, code, owner_name, hearts from public.admin_results((select id from public.rounds where code_prefix='A'));
\echo -- hide A02 removes its hearts
select public.admin_set_work_hidden((select id from public.works where code='A02'), true);
select rank, code, hearts from public.admin_results((select id from public.rounds where code_prefix='A'));

\echo -- close voting, board shows counts
select public.admin_set_vote((select id from public.rounds where code_prefix='A'), 'closed');
select pg_temp.as_user('12');
select code, hearts, rank, is_mine from public.board();
select public.cast_vote((select work_id from public.board() where code='A01'));
select code, hearts, rank, total from public.my_works();

\echo -- cancel work while upload open (student 13)
select pg_temp.as_user('13'); select public.cancel_work((select work_id from public.my_works() limit 1));
\echo -- show round 2 closes round 1
select pg_temp.as_user('01');
select public.admin_show_round((select id from public.rounds where code_prefix='B'), true);
select code_prefix, is_shown, upload_open, vote_status from public.rounds order by code_prefix;
select public.admin_can_purge();
select public.admin_delete_round((select id from public.rounds where code_prefix='A'));
select action, target from public.audit_log order by id;
\echo -- anon board
reset role; set role anon; select set_config('request.jwt.claims','',false);
select count(*) from public.board(); select * from public.shown_round();
select public.cast_vote(gen_random_uuid());
reset role; set role authenticated;
\echo -- admin list
select pg_temp.as_user('01');
select public.admin_add_admin('Assistant@Example.com','ผู้ช่วยสอน');
select public.admin_remove_admin('teacher@example.com');
select public.admin_remove_admin('assistant@example.com');
select email from public.admins;
