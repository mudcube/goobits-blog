# Admin Redesign API Contracts (Forward-Only)

## People Access
### GET `/api/calendar/admin/users/:id/access`
- Response: `{ ok: true, access: Array<{ programSlug: string, allowed: boolean }> }`

### PUT `/api/calendar/admin/users/:id/access`
- Body: `{ access: Array<{ programSlug: string, allowed: boolean }> }`
- Response: `{ ok: true }`

## Waitlist Promotion
### POST `/api/calendar/admin/events/:id/waitlist/:entryId/promote`
- Response: `{ ok: true, status: 'promoted' | 'already_joined' | 'full' }`

## Payment Defaults
### GET `/api/calendar/admin/settings/payment`
- Response: `{ ok: true, payment: { provider: string | null, handle: string | null } }`

### PUT `/api/calendar/admin/settings/payment`
- Body: `{ provider: string | null, handle: string | null }`
- Response: `{ ok: true }`

## Event Templates
### GET `/api/calendar/admin/events/templates`
- Response: `{ ok: true, templates: Array<{ id: number, title: string, activitySlug: string, capacity: number, costCents: number, currency: string, paymentProvider: string | null, paymentHandle: string | null, paymentNoteTemplate: string | null, location: string | null, note: string | null }> }`

## Event Detail
### GET `/api/calendar/admin/events/:id/detail`
- Response: `{ ok: true, event: { ... }, weather: { summary: string, temperatureF: number } | null, attendees: Array<{ userId: number, name: string, email: string, status: 'joined' | 'waitlist', waitlistPosition?: number }> }`
