# Reproducible verification

[![Build and RLS](https://github.com/imperiobaal69-web/bicis-sapiens-web/actions/workflows/verify.yml/badge.svg)](https://github.com/imperiobaal69-web/bicis-sapiens-web/actions/workflows/verify.yml)

The workflow builds the application with Node 22 and runs `notification-rls.sql`
against a fresh PostgreSQL 16 service. It applies the checked-in migration rather
than copying its policy into a test. Synthetic auth identities exercise the real
profile/settings signup trigger.

Eight assertions cover own-row reads and updates, foreign updates/deletes/inserts,
ownership transfer, anonymous reads and preservation of another user's settings.
Removing RLS or its `USING`/`WITH CHECK` ownership checks makes these tests fail.

To reproduce, create an empty disposable PostgreSQL database and configure
`PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`. Then run:

```sh
psql -v ON_ERROR_STOP=1 -f tests/notification-rls.sql
npm ci --ignore-scripts
npm run build
```

Never point the test at a production database. The test bootstraps `auth.users`
and a JWT-subject implementation of `auth.uid()`; it does not emulate Supabase
Auth or prove deployed grants, service-role handling, or policies on other tables.
All test objects are rolled back. This is evidence for the ownership contract
shown in the portfolio, not a live database security audit.
