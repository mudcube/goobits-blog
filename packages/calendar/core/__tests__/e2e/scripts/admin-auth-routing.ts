import { chromium } from 'playwright'
import { randomBytes } from 'node:crypto'
import Database from 'better-sqlite3'
import {
	ADMIN_URL,
	BASE_URL,
	withBrowserContext
} from './_helpers'

async function expectStatus(label: string, response: { status: () => number }, expected: number) {
	const status = response.status()
	if (status !== expected) {
		throw new Error(`${label}: expected ${expected}, got ${status}`)
	}
}

function ensureDevCalendarSession(
	context: import('playwright').BrowserContext,
	input: { email: string; name: string; admin?: boolean }
) {
	const db = new Database('.dev/db.sqlite')
	const existing = db
		.prepare('SELECT id FROM calendar_users WHERE lower(email) = lower(?) LIMIT 1')
		.get(input.email) as { id: number } | undefined
	let userId = existing?.id
	if (!userId) {
		const result = db
			.prepare(
				`INSERT INTO calendar_users (email, name, email_verified, created_at, last_login_at)
				 VALUES (?, ?, 1, unixepoch(), unixepoch())`
			)
			.run(input.email, input.name)
		userId = Number(result.lastInsertRowid)
	}

	if (input.admin) {
		db.prepare('INSERT OR IGNORE INTO calendar_admins (user_id) VALUES (?)').run(userId)
	} else {
		db.prepare('DELETE FROM calendar_admins WHERE user_id = ?').run(userId)
	}

	const sessionId = randomBytes(20).toString('base64url')
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
	db.prepare('INSERT INTO calendar_sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(
		sessionId,
		userId,
		expiresAt.toISOString()
	)

	return context.addCookies([
		{
			name: 'calendar_session',
			value: sessionId,
			url: BASE_URL,
			httpOnly: true,
			secure: BASE_URL.startsWith('https:'),
			sameSite: 'Lax',
			expires: Math.floor(expiresAt.getTime() / 1000)
		}
	])
}

export async function runAdminAuthRouting() {
	await withBrowserContext(async (context) => {
		const response = await context.request.get(`${BASE_URL}/api/admin/users`)
		await expectStatus('no session admin api', response, 401)
	})

	await withBrowserContext(async (context) => {
		await ensureDevCalendarSession(context, {
			email: `non-admin-${Date.now()}@example.com`,
			name: 'Non Admin',
			admin: false
		})
		const response = await context.request.get(`${BASE_URL}/api/admin/users`)
		await expectStatus('non-admin admin api', response, 403)
	})

	const browser = await chromium.launch({ headless: true })
	const context = await browser.newContext()
	const page = await context.newPage()
	try {
		await ensureDevCalendarSession(context, {
			email: 'hello@miko.art',
			name: 'Miko Admin',
			admin: true
		})

		const apiResponse = await context.request.get(`${BASE_URL}/api/admin/users`)
		await expectStatus('admin api', apiResponse, 200)

		await page.goto(`${ADMIN_URL}?preview=1`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
		await page.getByTestId('admin-dashboard-main').waitFor({ timeout: 30_000 })
	} finally {
		await page.close()
		await context.close()
		await browser.close()
	}
}
