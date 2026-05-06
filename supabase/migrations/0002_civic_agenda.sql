-- =====================================================================
-- Bicis Sapiens — §07 Civic Agenda (Phase A.5)
--
-- Tables for the weekly 5-question voting layer rendered by
-- src/components/landing/CommunityHub.jsx. Anonymous voting via
-- per-device fingerprint stored in localStorage.
--
-- Strings are NOT stored here. The DB only stores translation keys
-- (question_key, category_key, option_key); the React layer resolves
-- to localized text via civic_agenda.questions.* in i18n.jsx.
--
-- Apply AFTER 0001_init.sql.
-- =====================================================================

-- ---------- 1. WEEKLY QUESTIONS --------------------------------------

create table if not exists weekly_questions (
  id            uuid primary key default gen_random_uuid(),
  week_id       text not null,                     -- ISO "YYYY-Www"
  week_start    date not null,
  week_end      date not null,
  question_key  text not null,                     -- e.g. 'q1' → civic_agenda.questions.q1.title
  category_key  text not null,                     -- e.g. 'ciclovias' (free-form, paired with question_key in i18n)
  position      int  not null,                     -- 1..5 ordering on the page
  is_active     boolean not null default false,
  created_at    timestamptz not null default now(),
  unique (week_id, question_key)
);

create index if not exists weekly_questions_active_idx
  on weekly_questions (is_active, position)
  where is_active = true;

-- ---------- 2. VOTE OPTIONS ------------------------------------------

create table if not exists vote_options (
  id            uuid primary key default gen_random_uuid(),
  question_id   uuid not null references weekly_questions(id) on delete cascade,
  option_key    text not null,                     -- e.g. 'segregated' → civic_agenda.questions.q1.options.segregated
  position      int  not null,
  created_at    timestamptz not null default now(),
  unique (question_id, option_key)
);

-- ---------- 3. VOTE RECORDS (anonymous, fingerprint-keyed) -----------

create table if not exists vote_records (
  id                  uuid primary key default gen_random_uuid(),
  question_id         uuid not null references weekly_questions(id) on delete cascade,
  option_id           uuid not null references vote_options(id) on delete cascade,
  device_fingerprint  text not null,
  created_at          timestamptz not null default now(),
  unique (question_id, device_fingerprint)         -- one vote per question per device
);

create index if not exists vote_records_option_idx on vote_records (option_id);

-- ---------- 4. AGGREGATED VIEW ---------------------------------------
-- One row per active question with options[] and per-option counts.
-- security_invoker so anon callers go through RLS on the underlying
-- tables instead of inheriting view-creator privileges.

drop view if exists weekly_agenda;
create view weekly_agenda
with (security_invoker = true)
as
select
  q.id,
  q.week_id,
  q.week_start,
  q.week_end,
  q.question_key,
  q.category_key,
  q.position,
  q.is_active,
  coalesce(
    (
      select json_agg(
        json_build_object(
          'id',         o.id,
          'option_key', o.option_key,
          'position',   o.position,
          'votes',      coalesce(vc.cnt, 0)
        )
        order by o.position
      )
      from vote_options o
      left join (
        select option_id, count(*)::int as cnt
        from vote_records
        group by option_id
      ) vc on vc.option_id = o.id
      where o.question_id = q.id
    ),
    '[]'::json
  ) as options
from weekly_questions q
where q.is_active = true;

-- ---------- 5. RLS ---------------------------------------------------

alter table weekly_questions enable row level security;
alter table vote_options     enable row level security;
alter table vote_records     enable row level security;

-- Active questions are public-readable
drop policy if exists "questions_read_active" on weekly_questions;
create policy "questions_read_active" on weekly_questions
  for select using (is_active = true or is_admin());

-- Options are public-readable (transitively scoped by question RLS)
drop policy if exists "options_read" on vote_options;
create policy "options_read" on vote_options for select using (true);

-- Vote counts are public-readable so the view can aggregate
drop policy if exists "votes_read" on vote_records;
create policy "votes_read" on vote_records for select using (true);

-- Anyone can insert a vote (anonymous via device fingerprint).
-- Spam protection by unique(question_id, device_fingerprint) +
-- whatever rate limiting we add at the Supabase edge later.
drop policy if exists "votes_insert_anyone" on vote_records;
create policy "votes_insert_anyone" on vote_records
  for insert with check (true);

-- No updates/deletes from clients
drop policy if exists "votes_no_modify" on vote_records;
create policy "votes_no_modify" on vote_records
  for update using (false);

-- Admins manage questions/options via dashboard
drop policy if exists "questions_admin_all" on weekly_questions;
create policy "questions_admin_all" on weekly_questions
  for all using (is_admin()) with check (is_admin());

drop policy if exists "options_admin_all" on vote_options;
create policy "options_admin_all" on vote_options
  for all using (is_admin()) with check (is_admin());
