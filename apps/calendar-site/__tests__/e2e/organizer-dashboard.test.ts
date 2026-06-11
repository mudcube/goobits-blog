import { test } from 'vitest'
import { runOrganizerDashboardSmoke } from './scripts/organizer-dashboard-smoke'

test('organizer dashboard smoke', async () => {
	await runOrganizerDashboardSmoke()
}, 120_000)
