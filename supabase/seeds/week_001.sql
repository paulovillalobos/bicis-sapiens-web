-- =====================================================================
-- Bicis Sapiens — Civic Agenda · Week 001 (04–10 MAI 2026)
--
-- Five questions × four options each. ALL TEXT IS RESOLVED VIA i18n
-- (civic_agenda.questions.*) — only translation keys land in the DB.
--
-- Run AFTER 0001_init.sql and 0002_civic_agenda.sql have been applied.
-- Re-runnable: ON CONFLICT DO NOTHING on every insert.
--
-- To rotate to a new week, just insert another set of weekly_questions
-- rows with a different week_id (e.g. '2026-W20') and flip the old
-- week's is_active to false:
--   UPDATE weekly_questions SET is_active=false WHERE week_id='2026-W19';
-- =====================================================================

do $$
declare
  q1_id uuid; q2_id uuid; q3_id uuid; q4_id uuid; q5_id uuid;
  ws constant date := '2026-05-04';
  we constant date := '2026-05-10';
  wid constant text := '2026-W19';
begin

  ---------- Q1 — BOAVISTA CICLOVIA ----------
  insert into weekly_questions (week_id, week_start, week_end, question_key, category_key, position, is_active)
  values (wid, ws, we, 'q1', 'ciclovias', 1, true)
  on conflict (week_id, question_key) do nothing;

  select id into q1_id from weekly_questions
  where week_id = wid and question_key = 'q1';

  insert into vote_options (question_id, option_key, position) values
    (q1_id, 'segregated', 1),
    (q1_id, 'shared30',   2),
    (q1_id, 'metrobus',   3),
    (q1_id, 'nothing',    4)
  on conflict (question_id, option_key) do nothing;

  ---------- Q2 — TROTINETES ----------
  insert into weekly_questions (week_id, week_start, week_end, question_key, category_key, position, is_active)
  values (wid, ws, we, 'q2', 'micromobility', 2, true)
  on conflict (week_id, question_key) do nothing;

  select id into q2_id from weekly_questions
  where week_id = wid and question_key = 'q2';

  insert into vote_options (question_id, option_key, position) values
    (q2_id, 'likebikes',  1),
    (q2_id, 'exclusive',  2),
    (q2_id, 'banned',     3),
    (q2_id, 'regulation', 4)
  on conflict (question_id, option_key) do nothing;

  ---------- Q3 — ZONA 30 ----------
  insert into weekly_questions (week_id, week_start, week_end, question_key, category_key, position, is_active)
  values (wid, ws, we, 'q3', 'speed', 3, true)
  on conflict (week_id, question_key) do nothing;

  select id into q3_id from weekly_questions
  where week_id = wid and question_key = 'q3';

  insert into vote_options (question_id, option_key, position) values
    (q3_id, 'everywhere',  1),
    (q3_id, 'schoolsonly', 2),
    (q3_id, 'shared',      3),
    (q3_id, 'keep50',      4)
  on conflict (question_id, option_key) do nothing;

  ---------- Q4 — BIKE BUS ----------
  insert into weekly_questions (week_id, week_start, week_end, question_key, category_key, position, is_active)
  values (wid, ws, we, 'q4', 'schools', 4, true)
  on conflict (week_id, question_key) do nothing;

  select id into q4_id from weekly_questions
  where week_id = wid and question_key = 'q4';

  insert into vote_options (question_id, option_key, position) values
    (q4_id, 'fullfunding', 1),
    (q4_id, 'schoolself',  2),
    (q4_id, 'logistics',   3),
    (q4_id, 'parents',     4)
  on conflict (question_id, option_key) do nothing;

  ---------- Q5 — ESTACIONAMENTO UNIVERSITÁRIO ----------
  insert into weekly_questions (week_id, week_start, week_end, question_key, category_key, position, is_active)
  values (wid, ws, we, 'q5', 'campus', 5, true)
  on conflict (week_id, question_key) do nothing;

  select id into q5_id from weekly_questions
  where week_id = wid and question_key = 'q5';

  insert into vote_options (question_id, option_key, position) values
    (q5_id, 'university',  1),
    (q5_id, 'cityhall',    2),
    (q5_id, 'partnership', 3),
    (q5_id, 'students',    4)
  on conflict (question_id, option_key) do nothing;

end $$;
