import { test } from 'vitest'
import { runAdminEventTemplatesSmoke } from './scripts/admin-redesign-smoke'

test('admin event templates smoke', async () => {
	await runAdminEventTemplatesSmoke()
}, 120_000)
