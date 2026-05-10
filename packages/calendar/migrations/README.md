# @calendar/migrations

SQL migrations for the calendar D1 database, plus a small runner used by
both the dev shim and production deploy.

## Layout

```
sql/                    ← numbered migration files (0001_*.sql, 0002_*.sql, …)
src/                    ← runner: applies pending migrations in order
```

## Writing a migration

1. Pick the next unused number. Inspect existing files first to avoid
   collisions (a `0006_*` collision shipped historically — don't repeat it).
2. Use `IF NOT EXISTS` / `IF EXISTS` guards so re-runs are safe.
3. SQLite (D1) doesn't support most `ALTER TABLE` operations — use the
   create-new / copy / drop-old / rename pattern for column changes.
4. Wrap multi-statement migrations in a transaction in the runner if they
   need atomicity. (D1 transaction support is limited; check current
   behavior in `src/`.)

## Dev workflow

The dev shim auto-applies migrations on startup. To force a clean apply,
delete `.dev/db.sqlite` and restart the dev server.
