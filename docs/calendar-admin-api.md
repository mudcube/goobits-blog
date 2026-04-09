# Calendar Admin API

Living reference for calendar admin endpoints used by the admin UI and e2e smoke tests.

## People Access

### `GET /api/calendar/admin/users/:id/access`

Returns per-program access for a calendar user.

Response:

```ts
{
	ok: true
	access: Array<{ programSlug: string; allowed: boolean }>
}
```

### `PUT /api/calendar/admin/users/:id/access`

Updates per-program access for a calendar user.

Body:

```ts
{
	access: Array<{ programSlug: string; allowed: boolean }>
}
```

Response:

```ts
{ ok: true }
```

## Waitlist Promotion

### `POST /api/calendar/admin/events/:id/waitlist/:entryId/promote`

Promotes a waitlisted participant when capacity allows.

Response:

```ts
{
	ok: true
	status: 'promoted' | 'already_joined' | 'full'
}
```

## Payment Defaults

### `GET /api/calendar/admin/settings/payment`

Returns global payment defaults used when an event does not override payment settings.

Response:

```ts
{
	ok: true
	payment: { provider: string | null; handle: string | null }
}
```

### `PUT /api/calendar/admin/settings/payment`

Updates global payment defaults.

Body:

```ts
{
	provider: string | null
	handle: string | null
}
```

Response:

```ts
{ ok: true }
```

## Event Templates

### `GET /api/calendar/admin/events/templates`

Returns recent events that can be used as copy-from templates.

Response:

```ts
{
	ok: true
	templates: Array<{
		id: number
		title: string
		activitySlug: string
		capacity: number
		costCents: number
		currency: string
		paymentProvider: string | null
		paymentHandle: string | null
		paymentNoteTemplate: string | null
		location: string | null
		note: string | null
	}>
}
```

## Event Detail

### `GET /api/calendar/admin/events/:id/detail`

Returns full event detail for the admin event detail sheet.

Response:

```ts
{
	ok: true
	event: {
		id: number
		title: string
		waitlistCount: number
		paymentProvider: string | null
		paymentHandle: string | null
		paymentNoteTemplate: string | null
	}
	weather: { summary: string; temperatureF: number } | null
	attendees: Array<{
		userId: number
		name: string
		email: string
		status: 'joined' | 'waitlist'
		waitlistPosition?: number | null
	}>
}
```
