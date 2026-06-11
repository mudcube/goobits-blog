import { BASE_URL, ensureDevCalendarSession, withBrowserContext, withRequestRetry } from './_helpers'

export async function runOrganizerDashboardSmoke() {
	await withBrowserContext(async (context) => {
		const email = `e2e-calendar-organizer-${Date.now()}@example.com`
		await ensureDevCalendarSession(context, {
			email,
			name: 'E2E Organizer'
		})

		const startsAt = new Date(Date.now() + 2 * 60 * 60 * 1000)
		startsAt.setMinutes(0, 0, 0)
		const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000)
		const title = `E2E Organizer Event ${Date.now()}`

		const createResponse = await withRequestRetry(
			'create organizer event',
			() =>
				context.request.post(`${BASE_URL}/api/calendar/events`, {
					headers: {
						origin: BASE_URL
					},
					data: {
						title,
						activitySlug: 'gym',
						startsAt: startsAt.toISOString(),
						endsAt: endsAt.toISOString(),
						capacity: 8,
						location: 'E2E Studio',
						note: 'Organizer dashboard smoke event.'
					}
				})
		)
		if (!createResponse.ok()) {
			throw new Error(`organizer event create failed: ${createResponse.status()}`)
		}

		const page = await context.newPage()
		try {
			await page.goto(`${BASE_URL}/organizer`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
			await page.getByRole('heading', { name: /E2E Organizer.*events/ }).waitFor({ timeout: 30_000 })
			await page.getByRole('heading', { name: title }).waitFor({ timeout: 30_000 })
			await page.getByRole('link', { name: 'Create event' }).waitFor({ timeout: 30_000 })
			await page.getByRole('link', { name: 'Public page' }).first().waitFor({ timeout: 30_000 })
		} finally {
			await page.close()
		}
	})
}
