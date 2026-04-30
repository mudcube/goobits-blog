import { test } from 'vitest'
import {
	runAdminPaymentDefaultsEventFlowSmoke,
	runAdminPaymentDefaultsSmoke
} from './scripts/admin-payment-defaults-smoke'

test('admin payment defaults smoke', async () => {
	await runAdminPaymentDefaultsSmoke()
}, 120_000)

test('admin payment defaults apply to created paid events', async () => {
	await runAdminPaymentDefaultsEventFlowSmoke()
}, 120_000)
