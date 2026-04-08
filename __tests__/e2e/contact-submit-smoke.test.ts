import { test } from 'vitest'
import { runContactSubmitSmoke } from './scripts/contact-submit-smoke'

test('contact submit smoke', async () => {
	await runContactSubmitSmoke()
}, 120_000)
