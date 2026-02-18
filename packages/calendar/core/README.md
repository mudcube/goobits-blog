# @calendar/core

Calendar integration core for Rainbow Gym.

- Google OAuth + free/busy + event creation via official Google Calendar REST APIs.
- D1 storage helpers for Cloudflare.
- Availability + booking utilities.

## Package-specific environment

These have built-in defaults and are only needed to override behavior. All other env vars (`GOOGLE_CLIENT_ID`, `TOKEN_ENC_KEY`, etc.) are documented in `config/env/.env.example`.

| Variable | Default | Description |
|---|---|---|
| `GOOGLE_PRIMARY_CALENDAR_ID` | first in `GOOGLE_CALENDAR_IDS` | Calendar used for writing new events |
| `BOOKING_SLOT_MINUTES` | `60` | Duration of each booking slot |
| `BOOKING_BUFFER_MINUTES` | `15` | Buffer between consecutive slots |
| `BOOKING_CAPACITY` | `4` | Max bookings per slot |
