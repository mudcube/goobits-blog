# Admin Redesign Migration Plan (Forward-Only)

## 1. `calendar_user_program_access`
- New table stores explicit member access by program.
- If no rows exist for a user, system treats access as all-enabled during rollout only at migration-time seed.
- Migration seeds existing users with all currently enabled programs.

## 2. `calendar_admin_settings`
- New table for admin global settings.
- Initial keys:
  - `payment_provider`
  - `payment_handle`

## 3. Enforcement
- Booking join checks `calendar_user_program_access`.
- Reject join with `403` if member lacks access.

## 4. Compatibility
- No legacy API responses retained.
- No fallback routes.
- No dual writes.
