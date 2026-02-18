import { test } from 'vitest'
import { runAdminPaymentDefaultsSmoke } from './scripts/admin-redesign-smoke'

test('admin payment defaults smoke', async () => {
	await runAdminPaymentDefaultsSmoke()
}, 120_000)
