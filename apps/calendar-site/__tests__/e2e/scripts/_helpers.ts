import { chromium, type BrowserContext, type Page } from 'playwright'
import { execFileSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { existsSync } from 'node:fs'
import Database from 'better-sqlite3'

export const BASE_URL = process.env['E2E_BASE_URL'] || 'http://localhost:3611'
export const ADMIN_URL = `${BASE_URL}/admin/`
const ENV_FILE =
	process.env['CALENDAR_SITE_ENV_FILE'] ||
	(existsSync('config/env/.env.calendar') ? 'config/env/.env.calendar' : '../../config/env/.env.calendar')
const DEV_DB_FILE = process.env['DEV_DB_FILE'] || '../../.dev/calendar-site.sqlite'

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

function isRetryableRequestError(error: unknown) {
	if (!(error instanceof Error)) return false
	return [
		'ECONNREFUSED',
		'ECONNRESET',
		'socket hang up',
		'fetch failed'
	].some((needle) => error.message.includes(needle))
}

export async function withRequestRetry<T>(
	label: string,
	run: () => Promise<T>,
	options: { attempts?: number; delayMs?: number } = {}
) {
	const attempts = options.attempts ?? 8
	const delayMs = options.delayMs ?? 750
	let lastError: unknown = null

	for (let attempt = 1; attempt <= attempts; attempt += 1) {
		try {
			return await run()
		} catch (error) {
			lastError = error
			if (!isRetryableRequestError(error) || attempt === attempts) {
				throw error
			}
			console.warn(`[e2e] transient request failure for ${label}; retry ${attempt}/${attempts}`)
			await sleep(delayMs)
		}
	}

	throw lastError instanceof Error ? lastError : new Error(`request failed: ${label}`)
}

function normalizeEnvValue(value: string | undefined) {
	const trimmed = value?.trim() ?? ''
	if (!trimmed || trimmed.startsWith('encrypted:') || trimmed.startsWith('☠')) return ''
	return trimmed
}

function getEnvValue(name: string) {
	const processValue = normalizeEnvValue(process.env[name])
	if (processValue) return processValue

	try {
		// Pull the decrypted value from the same env file used by dev/build scripts.
		const decrypted = execFileSync('pnpm', ['exec', 'dotenvx', 'get', name, '-f', ENV_FILE], {
			stdio: ['ignore', 'pipe', 'ignore']
		})
			.toString('utf8')
		return normalizeEnvValue(decrypted)
	} catch {
		return ''
	}
}

export function getAdminPasscode() {
	return getEnvValue('ADMIN_PASSCODE')
}

export function getE2ETestToken() {
	return getEnvValue('E2E_TEST_TOKEN') || getAdminPasscode()
}

export async function bootstrapAdminSession(request: import('playwright').APIRequestContext) {
	const token = getE2ETestToken() || getAdminPasscode()
	if (!token) throw new Error('E2E test token not available')

	const response = await withRequestRetry(
		'bootstrap admin session',
		() =>
			request.post(`${BASE_URL}/api/test/admin-session`, {
				headers: { authorization: `Bearer ${token}` }
			})
	)

	if (!response.ok()) {
		throw new Error(`admin session bootstrap failed: ${response.status()}`)
	}
}

export async function withBrowserContext<T>(run: (context: BrowserContext) => Promise<T>) {
	const browser = await chromium.launch({ headless: true })
	const context = await browser.newContext()

	try {
		return await run(context)
	} finally {
		await context.close()
		await browser.close()
	}
}

export async function withAdminPage<T>(run: (page: Page, context: BrowserContext) => Promise<T>) {
	return withBrowserContext(async (context) => {
		const page = await context.newPage()

		try {
			await bootstrapAdminSession(context.request)
			await page.goto(`${ADMIN_URL}?preview=1`, { waitUntil: 'domcontentloaded', timeout: 30000 })
			return await run(page, context)
		} finally {
			await page.close()
		}
	})
}

export async function bootstrapCalendarSession(
	request: import('playwright').APIRequestContext,
	input: { email?: string; name?: string } = {}
) {
	const token = getE2ETestToken() || getAdminPasscode()
	if (!token) throw new Error('E2E test token not available')

	const response = await withRequestRetry(
		'bootstrap calendar session',
		() =>
			request.post(`${BASE_URL}/api/test/calendar-session`, {
				headers: { authorization: `Bearer ${token}` },
				data: {
					email: input.email || `e2e-calendar-${Date.now()}@example.com`,
					name: input.name || 'E2E Calendar User'
				}
			})
	)

	if (!response.ok()) {
		throw new Error(`calendar session bootstrap failed: ${response.status()}`)
	}
}

export async function ensureDevCalendarSession(
	context: BrowserContext,
	input: { email: string; name: string; admin?: boolean }
) {
	const db = new Database(DEV_DB_FILE)
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

	await context.addCookies([
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
