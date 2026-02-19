import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import type { D1DatabaseLike } from '@calendar/kit'
import { requireAdminRequest, forbidden, logAdminEvent, runApiRequest } from '@calendar/app/admin-api-helpers'
import { apiOk } from '@calendar/kit'

type CleanupResult = {
	events: { before: number; after: number }
	users: { before: number; after: number }
}

async function countLike(db: D1DatabaseLike, sql: string) {
	const row = await db.prepare(sql).first<{ count: number }>()
	return Number(row?.count ?? 0)
}

export async function POST(event: RequestEvent) {
	return runApiRequest('admin.dev.cleanup-e2e', async () => {
		const guard = requireAdminRequest(event, { csrf: true })
		if (guard) return guard
		// Never allow destructive cleanup outside local dev.
		if (process.env['NODE_ENV'] !== 'development') {
			return forbidden()
		}

		const env = await buildEnv(event.platform)
		const db = env.DB

		const beforeEvents = await countLike(
			db,
			`SELECT COUNT(*) AS count FROM calendar_events WHERE title LIKE 'E2E %'`
		)
		const beforeUsers = await countLike(
			db,
			`SELECT COUNT(*) AS count
			 FROM calendar_users
			 WHERE lower(email) LIKE 'e2e-calendar-%@example.com'
			    OR name LIKE 'E2E Calendar User%'`
		)

		// Events first (and sync metadata that may keep resurfacing)
		await db.prepare(
			`DELETE FROM calendar_sync_dead_letters
			 WHERE event_id IN (SELECT id FROM calendar_events WHERE title LIKE 'E2E %')`
		).run()
		await db.prepare(
			`DELETE FROM calendar_sync_jobs
			 WHERE event_id IN (SELECT id FROM calendar_events WHERE title LIKE 'E2E %')`
		).run()
		await db.prepare(
			`DELETE FROM calendar_event_sync
			 WHERE event_id IN (SELECT id FROM calendar_events WHERE title LIKE 'E2E %')`
		).run()
		await db.prepare(
			`DELETE FROM calendar_event_participants
			 WHERE event_id IN (SELECT id FROM calendar_events WHERE title LIKE 'E2E %')`
		).run()
		await db.prepare(`DELETE FROM calendar_events WHERE title LIKE 'E2E %'`).run()

		// Users and related tables.
		await db.prepare(
			`DELETE FROM calendar_event_participants
			 WHERE user_id IN (
				SELECT CAST(id AS TEXT)
				FROM calendar_users
				WHERE lower(email) LIKE 'e2e-calendar-%@example.com'
				   OR name LIKE 'E2E Calendar User%'
			 )`
		).run()
		await db.prepare(
			`DELETE FROM calendar_user_profiles
			 WHERE user_id IN (
				SELECT CAST(id AS TEXT)
				FROM calendar_users
				WHERE lower(email) LIKE 'e2e-calendar-%@example.com'
				   OR name LIKE 'E2E Calendar User%'
			 )`
		).run()
		await db.prepare(
			`DELETE FROM calendar_email_verifications
			 WHERE user_id IN (
				SELECT CAST(id AS TEXT)
				FROM calendar_users
				WHERE lower(email) LIKE 'e2e-calendar-%@example.com'
				   OR name LIKE 'E2E Calendar User%'
			 )`
		).run()
		await db.prepare(
			`DELETE FROM calendar_sessions
			 WHERE user_id IN (
				SELECT id
				FROM calendar_users
				WHERE lower(email) LIKE 'e2e-calendar-%@example.com'
				   OR name LIKE 'E2E Calendar User%'
			 )`
		).run()
		await db.prepare(
			`DELETE FROM calendar_oauth_accounts
			 WHERE user_id IN (
				SELECT id
				FROM calendar_users
				WHERE lower(email) LIKE 'e2e-calendar-%@example.com'
				   OR name LIKE 'E2E Calendar User%'
			 )`
		).run()
		await db.prepare(
			`DELETE FROM calendar_invite_redemptions
			 WHERE user_id IN (
				SELECT id
				FROM calendar_users
				WHERE lower(email) LIKE 'e2e-calendar-%@example.com'
				   OR name LIKE 'E2E Calendar User%'
			 )`
		).run()
		await db.prepare(
			`DELETE FROM calendar_users
			 WHERE lower(email) LIKE 'e2e-calendar-%@example.com'
			    OR name LIKE 'E2E Calendar User%'`
		).run()

		const afterEvents = await countLike(
			db,
			`SELECT COUNT(*) AS count FROM calendar_events WHERE title LIKE 'E2E %'`
		)
		const afterUsers = await countLike(
			db,
			`SELECT COUNT(*) AS count
			 FROM calendar_users
			 WHERE lower(email) LIKE 'e2e-calendar-%@example.com'
			    OR name LIKE 'E2E Calendar User%'`
		)

		logAdminEvent(event, 'dev_cleanup_e2e', { removedEvents: beforeEvents - afterEvents, removedUsers: beforeUsers - afterUsers })
		const result: CleanupResult = {
			events: { before: beforeEvents, after: afterEvents },
			users: { before: beforeUsers, after: afterUsers }
		}
		return apiOk(result)
	})
}
