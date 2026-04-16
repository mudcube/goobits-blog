import { test } from 'vitest'
import { runBuiltRouteScan } from './scripts/build-route-scan'

test('built site route scan is clean', async () => {
	await runBuiltRouteScan()
}, 300_000)
