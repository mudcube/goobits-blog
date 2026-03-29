import { execSync } from 'node:child_process'

export const BASE_URL = process.env['E2E_BASE_URL'] || 'http://localhost:3610'

export function getAdminPasscode() {
	if (process.env['ADMIN_PASSCODE']) return process.env['ADMIN_PASSCODE']
	try {
		// Pull the decrypted value from the same env file used by dev/build scripts.
		return execSync('pnpm exec dotenvx get ADMIN_PASSCODE -f config/env/.env', {
			stdio: ['ignore', 'pipe', 'ignore']
		})
			.toString('utf8')
			.trim()
	} catch {
		return ''
	}
}

export function getE2ETestToken() {
	if (process.env['E2E_TEST_TOKEN']) return process.env['E2E_TEST_TOKEN']
	try {
		return execSync('pnpm exec dotenvx get E2E_TEST_TOKEN -f config/env/.env', {
			stdio: ['ignore', 'pipe', 'ignore']
		})
			.toString('utf8')
			.trim()
	} catch {
		return getAdminPasscode()
	}
}

export async function bootstrapAdminSession(request: import('playwright').APIRequestContext) {
	const token = getE2ETestToken() || getAdminPasscode()
	if (!token) throw new Error('E2E test token not available')

	const response = await request.post(`${BASE_URL}/api/test/admin-session`, {
		headers: { authorization: `Bearer ${token}` }
	})

	if (!response.ok()) {
		throw new Error(`admin session bootstrap failed: ${response.status()}`)
	}
}
