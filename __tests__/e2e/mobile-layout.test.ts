import { test } from 'vitest'
import { runMobileLayout } from './scripts/mobile-layout'

test('mobile layout invariants', async () => {
	await runMobileLayout()
}, 180_000)
