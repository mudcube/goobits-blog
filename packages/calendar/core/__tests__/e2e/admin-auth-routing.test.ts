import { test } from 'vitest'
import { runAdminAuthRouting } from './scripts/admin-auth-routing'

test('admin auth routing', async () => {
	await runAdminAuthRouting()
}, 60_000)
