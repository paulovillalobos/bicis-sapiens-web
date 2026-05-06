-- =====================================================================
-- Bicis Sapiens — §07 forum + community infra (Phase A)
--
-- Combines:
--   • §07 base: users, threads, responses (the brief assumed this existed)
--   • This brief's additions: thread_votes, response_votes,
--     parent_response_id+depth on responses, notification_settings
--
-- Run once on a fresh Supabase project. Idempotent-friendly: each block
-- uses IF NOT EXISTS / OR REPLACE so re-running is safe during dev.
-- =====================================================================

-- ---------- 1. PROFILES (extends auth.users) -------------------------

create table if not exists users_profile (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null unique,
  display_name  text not null,
  is_team       boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ---------- 2. ADMIN ALLOWLIST ---------------------------------------
-- Membership = moderation rights. Add the team's emails here in the
-- Supabase dashboard before launch.

create table if not exists admin_emails (
  email text primary key
);

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public
as $$
  select exists(
    select 1 from admin_emails ae
    join auth.users u on u.email = ae.email
    where u.id = auth.uid()
  );
$$;

-- ---------- 3. THREADS -----------------------------------------------

create table if not exists threads (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique not null,
  title               text not null check (length(title) between 1 and 120),
  description         text not null check (length(description) between 1 and 2000),
  author_id           uuid references users_profile(id) on delete set null,
  is_team_prompt      boolean not null default false,
  moderation_status   text not null default 'pending'
                      check (moderation_status in ('pending','approved','rejected')),
  created_at          timestamptz not null default now(),
  approved_at         timestamptz
);

create index if not exists threads_status_created_idx
  on threads(moderation_status, created_at desc);

-- ---------- 4. RESPONSES (with nesting up to depth 2) ----------------

create table if not exists responses (
  id                  uuid primary key default gen_random_uuid(),
  thread_id           uuid not null references threads(id) on delete cascade,
  parent_response_id  uuid references responses(id) on delete cascade,
  depth               int not null default 0 check (depth between 0 and 2),
  body                text not null check (length(body) between 1 and 2000),
  author_id           uuid references users_profile(id) on delete set null,
  moderation_status   text not null default 'pending'
                      check (moderation_status in ('pending','approved','rejected')),
  created_at          timestamptz not null default now(),
  approved_at         timestamptz
);

create index if not exists responses_thread_status_idx
  on responses(thread_id, moderation_status, created_at);

-- Trigger: derive depth from parent. Brief caps nesting at depth 2.
create or replace function set_response_depth() returns trigger
language plpgsql as $$
declare parent_depth int;
begin
  if NEW.parent_response_id is null then
    NEW.depth := 0;
  else
    select depth into parent_depth from responses where id = NEW.parent_response_id;
    if parent_depth is null then
      raise exception 'parent response not found';
    end if;
    NEW.depth := parent_depth + 1;
    if NEW.depth > 2 then
      raise exception 'reply nesting cannot exceed depth 2';
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists set_response_depth_trigger on responses;
create trigger set_response_depth_trigger
  before insert on responses
  for each row execute function set_response_depth();

-- ---------- 5. VOTES (upvote-only, one per user) ---------------------

create table if not exists thread_votes (
  id          uuid primary key default gen_random_uuid(),
  thread_id   uuid not null references threads(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique(thread_id, user_id)
);

create table if not exists response_votes (
  id          uuid primary key default gen_random_uuid(),
  response_id uuid not null references responses(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique(response_id, user_id)
);

-- ---------- 6. NOTIFICATION SETTINGS ---------------------------------

create table if not exists notification_settings (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  frequency      text not null default 'daily'
                 check (frequency in ('daily','never')),
  last_sent_at   timestamptz
);

-- ---------- 7. RANKED THREAD VIEW (HN-style score) -------------------

create or replace view threads_ranked as
select
  t.*,
  coalesce(uv.upvote_count, 0)                       as upvote_count,
  coalesce(rc.reply_count, 0)                        as reply_count,
  rc.last_reply_at,
  up.display_name                                    as author_display_name,
  up.is_team                                         as author_is_team,
  (
    coalesce(uv.upvote_count, 0)::numeric
    + (case when t.is_team_prompt then 2 else 0 end)
  ) / power(extract(epoch from (now() - t.created_at)) / 3600 + 2, 1.5) as score
from threads t
left join (
  select thread_id, count(*)::int as upvote_count
  from thread_votes group by thread_id
) uv on uv.thread_id = t.id
left join (
  select thread_id, count(*)::int as reply_count, max(created_at) as last_reply_at
  from responses where moderation_status = 'approved'
  group by thread_id
) rc on rc.thread_id = t.id
left join users_profile up on up.id = t.author_id
where t.moderation_status = 'approved';

-- ---------- 8. AUTO-CREATE PROFILE ON SIGNUP -------------------------

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into users_profile (id, email, display_name)
  values (
    NEW.id,
    NEW.email,
    coalesce(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  on conflict (id) do nothing;

  insert into notification_settings (user_id, frequency)
  values (NEW.id, 'daily')
  on conflict (user_id) do nothing;

  return NEW;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------- 9. RLS ---------------------------------------------------

alter table users_profile         enable row level security;
alter table threads               enable row level security;
alter table responses             enable row level security;
alter table thread_votes          enable row level security;
alter table response_votes        enable row level security;
alter table notification_settings enable row level security;
alter table admin_emails          enable row level security;

-- profiles: readable by anyone, only self-update
drop policy if exists "profiles_read_all" on users_profile;
create policy "profiles_read_all" on users_profile
  for select using (true);

drop policy if exists "profiles_update_self" on users_profile;
create policy "profiles_update_self" on users_profile
  for update using (auth.uid() = id);

-- threads: public reads only approved; admins see all; auth users insert
drop policy if exists "threads_read_approved" on threads;
create policy "threads_read_approved" on threads
  for select using (moderation_status = 'approved' or is_admin());

drop policy if exists "threads_insert_auth" on threads;
create policy "threads_insert_auth" on threads
  for insert with check (auth.uid() is not null and auth.uid() = author_id);

drop policy if exists "threads_admin_all" on threads;
create policy "threads_admin_all" on threads
  for all using (is_admin()) with check (is_admin());

-- responses: same shape
drop policy if exists "responses_read_approved" on responses;
create policy "responses_read_approved" on responses
  for select using (moderation_status = 'approved' or is_admin());

drop policy if exists "responses_insert_auth" on responses;
create policy "responses_insert_auth" on responses
  for insert with check (auth.uid() is not null and auth.uid() = author_id);

drop policy if exists "responses_admin_all" on responses;
create policy "responses_admin_all" on responses
  for all using (is_admin()) with check (is_admin());

-- votes: anyone reads, only auth user toggles own
drop policy if exists "tvotes_read" on thread_votes;
create policy "tvotes_read" on thread_votes for select using (true);
drop policy if exists "tvotes_insert" on thread_votes;
create policy "tvotes_insert" on thread_votes
  for insert with check (auth.uid() = user_id);
drop policy if exists "tvotes_delete" on thread_votes;
create policy "tvotes_delete" on thread_votes
  for delete using (auth.uid() = user_id);

drop policy if exists "rvotes_read" on response_votes;
create policy "rvotes_read" on response_votes for select using (true);
drop policy if exists "rvotes_insert" on response_votes;
create policy "rvotes_insert" on response_votes
  for insert with check (auth.uid() = user_id);
drop policy if exists "rvotes_delete" on response_votes;
create policy "rvotes_delete" on response_votes
  for delete using (auth.uid() = user_id);

-- notification settings: only self
drop policy if exists "settings_self" on notification_settings;
create policy "settings_self" on notification_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- admin_emails: only admins read; rows added manually via dashboard
drop policy if exists "admin_emails_read" on admin_emails;
create policy "admin_emails_read" on admin_emails for select using (is_admin());

-- ---------- 10. HELPER: GET CURRENT USER'S VOTED THREAD IDS ----------
-- Lets the client efficiently mark "I voted" without N queries.

create or replace function my_thread_votes() returns setof uuid
language sql stable security definer set search_path = public
as $$
  select thread_id from thread_votes where user_id = auth.uid();
$$;

create or replace function my_response_votes() returns setof uuid
language sql stable security definer set search_path = public
as $$
  select response_id from response_votes where user_id = auth.uid();
$$;
