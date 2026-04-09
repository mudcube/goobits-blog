import type { APIRequestContext, Page } from 'playwright'
import { BASE_URL } from './_helpers'

export async function waitForMonthLabel(page: Page, timeout = 5_000) {
	const monthTitle = page.locator('.member-calendar__month-banner-title')
	await monthTitle.waitFor({ timeout })
	await page.waitForFunction(
		() => (document.querySelector('.member-calendar__month-banner-title')?.textContent || '').trim().length > 0,
		undefined,
		{ timeout }
	)
	return ((await monthTitle.textContent()) || '').trim()
}

export async function waitForMonthChange(page: Page, previousLabel: string, timeout = 5_000) {
	await page.waitForFunction(
		(previous) => {
			const current = (document.querySelector('.member-calendar__month-banner-title')?.textContent || '').trim()
			return current.length > 0 && current !== previous
		},
		previousLabel,
		{ timeout }
	)
	return waitForMonthLabel(page, timeout)
}

export async function waitForAvailableDays(page: Page, timeout = 5_000) {
	await page.locator('.member-calendar__viewport').waitFor({ timeout })
	await page.waitForFunction(
		() => document.querySelectorAll('.member-calendar__day--available').length > 0,
		undefined,
		{ timeout }
	)
}

export async function waitForSlotButtons(page: Page, timeout = 10_000) {
	await page.waitForFunction(
		() => document.querySelectorAll('.calendar-page__slot-button').length > 0,
		undefined,
		{ timeout }
	)
}

export async function waitForFeedEvent(
	request: APIRequestContext,
	title: string,
	predicate?: (event: Record<string, unknown>) => boolean,
	attempts = 15,
	delayMs = 300
) {
	for (let attempt = 0; attempt < attempts; attempt += 1) {
		const res = await request.get(`${BASE_URL}/api/calendar/events`)
		if (res.ok()) {
			const json = await res.json() as { upcoming?: Array<Record<string, unknown>> }
			const found = (json.upcoming ?? []).find(
				(event) => event['title'] === title && (!predicate || predicate(event))
			)
			if (found) return found
		}
		await new Promise((resolve) => setTimeout(resolve, delayMs))
	}
	return null
}

export async function requireFeedEvent(
	request: APIRequestContext,
	title: string,
	predicate?: (event: Record<string, unknown>) => boolean
) {
	const found = await waitForFeedEvent(request, title, predicate)
	if (found) return found

	const res = await request.get(`${BASE_URL}/api/calendar/events`)
	const status = res.status()
	const body = await res.text().catch(() => '')
	throw new Error(`calendar feed event not found (${title}); status=${status}; body=${body.slice(0, 500)}`)
}

export async function waitForAttendanceCount(page: Page, eventId: number | string, expectedText: string, timeout = 30_000) {
	await page
		.locator(`[data-testid="member-event-card"][data-event-id="${eventId}"] [data-testid="member-event-attendance"]`, {
			hasText: expectedText
		})
		.waitFor({ timeout })
}
