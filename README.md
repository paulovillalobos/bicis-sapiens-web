# bicis-sapiens-web

[![Verify build and RLS](https://github.com/paulovillalobos/bicis-sapiens-web/actions/workflows/verify.yml/badge.svg)](https://github.com/paulovillalobos/bicis-sapiens-web/actions/workflows/verify.yml)

Website for Bicis Sapiens, a civic group in Porto that campaigns for streets
built around people and bicycles. I built it for the group: a landing page with
local mobility numbers, a weekly civic agenda people can vote on without an
account, a newsletter and movement sign-up, and the coats of arms of all 68 parishes
of Greater Porto. A members' forum is built but not switched on yet.

Live: [bicis-sapiens-web.vercel.app](https://bicis-sapiens-web.vercel.app)

## Stack

React 18 and Vite on the front end, Supabase (PostgreSQL, auth, row-level
security) behind it, deployed on Vercel.

## Data and access rules

The schema is in [`supabase/migrations`](supabase/migrations). Anonymous
visitors can insert a sign-up or a vote but can never read other people's rows;
reads happen with the service role from the Supabase dashboard. The policy that
lets a user see only their own notifications is tested against a real
PostgreSQL in CI ([`tests/notification-rls.sql`](tests/notification-rls.sql)),
so a change that loosens it fails the build.

## Run it

```sh
npm ci
printf 'VITE_SUPABASE_URL=...\nVITE_SUPABASE_ANON_KEY=...\n' > .env.local
npm run dev
```

CI runs the production build and the RLS test on every push.

## Credits

Image and data sources for the parish coats of arms are listed in
[`docs/CREDITS.md`](docs/CREDITS.md).
