import type { Page } from 'playwright'
import { BASE_URL, ensureDevCalendarSession, sleep, withBrowserContext, withRequestRetry } from './_helpers'

async function gotoWithRetry(page: Page, url: string) {
	let lastError: unknown = null
	for (let attempt = 1; attempt <= 3; attempt += 1) {
		try {
			await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 })
			return
		} catch (error) {
			lastError = error
			if (!(error instanceof Error) || !error.message.includes('ERR_ABORTED') || attempt === 3) {
				throw error
			}
			await sleep(750)
		}
	}
	throw lastError instanceof Error ? lastError : new Error(`navigation failed: ${url}`)
}

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
		let title = `E2E Organizer Event ${Date.now()}`

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
		const created = await createResponse.json() as { ids?: number[]; tenant?: { slug?: string } }
		const eventId = created.ids?.[0]
		const tenantSlug = created.tenant?.slug
		if (!eventId || !tenantSlug) throw new Error('organizer event create response missing event detail path')
		const eventUrl = `${BASE_URL}/t/${tenantSlug}/events/${eventId}`

		const page = await context.newPage()
		try {
			await gotoWithRetry(page, `${BASE_URL}/organizer`)
			await page.getByRole('heading', { name: /E2E Organizer.*events/ }).waitFor({ timeout: 30_000 })
			await page.getByRole('heading', { name: title }).waitFor({ timeout: 30_000 })
			await page.getByRole('link', { name: 'Create event' }).waitFor({ timeout: 30_000 })
			await page.getByRole('link', { name: 'Public page' }).first().waitFor({ timeout: 30_000 })
			await page.getByRole('link', { name: 'Manage' }).first().waitFor({ timeout: 30_000 })

			await gotoWithRetry(page, `${BASE_URL}/organizer/events/${eventId}`)
			await page.getByRole('heading', { name: title }).waitFor({ timeout: 30_000 })
			const managedTitle = `${title} Updated`
			await page.getByLabel('Title').fill(managedTitle)
			await page.getByLabel('Capacity').fill('9')
			await page.getByRole('button', { name: 'Save event' }).click()
			await page.getByText('Saved.').waitFor({ timeout: 30_000 })
			await page.getByRole('heading', { name: managedTitle }).waitFor({ timeout: 30_000 })
			title = managedTitle

			await gotoWithRetry(page, `${BASE_URL}/organizer/settings`)
			await page.getByRole('heading', { name: /E2E Organizer.*events/ }).waitFor({ timeout: 30_000 })
			const collaboratorEmail = `collab-${Date.now()}@example.com`
			await page.getByLabel('Email').fill(collaboratorEmail)
			await page.getByLabel('Role').selectOption('admin')
			await page.getByRole('button', { name: 'Invite' }).click()
			await page.getByText('Invite saved.').waitFor({ timeout: 30_000 })
			const pendingInvite = page.locator('.organizer-settings__person--pending').filter({
				hasText: collaboratorEmail
			})
			const inviteText = await pendingInvite.textContent({ timeout: 30_000 })
			const tenantInviteCode = inviteText?.match(/[a-f0-9]{24}/)?.[0]
			if (!tenantInviteCode) throw new Error('tenant collaborator invite code not found')

			await context.clearCookies()
			await gotoWithRetry(page, `${BASE_URL}/login?invite=${tenantInviteCode}&redirect=${encodeURIComponent('/organizer')}`)
			await page.getByRole('heading', { name: /Join E2E Organizer.*events/ }).waitFor({ timeout: 30_000 })
			await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => null)
			await sleep(500)
			await page.getByLabel('Your name').fill('E2E Collaborator')
			await page.getByLabel(/Email for reminders/).fill(collaboratorEmail)
			const [claimResponse] = await Promise.all([
				page.waitForResponse((response) => response.url().endsWith('/api/calendar/invite-claim'), {
					timeout: 30_000
				}),
				page.getByRole('button', { name: 'Join with Invite' }).click()
			])
			if (!claimResponse.ok()) {
				throw new Error(`tenant collaborator invite claim failed: ${claimResponse.status()}`)
			}
			await page.getByRole('heading', { name: /E2E Organizer.*events/ }).waitFor({ timeout: 30_000 })
			await page.getByRole('heading', { name: title }).waitFor({ timeout: 30_000 })

			await gotoWithRetry(page, eventUrl)
			await page.getByRole('heading', { name: title }).waitFor({ timeout: 30_000 })
			await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => null)
			await sleep(500)
			await page.getByRole('button', { name: 'Join event' }).click()
			await page.getByText('You are on the attendee list.').waitFor({ timeout: 30_000 })

			await context.clearCookies()
			await gotoWithRetry(page, eventUrl)
			await page.getByRole('link', { name: 'Sign in to join' }).waitFor({ timeout: 30_000 })
		} finally {
			await page.close()
		}
	})
}
