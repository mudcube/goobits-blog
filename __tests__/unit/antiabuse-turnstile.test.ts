import { describe, expect, it } from 'vitest'
import { runContactAntiAbuse } from '../../src/lib/server/antiabuse/index'

function createEnv(overrides: Record<string, string | undefined> = {}) {
	return {
		ANTIABUSE_ENABLED: 'true',
		TURNSTILE_REQUIRED: 'true',
		NODE_ENV: 'production',
		...overrides
	}
}

describe('anti-abuse turnstile configuration', () => {
	it('fails closed for contact when the turnstile secret is missing by default', async () => {
		const result = await runContactAntiAbuse({
			email: 'person@example.com',
			ip: '127.0.0.2',
			asn: 'AS64501',
			deviceId: 'device-contact-default',
			honeypot: '',
			// Past the CONTACT_MIN_SUBMIT_MS default (1500ms) so the timing
			// check passes and we actually exercise the Turnstile branch.
			startedAtMs: Date.now() - 3000,
			turnstileToken: '',
			env: createEnv()
		})

		expect(result).toMatchObject({
			ok: false,
			reason: 'challenge_required',
			requiresChallenge: true
		})
	})

	it('still allows explicit dev fail-open when configured', async () => {
		const result = await runContactAntiAbuse({
			email: 'person@example.com',
			ip: '127.0.0.3',
			asn: 'AS64502',
			deviceId: 'device-contact-fail-open',
			honeypot: '',
			startedAtMs: Date.now() - 5000,
			turnstileToken: '',
			env: createEnv({ NODE_ENV: 'development', TURNSTILE_FAIL_OPEN: 'true' })
		})

		expect(result).toMatchObject({
			ok: true,
			reason: 'allow',
			requiresChallenge: false
		})
	})
})
