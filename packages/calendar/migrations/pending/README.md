# Pending migrations

SQL files staged for **future** deploys, gated on a runtime change that
needs to roll out first. The migration runner does not scan this
directory — files here will not auto-run.

When the rollout pre-conditions in a file's header checklist are met,
move the file to `../sql/` (and ship the matching code changes in the
same PR).

| File | Blocked on |
|---|---|
| `0028_drop_legacy_credential_columns.sql` | Migration `0027` live in production + every running build reads `primary_credential` first |
