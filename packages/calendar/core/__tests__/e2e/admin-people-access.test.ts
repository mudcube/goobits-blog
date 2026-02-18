import { test } from 'vitest'
import { runAdminPeopleAccessSmoke } from './scripts/admin-redesign-smoke'

test('admin people access smoke', async () => {
	await runAdminPeopleAccessSmoke()
}, 120_000)
