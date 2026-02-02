# @miko/calendar

Calendar integration core for Rainbow Gym.

- Google OAuth + free/busy + event creation via official Google Calendar REST APIs.
- D1 storage helpers for Cloudflare.
- Availability + booking utilities.

Environment:
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REDIRECT_URI
- GOOGLE_CALENDAR_IDS (comma-separated)
- GOOGLE_PRIMARY_CALENDAR_ID (optional)
- ADMIN_PASSCODE (optional)
- TOKEN_ENC_KEY (base64 32-byte key)
- BOOKING_LOCATION (e.g., "Rainbow Gym, Portland OR")
- BOOKING_MIN_NOTICE_HOURS (default 24)
- BOOKING_SLOT_MINUTES (default 60)
- BOOKING_BUFFER_MINUTES (default 15)
- BOOKING_CAPACITY (default 4)
