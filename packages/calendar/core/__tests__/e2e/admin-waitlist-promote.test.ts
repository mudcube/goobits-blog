import { test } from 'vitest'
import { runAdminWaitlistPromoteSmoke } from './scripts/admin-redesign-smoke'

test('admin waitlist promote smoke', async () => {
	await runAdminWaitlistPromoteSmoke()
}, 120_000)
