-- =====================================================================
-- Bicis Sapiens — signups table
--
-- Replaces the broken Base44 Subscriber.create flow used by JoinModal
-- (movement signups) and AppCTA (app waitlist). Single table, `type`
-- column distinguishes the two streams so the team can filter / export
-- either group from the Supabase dashboard.
--
-- Public anon INSERT, no public SELECT — admin reads via the dashboard
-- (service_role bypasses RLS). Email notifications are sent in parallel
-- by the frontend via Formsubmit; this table is the persistent store
-- of record.
-- =====================================================================

create table if not exists signups (
  id              uuid primary key default gen_random_uuid(),
  type            text not null check (type in ('movement', 'app_waitlist')),
  email           text not null,
  name            text,
  phone           text,
  city            text,
  language        text,
  consent_given   boolean not null default false,
  source          text,
  created_at      timestamptz not null default now()
);

create index if not exists signups_type_created_idx
  on signups(type, created_at desc);
create index if not exists signups_email_idx on signups(email);

alter table signups enable row level security;

-- Anyone can submit a signup (the form on the public site)
drop policy if exists "signups_insert_anyone" on signups;
create policy "signups_insert_anyone" on signups
  for insert with check (true);

-- No anon SELECT / UPDATE / DELETE — admin only via dashboard.
-- (RLS enabled + no select policy → implicit deny for anon role.)

select 'OK — signups table ready.' as result;
