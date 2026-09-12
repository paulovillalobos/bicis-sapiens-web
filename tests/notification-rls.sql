-- Disposable PostgreSQL database only. No production credentials required.
-- auth.uid() models Supabase's JWT subject; the public migration is unchanged.
\set ON_ERROR_STOP on
begin;
create role anon nologin;
create role authenticated nologin;
create schema auth;
create table auth.users (
  id uuid primary key, email text, raw_user_meta_data jsonb default '{}'
);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
grant usage on schema public, auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
\ir ../supabase/migrations/0001_init.sql
-- Synthetic identities exercise the actual signup trigger and actual RLS policy.
insert into auth.users (id,email) values
 ('00000000-0000-0000-0000-000000000001','alice@example.invalid'),
 ('00000000-0000-0000-0000-000000000002','bob@example.invalid');
grant select,insert,update,delete on notification_settings to anon,authenticated;
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
do $$
declare changed integer;
begin
  if (select count(*) from notification_settings) <> 1 then
    raise exception 'READ: expected exactly the signed-in user row';
  end if;
  update notification_settings set frequency='never' where user_id=auth.uid();
  get diagnostics changed = row_count;
  if changed <> 1 then raise exception 'UPDATE: own settings must be writable'; end if;
  update notification_settings set frequency='never'
    where user_id='00000000-0000-0000-0000-000000000002';
  get diagnostics changed = row_count;
  if changed <> 0 then raise exception 'UPDATE: another user row was writable'; end if;
  delete from notification_settings where user_id='00000000-0000-0000-0000-000000000002';
  get diagnostics changed = row_count;
  if changed <> 0 then raise exception 'DELETE: another user row was deletable'; end if;
  begin
    insert into notification_settings(user_id) values('00000000-0000-0000-0000-000000000003');
    raise exception 'INSERT: foreign ownership was accepted';
  exception when insufficient_privilege then null;
  end;
  begin
    update notification_settings set user_id='00000000-0000-0000-0000-000000000003'
      where user_id=auth.uid();
    raise exception 'WITH CHECK: ownership transfer was accepted';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
set role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
  if (select count(*) from notification_settings) <> 0 then
    raise exception 'ANON: unauthenticated reader saw private settings';
  end if;
end $$;
reset role;
do $$ begin
  if (select frequency from notification_settings where user_id='00000000-0000-0000-0000-000000000002') <> 'daily' then
    raise exception 'ISOLATION: Bob settings changed';
  end if;
end $$;
rollback;
\echo 'PASS: ownership reads, own update, foreign update/delete/insert, ownership transfer, anonymous read and isolation'
