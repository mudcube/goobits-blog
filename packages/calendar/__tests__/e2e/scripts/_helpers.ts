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
