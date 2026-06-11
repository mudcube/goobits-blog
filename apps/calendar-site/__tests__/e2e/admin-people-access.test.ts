import { test } from 'vitest'
import { runAdminPeopleAccessSmoke } from './scripts/admin-people-access-smoke'

test('admin people access smoke', async () => {
	await runAdminPeopleAccessSmoke()
}, 120_000)
