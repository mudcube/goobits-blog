import type { D1DatabaseLike } from '../../storage/d1.ts'
import { ensureValidGoogleToken, googleCreateEvent, googleDeleteEvent } from '../../providers/google/index.ts'
import { appleCreateEvent, appleDeleteEvent, type AppleCalDavConnection } from '../../providers/apple/caldav.ts'
import { ensureValidOutlookToken, outlookCreateEvent, outlookDeleteEvent } from '../../providers/outlook/index.ts'
import { getConnection, saveConnection } from '../../storage/d1.ts'
import { getEnv } from '../../config/env.ts'
import { getActiveCalendarSyncProvider, type CalendarSyncProvider } from '../../sync/settings.ts'

type SyncJobRow = {
	id: number
	event_id: number
	trigger: string
	requested_by_user_id: string | null
	payload_json: string | null
	status: 'pending' | 'processing' | 'done' | 'failed'
	attempt_count: number
	created_at: number
}

type EventForSync = {
	id: number
	title: string
	starts_at: string
	ends_at: string
	capacity: number
	status: string
	location: string | null
	note: string | null
}

type JobQueueHealth = {
	pending: number
	processing: number
	failed: number
	deadLetter: number
	oldestPendingSeconds: number
	oldestDeadLetterSeconds: number
	hasBacklogAlert: boolean
	hasDeadLetterAlert: boolean
}

const MAX_SYNC_ATTEMPTS = 8
const STALE_PENDING_SECONDS = 10 * 60
const STALE_PROCESSING_SECONDS = 10 * 60
const STALE_EVENT_SYNC_LOCK_SECONDS = 10 * 60

function isMockSyncMode(env: Record<string, unknown>) {
	const mode = String(getEnv(env, 'CALENDAR_SYNC_MODE', 'live') || '')
		.trim()
		.toLowerCase()
	return mode === 'mock' || mode === 'noop' || mode === 'off' || mode === 'disabled'
}

function getPrimaryCalendarIdFromEnv(env: Record<string, unknown>) {
	const primary = getEnv(env, 'GOOGLE_PRIMARY_CALENDAR_ID', '')?.trim()
	if (primary) return primary
	const ids = getEnv(env, 'GOOGLE_CALENDAR_IDS', '') || ''
	return (
		ids
			.split(',')
			.map((id) => id.trim())
			.filter(Boolean)[0] || ''
	)
}

function calendarProviderEventColumns(provider: CalendarSyncProvider) {
	if (provider === 'outlook') return { id: 'outlook_event_id', link: 'outlook_html_link' }
	if (provider === 'apple') return { id: 'apple_event_id', link: 'apple_html_link' }
	return { id: 'google_event_id', link: 'google_html_link' }
}

function nextBackoffSeconds(attemptCount: number) {
	const base = 30
	const expo = Math.min(8, Math.max(0, attemptCount - 1))
	return Math.min(3600, base * 2 ** expo)
}

export async function enqueueCalendarSyncJob(
	db: D1DatabaseLike,
	input: {
		eventId: number
		trigger: string
		requestedByUserId?: string | null
		payload?: Record<string, unknown> | null
	}
) {
	await db
		.prepare(
			`INSERT INTO calendar_sync_jobs (
		  event_id, trigger, requested_by_user_id, payload_json, status, attempt_count, next_attempt_at, created_at, updated_at
		) VALUES (?, ?, ?, ?, 'pending', 0, unixepoch(), unixepoch(), unixepoch())`
		)
		.bind(
			input.eventId,
			input.trigger,
			input.requestedByUserId ?? null,
			input.payload ? JSON.stringify(input.payload) : null
		)
		.run()
}

export async function getCalendarSyncQueueHealth(db: D1DatabaseLike): Promise<JobQueueHealth> {
	try {
		const counts = await db
			.prepare(
				`SELECT
				COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) AS pending,
				COALESCE(SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END), 0) AS processing,
				COALESCE(SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END), 0) AS failed
			FROM calendar_sync_jobs`
			)
			.first<{ pending: number; processing: number; failed: number }>()
		const deadLetter = await db
			.prepare(`SELECT COUNT(*) AS count FROM calendar_sync_dead_letters`)
			.first<{ count: number }>()

		const oldestPending = await db
			.prepare(`SELECT created_at FROM calendar_sync_jobs WHERE status = 'pending' ORDER BY created_at ASC LIMIT 1`)
			.first<{ created_at: number }>()
		const oldestDeadLetter = await db
			.prepare(`SELECT moved_at FROM calendar_sync_dead_letters ORDER BY moved_at ASC LIMIT 1`)
			.first<{ moved_at: number }>()

		const now = Math.floor(Date.now() / 1000)
		const oldestPendingSeconds = oldestPending?.created_at ? Math.max(0, now - oldestPending.created_at) : 0
		const oldestDeadLetterSeconds = oldestDeadLetter?.moved_at ? Math.max(0, now - oldestDeadLetter.moved_at) : 0
		const failed = counts?.failed ?? 0
		const deadLetterCount = deadLetter?.count ?? 0
		return {
			pending: counts?.pending ?? 0,
			processing: counts?.processing ?? 0,
			failed,
			deadLetter: deadLetterCount,
			oldestPendingSeconds,
			oldestDeadLetterSeconds,
			hasBacklogAlert: failed > 0 || oldestPendingSeconds > STALE_PENDING_SECONDS,
			hasDeadLetterAlert: deadLetterCount > 0
		}
	} catch {
		return {
			pending: 0,
			processing: 0,
			failed: 0,
			deadLetter: 0,
			oldestPendingSeconds: 0,
			oldestDeadLetterSeconds: 0,
			hasBacklogAlert: false,
			hasDeadLetterAlert: false
		}
	}
}

async function claimDueJobs(db: D1DatabaseLike, limit = 10) {
	const result = await db
		.prepare(
			`SELECT id, event_id, trigger, requested_by_user_id, payload_json, status, attempt_count, created_at
		 FROM calendar_sync_jobs
		 WHERE (
		   status IN ('pending', 'failed')
		   AND next_attempt_at <= unixepoch()
		 ) OR (
		   status = 'processing'
		   AND locked_at IS NOT NULL
		   AND locked_at <= unixepoch() - ?
		 )
		 ORDER BY id ASC
		 LIMIT ?`
		)
		.bind(STALE_PROCESSING_SECONDS, limit)
		.all<SyncJobRow>()
	const jobs = result?.results ?? []
	const claimed: SyncJobRow[] = []
	for (const job of jobs) {
		const lock = await db
			.prepare(
				`UPDATE calendar_sync_jobs
			 SET status = 'processing', locked_at = unixepoch(), locked_by = ?, updated_at = unixepoch()
			 WHERE id = ? AND (
			   status IN ('pending', 'failed') OR (
			     status = 'processing'
			     AND locked_at IS NOT NULL
			     AND locked_at <= unixepoch() - ?
			   )
			 )`
			)
			.bind('admin-sync-worker', job.id, STALE_PROCESSING_SECONDS)
			.run()
		if ((lock.meta?.changes ?? 0) > 0) claimed.push(job)
	}
	return claimed
}

async function markJobDone(db: D1DatabaseLike, id: number) {
	await db
		.prepare(
			`UPDATE calendar_sync_jobs
		 SET status = 'done', last_error = NULL, updated_at = unixepoch(), locked_at = NULL, locked_by = NULL
		 WHERE id = ?`
		)
		.bind(id)
		.run()
}

async function markJobRetry(db: D1DatabaseLike, id: number, attemptCount: number, errorMessage: string) {
	const backoff = nextBackoffSeconds(attemptCount)
	await db
		.prepare(
			`UPDATE calendar_sync_jobs
		 SET status = 'failed',
		     attempt_count = ?,
		     next_attempt_at = unixepoch() + ?,
		     last_error = ?,
		     updated_at = unixepoch(),
		     locked_at = NULL,
		     locked_by = NULL
		 WHERE id = ?`
		)
		.bind(attemptCount, backoff, errorMessage.slice(0, 400), id)
		.run()
}

async function moveJobToDeadLetter(db: D1DatabaseLike, job: SyncJobRow, attemptCount: number, errorMessage: string) {
	// INSERT OR IGNORE makes this safe to retry if a transient failure occurs
	// between the insert and the delete — the unique index on job_id prevents duplicates.
	await db
		.prepare(
			`INSERT OR IGNORE INTO calendar_sync_dead_letters (
			job_id, event_id, trigger, requested_by_user_id, payload_json, attempt_count, last_error, created_at, moved_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch())`
		)
		.bind(
			job.id,
			job.event_id,
			job.trigger,
			job.requested_by_user_id ?? null,
			job.payload_json ?? null,
			attemptCount,
			errorMessage.slice(0, 400),
			job.created_at
		)
		.run()

	await db.prepare(`DELETE FROM calendar_sync_jobs WHERE id = ?`).bind(job.id).run()
}

async function fetchEventForSync(db: D1DatabaseLike, eventId: number) {
	return db
		.prepare(
			`SELECT id, title, starts_at, ends_at, capacity, status, location, note
		 FROM calendar_events
		 WHERE id = ? LIMIT 1`
		)
		.bind(eventId)
		.first<EventForSync>()
}

async function clearCalendarEventSync(db: D1DatabaseLike, eventId: number) {
	await db
		.prepare(
			`UPDATE calendar_event_sync
		 SET google_event_id = NULL,
		     google_html_link = NULL,
		     outlook_event_id = NULL,
		     outlook_html_link = NULL,
		     apple_event_id = NULL,
		     apple_html_link = NULL,
		     last_synced_at = unixepoch(),
		     last_error = NULL,
		     updated_at = unixepoch()
		 WHERE event_id = ?`
		)
		.bind(eventId)
		.run()
}

async function fetchSeatSummary(db: D1DatabaseLike, eventId: number) {
	return db
		.prepare(
			`SELECT
			COALESCE(SUM(CASE WHEN status = 'joined' THEN 1 + guest_count ELSE 0 END), 0) AS seats_taken,
			COALESCE(SUM(CASE WHEN status = 'waitlist' THEN 1 ELSE 0 END), 0) AS waitlist_count
		 FROM calendar_event_participants
		 WHERE event_id = ?`
		)
		.bind(eventId)
		.first<{ seats_taken: number; waitlist_count: number }>()
}

async function upsertCalendarEventSync(
	db: D1DatabaseLike,
	input: {
		eventId: number
		provider: CalendarSyncProvider
		providerEventId: string
		providerHtmlLink: string | null
		lastError?: string | null
	}
) {
	const columns = calendarProviderEventColumns(input.provider)
	await db
		.prepare(
			`INSERT INTO calendar_event_sync (event_id, ${columns.id}, ${columns.link}, last_synced_at, last_error, updated_at)
		 VALUES (?, ?, ?, unixepoch(), ?, unixepoch())
		 ON CONFLICT(event_id) DO UPDATE SET
		   ${columns.id} = excluded.${columns.id},
		   ${columns.link} = excluded.${columns.link},
		   last_synced_at = excluded.last_synced_at,
		   last_error = excluded.last_error,
		   updated_at = unixepoch()`
		)
		.bind(input.eventId, input.providerEventId, input.providerHtmlLink, input.lastError ?? null)
		.run()
}

async function getPreviousProviderEventId(db: D1DatabaseLike, provider: CalendarSyncProvider, eventId: number) {
	const columns = calendarProviderEventColumns(provider)
	const row = await db
		.prepare(`SELECT ${columns.id} AS provider_event_id FROM calendar_event_sync WHERE event_id = ? LIMIT 1`)
		.bind(eventId)
		.first<{ provider_event_id: string | null }>()
	return row?.provider_event_id ?? null
}

function syncWorkerId(job: SyncJobRow) {
	return `admin-sync-worker:${job.id}`
}

async function acquireEventSyncLock(db: D1DatabaseLike, eventId: number, workerId: string) {
	const result = await db
		.prepare(
			`INSERT INTO calendar_event_sync (event_id, sync_locked_at, sync_locked_by, updated_at)
		 VALUES (?, unixepoch(), ?, unixepoch())
		 ON CONFLICT(event_id) DO UPDATE SET
		   sync_locked_at = excluded.sync_locked_at,
		   sync_locked_by = excluded.sync_locked_by,
		   updated_at = unixepoch()
		 WHERE calendar_event_sync.sync_locked_at IS NULL
		    OR calendar_event_sync.sync_locked_at <= unixepoch() - ?`
		)
		.bind(eventId, workerId, STALE_EVENT_SYNC_LOCK_SECONDS)
		.run()
	return (result.meta?.changes ?? 0) > 0
}

async function releaseEventSyncLock(db: D1DatabaseLike, eventId: number, workerId: string) {
	await db
		.prepare(
			`UPDATE calendar_event_sync
		 SET sync_locked_at = NULL,
		     sync_locked_by = NULL,
		     updated_at = unixepoch()
		 WHERE event_id = ? AND sync_locked_by = ?`
		)
		.bind(eventId, workerId)
		.run()
}

async function syncProviderEvent({
	db,
	env,
	base64Key,
	provider,
	oldProviderEventId,
	eventId,
	status,
	event
}: {
	db: D1DatabaseLike
	env: Record<string, unknown>
	base64Key: string
	provider: CalendarSyncProvider
	oldProviderEventId: string | null
	eventId: number
	status: string
	event: {
		title: string
		description: string
		startsAt: string
		endsAt: string
		location: string | null
	}
}) {
	const connection = await getConnection({ db, provider, base64Key })
	if (!connection) throw new Error(`${provider} calendar connection not found`)

	if (provider === 'google') {
		const calendarId = getPrimaryCalendarIdFromEnv(env)
		if (!calendarId) throw new Error('Missing GOOGLE_PRIMARY_CALENDAR_ID/GOOGLE_CALENDAR_IDS')
		const token = await ensureValidGoogleToken({ env, token: connection })
		if (token.expiresAt !== connection.expiresAt || token.accessToken !== connection.accessToken) {
			await saveConnection({ db, provider, token, base64Key })
		}
		if (status === 'canceled' || status === 'cancelled') {
			if (oldProviderEventId) {
				await googleDeleteEvent({ accessToken: token.accessToken, calendarId, eventId: oldProviderEventId })
			}
			return null
		}
		const created = await googleCreateEvent({
			accessToken: token.accessToken,
			calendarId,
			event: {
				summary: event.title,
				description: event.description,
				start: { dateTime: event.startsAt, timeZone: 'UTC' },
				end: { dateTime: event.endsAt, timeZone: 'UTC' },
				...(event.location ? { location: event.location } : {})
			}
		})
		if (oldProviderEventId) {
			await googleDeleteEvent({ accessToken: token.accessToken, calendarId, eventId: oldProviderEventId })
		}
		return created
	}

	if (provider === 'outlook') {
		const token = await ensureValidOutlookToken({ env, token: connection })
		if (token.expiresAt !== connection.expiresAt || token.accessToken !== connection.accessToken) {
			await saveConnection({ db, provider, token, base64Key })
		}
		if (status === 'canceled' || status === 'cancelled') {
			if (oldProviderEventId) {
				await outlookDeleteEvent({ accessToken: token.accessToken, eventId: oldProviderEventId })
			}
			return null
		}
		const created = await outlookCreateEvent({
			accessToken: token.accessToken,
			env,
			event: {
				subject: event.title,
				body: { contentType: 'text', content: event.description },
				start: { dateTime: event.startsAt, timeZone: 'UTC' },
				end: { dateTime: event.endsAt, timeZone: 'UTC' },
				...(event.location ? { location: { displayName: event.location } } : {})
			}
		})
		if (oldProviderEventId) {
			await outlookDeleteEvent({ accessToken: token.accessToken, eventId: oldProviderEventId })
		}
		return created
	}

	const connectionPayload: AppleCalDavConnection = {
		username: connection.accessToken,
		appPassword: connection.refreshToken,
		calendarUrl: connection.scope || ''
	}
	if (!connectionPayload.calendarUrl) throw new Error('Apple CalDAV calendar URL is missing')
	if (status === 'canceled' || status === 'cancelled') {
		if (oldProviderEventId) {
			await appleDeleteEvent({ connection: connectionPayload, eventId: oldProviderEventId })
		}
		return null
	}
	const created = await appleCreateEvent({
		connection: connectionPayload,
		event: {
			uid: `miko-calendar-${eventId}`,
			summary: event.title,
			description: event.description,
			startsAt: event.startsAt,
			endsAt: event.endsAt,
			location: event.location
		}
	})
	if (oldProviderEventId) {
		await appleDeleteEvent({ connection: connectionPayload, eventId: oldProviderEventId })
	}
	return created
}

async function processSingleJob(db: D1DatabaseLike, env: Record<string, unknown>, job: SyncJobRow) {
	const event = await fetchEventForSync(db, job.event_id)
	if (!event) {
		// Event deleted; job can be marked done.
		await markJobDone(db, job.id)
		return
	}

	const workerId = syncWorkerId(job)
	const hasEventLock = await acquireEventSyncLock(db, job.event_id, workerId)
	if (!hasEventLock) {
		// Another worker is already syncing the latest event state.
		await markJobDone(db, job.id)
		return
	}

	try {
		let provider = (await getActiveCalendarSyncProvider(db)) ?? 'google'

		if ((event.status === 'canceled' || event.status === 'cancelled') && isMockSyncMode(env)) {
			await clearCalendarEventSync(db, job.event_id)
			await markJobDone(db, job.id)
			return
		}

		// In mock mode (used by E2E), we exercise the queue plumbing but never touch external providers.
		if (isMockSyncMode(env)) {
			await upsertCalendarEventSync(db, {
				eventId: job.event_id,
				provider,
				providerEventId: `mock_${provider}_${job.event_id}_${job.id}`,
				providerHtmlLink: null,
				lastError: null
			})
			await markJobDone(db, job.id)
			return
		}

		const base64Key = String(getEnv(env, 'TOKEN_ENC_KEY', '') || '')
		if (!base64Key) throw new Error('Missing TOKEN_ENC_KEY')
		const activeProvider = await getActiveCalendarSyncProvider(db)
		if (!activeProvider) {
			const legacyGoogleConnection = await getConnection({ db, provider: 'google', base64Key })
			if (!legacyGoogleConnection) throw new Error('Calendar sync provider not connected')
			provider = 'google'
		}
		const oldProviderEventId = await getPreviousProviderEventId(db, provider, job.event_id)

		const summary = await fetchSeatSummary(db, job.event_id)
		const seatsTaken = summary?.seats_taken ?? 0
		const waitlist = summary?.waitlist_count ?? 0
		const descriptionLines = [
			`Program event sync`,
			`Seats: ${seatsTaken}/${event.capacity}`,
			waitlist > 0 ? `Waitlist: ${waitlist}` : '',
			event.note ? `Note: ${event.note}` : ''
		].filter(Boolean)
		const syncEvent = {
			title: `${event.title} (${seatsTaken}/${event.capacity})`,
			description: descriptionLines.join('\n'),
			startsAt: event.starts_at,
			endsAt: event.ends_at,
			location: event.location
		}

		const created = await syncProviderEvent({
			db,
			env,
			base64Key,
			provider,
			oldProviderEventId,
			eventId: job.event_id,
			status: event.status,
			event: syncEvent
		})
		if (!created) {
			await clearCalendarEventSync(db, job.event_id)
			await markJobDone(db, job.id)
			return
		}

		await upsertCalendarEventSync(db, {
			eventId: job.event_id,
			provider,
			providerEventId: created.id,
			providerHtmlLink: created.htmlLink ?? null,
			lastError: null
		})
		await markJobDone(db, job.id)
	} finally {
		await releaseEventSyncLock(db, job.event_id, workerId)
	}
}

export async function retryCalendarSyncDeadLetters(db: D1DatabaseLike, limit = 10) {
	const normalizedLimit = Math.max(1, Math.min(50, Math.trunc(limit || 10)))
	const result = await db
		.prepare(
			`SELECT id, job_id, event_id, trigger, requested_by_user_id, payload_json
		 FROM calendar_sync_dead_letters
		 ORDER BY id ASC
		 LIMIT ?`
		)
		.bind(normalizedLimit)
		.all<{
			id: number
			job_id: number
			event_id: number
			trigger: string
			requested_by_user_id: string | null
			payload_json: string | null
		}>()
	const rows = result?.results ?? []
	let requeued = 0
	for (const row of rows) {
		await db
			.prepare(
				`INSERT INTO calendar_sync_jobs (
				event_id, trigger, requested_by_user_id, payload_json, status, attempt_count, next_attempt_at, created_at, updated_at
			) VALUES (?, ?, ?, ?, 'pending', 0, unixepoch(), unixepoch(), unixepoch())`
			)
			.bind(row.event_id, row.trigger, row.requested_by_user_id ?? null, row.payload_json ?? null)
			.run()
		await db.prepare(`DELETE FROM calendar_sync_dead_letters WHERE id = ?`).bind(row.id).run()
		requeued += 1
	}
	return { claimed: rows.length, requeued }
}

export async function purgeCalendarSyncDeadLetters(db: D1DatabaseLike, limit = 50) {
	const normalizedLimit = Math.max(1, Math.min(500, Math.trunc(limit || 50)))
	const ids = await db
		.prepare(`SELECT id FROM calendar_sync_dead_letters ORDER BY id ASC LIMIT ?`)
		.bind(normalizedLimit)
		.all<{ id: number }>()
	const rows = ids?.results ?? []
	let deleted = 0
	for (const row of rows) {
		await db.prepare(`DELETE FROM calendar_sync_dead_letters WHERE id = ?`).bind(row.id).run()
		deleted += 1
	}
	return { deleted }
}

export async function processCalendarSyncQueue(db: D1DatabaseLike, env: Record<string, unknown>, limit = 10) {
	const jobs = await claimDueJobs(db, limit)
	let processed = 0
	let failed = 0
	let deadLettered = 0

	for (const job of jobs) {
		try {
			await processSingleJob(db, env, job)
			processed += 1
		} catch (error) {
			const nextAttempt = (job.attempt_count ?? 0) + 1
			const message = error instanceof Error ? error.message : 'Unknown sync error'
			if (nextAttempt >= MAX_SYNC_ATTEMPTS) {
				await moveJobToDeadLetter(db, job, nextAttempt, message)
				deadLettered += 1
				continue
			}
			await markJobRetry(db, job.id, nextAttempt, message)
			failed += 1
		}
	}

	return { claimed: jobs.length, processed, failed, deadLettered }
}
