import { chromium } from 'playwright'
import { BASE_URL, bootstrapAdminSession, getAdminPasscode, getE2ETestToken, withRequestRetry } from './_helpers'
import { requireFeedEvent, requireFeedEventById } from './_ui-waits'

const ADMIN_URL = `${BASE_URL}/admin/`
const MEMBER_SAME_ORIGIN_HEADERS = {
	origin: BASE_URL,
	referer: `${BASE_URL}/`
}

async function createAdminEvent(
	request: import('playwright').APIRequestContext,
	baseUrl: string,
	input: {
		activitySlug: string
		title: string
		startsAt: string
		endsAt: string
		capacity: number
	}
): Promise<number> {
	const response = await withRequestRetry(
		`create admin event ${input.title}`,
		() =>
			request.post(`${baseUrl}/api/admin/events`, {
				headers: { origin: baseUrl },
				data: {
					...input,
					repeatWeeks: 0,
					costCents: 0,
					currency: 'USD',
					paymentProvider: null,
					paymentHandle: null,
					paymentNoteTemplate: null,
					location: null,
					note: null
				}
			})
	)
	if (!response.ok()) {
		throw new Error(`admin event create failed (${input.title}): ${response.status()}`)
	}
	const json = await response.json() as { ids?: number[] }
	const id = json.ids?.[0]
	if (typeof id !== 'number' || !Number.isFinite(id)) {
		throw new Error(`admin event create did not return an id (${input.title}): ${JSON.stringify(json)}`)
	}
	return id
}

async function createMemberCalendarSession(
	request: import('playwright').APIRequestContext,
	token: string,
	emailPrefix: string,
	name: string
) {
	const response = await withRequestRetry(
		`create member calendar session ${name}`,
		() =>
			request.post(`${BASE_URL}/api/test/calendar-session`, {
				headers: { authorization: `Bearer ${token}` },
				data: { email: `${emailPrefix}-${Date.now()}@example.com`, name }
			})
	)
	if (!response.ok()) {
		throw new Error(`calendar member bootstrap failed (${name}): ${response.status()}`)
	}
}

async function assertJoinLeaveFlow(
	page: import('playwright').Page,
	request: import('playwright').APIRequestContext,
	title: string
) {
	const mainEvent = await requireFeedEvent(request, title)
	const mainEventId = Number(mainEvent['id'])
	if (!Number.isFinite(mainEventId)) throw new Error(`main event missing numeric id: ${JSON.stringify(mainEvent)}`)
	const calendarRes = await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 })
	if (!calendarRes || !calendarRes.ok()) {
		throw new Error(`calendar home failed to load: status=${calendarRes?.status() ?? 'no_response'}`)
	}
	if (page.url().includes('/login')) throw new Error('calendar member session bootstrap did not stick')

	const joinApi = await withRequestRetry(
		`join main event ${mainEventId}`,
		() => request.post(`${BASE_URL}/api/calendar/events/${mainEventId}/join`, {
			headers: MEMBER_SAME_ORIGIN_HEADERS,
			data: { guestCount: 1 }
		})
	)
	if (!joinApi.ok()) throw new Error(`join API failed: ${joinApi.status()}`)
	await requireFeedEventById(
		request,
		mainEventId,
		(event) =>
			Number(event['seatsTaken'] ?? 0) === 2 &&
			event['userStatus'] === 'joined' &&
			Number(event['userGuestCount'] ?? 0) === 1
	)

	const leaveApi = await withRequestRetry(
		`leave main event ${mainEventId}`,
		() => request.post(`${BASE_URL}/api/calendar/events/${mainEventId}/leave`, {
			headers: MEMBER_SAME_ORIGIN_HEADERS
		})
	)
	if (!leaveApi.ok()) throw new Error(`leave API failed: ${leaveApi.status()}`)
	await requireFeedEventById(
		request,
		mainEventId,
		(event) =>
			Number(event['seatsTaken'] ?? 0) === 0 &&
			Number(event['waitlistCount'] ?? 0) === 0 &&
			event['userStatus'] == null
	)
}

async function assertWaitlistFlow(
	request: import('playwright').APIRequestContext,
	eventId: number
) {
	await requireFeedEventById(request, eventId)
	const waitlistJoinRes = await withRequestRetry(
		`join waitlist event ${eventId}`,
		() => request.post(`${BASE_URL}/api/calendar/events/${eventId}/join`, {
			headers: MEMBER_SAME_ORIGIN_HEADERS,
			data: { guestCount: 1 }
		})
	)
	if (!waitlistJoinRes.ok()) throw new Error(`waitlist join failed: ${waitlistJoinRes.status()}`)

	await requireFeedEventById(
		request,
		eventId,
		(event) =>
			Number(event['seatsTaken'] ?? 0) === 0 &&
			Number(event['waitlistCount'] ?? 0) === 1 &&
			event['userStatus'] === 'waitlist'
	)

	const waitlistLeaveRes = await withRequestRetry(
		`leave waitlist event ${eventId}`,
		() => request.post(`${BASE_URL}/api/calendar/events/${eventId}/leave`, {
			headers: MEMBER_SAME_ORIGIN_HEADERS
		})
	)
	if (!waitlistLeaveRes.ok()) throw new Error(`waitlist leave failed: ${waitlistLeaveRes.status()}`)

	const waitlistAfterLeave = await requireFeedEventById(
		request,
		eventId,
		(event) => Number(event['seatsTaken'] ?? 0) === 0 && Number(event['waitlistCount'] ?? 0) === 0
	)
	if (
		Number(waitlistAfterLeave['seatsTaken'] ?? 0) !== 0 ||
		Number(waitlistAfterLeave['waitlistCount'] ?? 0) !== 0
	) {
		throw new Error('waitlist leave counters did not reset as expected')
	}
}

async function assertContentionFlow(
	requestA: import('playwright').APIRequestContext,
	requestB: import('playwright').APIRequestContext,
	eventId: number
) {
	const [joinARes, joinBRes] = await Promise.all([
		withRequestRetry(
			`contention join A ${eventId}`,
			() => requestA.post(`${BASE_URL}/api/calendar/events/${eventId}/join`, {
				headers: MEMBER_SAME_ORIGIN_HEADERS,
				data: { guestCount: 0 }
			})
		),
		withRequestRetry(
			`contention join B ${eventId}`,
			() => requestB.post(`${BASE_URL}/api/calendar/events/${eventId}/join`, {
				headers: MEMBER_SAME_ORIGIN_HEADERS,
				data: { guestCount: 0 }
			})
		)
	])
	if (!joinARes.ok()) throw new Error(`contention join A failed: ${joinARes.status()}`)
	if (!joinBRes.ok()) throw new Error(`contention join B failed: ${joinBRes.status()}`)
	const joinA = await joinARes.json() as { status?: string }
	const joinB = await joinBRes.json() as { status?: string }
	const statuses = [joinA.status, joinB.status].sort().join(',')
	if (statuses !== 'joined,waitlist') {
		throw new Error(`unexpected contention statuses: ${statuses}`)
	}

	const verifyEvent = await requireFeedEventById(
		requestA,
		eventId,
		(event) =>
			Number(event['seatsTaken'] ?? 0) === 1 &&
			Number(event['capacity'] ?? 0) === 1 &&
			Number(event['waitlistCount'] ?? 0) === 1
	)
	if (
		Number(verifyEvent['seatsTaken'] ?? 0) !== 1 ||
		Number(verifyEvent['capacity'] ?? 0) !== 1 ||
		Number(verifyEvent['waitlistCount'] ?? 0) !== 1
	) {
		throw new Error(
			`unexpected contention counters: seats=${verifyEvent['seatsTaken']}/${verifyEvent['capacity']}, waitlist=${verifyEvent['waitlistCount']}`
		)
	}
}

export async function runCalendarEventsFlow() {
	const e2eToken = getE2ETestToken() || getAdminPasscode()
	if (!e2eToken) throw new Error('E2E test token not available')

	const browser = await chromium.launch({ headless: true })
	const context = await browser.newContext()
	const contextB = await browser.newContext()
	const page = await context.newPage()

	try {
		await bootstrapAdminSession(context.request)
		await page.goto(`${ADMIN_URL}?preview=1`, { waitUntil: 'domcontentloaded', timeout: 30000 })

		const cookies = await context.cookies(ADMIN_URL)
		const hasSessionCookie = cookies.some((cookie) => cookie.name === 'calendar_session')
		if (!hasSessionCookie) throw new Error('calendar session cookie missing after admin login')

		// Clean prior E2E spam using the real admin session (dev-only endpoint).
		await withRequestRetry(
			'cleanup existing e2e fixtures',
			() => context.request.post(`${BASE_URL}/api/admin/dev/cleanup-e2e`, { headers: { origin: BASE_URL } }),
			{ attempts: 4, delayMs: 500 }
		).catch(() => null)

		await page.goto(`${BASE_URL}/admin/?preview=1`, { waitUntil: 'domcontentloaded', timeout: 30000 })
		await page.getByTestId('admin-dashboard-main').waitFor({ timeout: 30000 })

		const title = `E2E Calendar Event ${Date.now()}`
		const waitlistTitle = `E2E Waitlist Event ${Date.now()}`
		const contentionTitle = `E2E Contention Event ${Date.now()}`
		const startDate = new Date(Date.now() + 90 * 60 * 1000)
		startDate.setMinutes(0, 0, 0)
		startDate.setHours(Math.max(startDate.getHours(), 8))
		const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)
		const draftActivitySlug = await page.inputValue('#event-draft-activity').catch(() => '')
		const activitySlug = draftActivitySlug || 'gym'

		await createAdminEvent(context.request, BASE_URL, {
			activitySlug,
			title,
			startsAt: startDate.toISOString(),
			endsAt: endDate.toISOString(),
			capacity: 4
		})
		const waitlistEventId = await createAdminEvent(context.request, BASE_URL, {
			activitySlug,
			title: waitlistTitle,
			startsAt: new Date(startDate.getTime() + 2 * 60 * 60 * 1000).toISOString(),
			endsAt: new Date(endDate.getTime() + 2 * 60 * 60 * 1000).toISOString(),
			capacity: 1
		})

		const contentionStart = new Date(startDate.getTime() + 4 * 60 * 60 * 1000)
		const contentionEnd = new Date(endDate.getTime() + 4 * 60 * 60 * 1000)
		const contentionEventId = await createAdminEvent(context.request, BASE_URL, {
			activitySlug,
			title: contentionTitle,
			startsAt: contentionStart.toISOString(),
			endsAt: contentionEnd.toISOString(),
			capacity: 1
		})

		await createMemberCalendarSession(context.request, e2eToken, 'e2e-calendar', 'E2E Calendar User')
		await createMemberCalendarSession(contextB.request, e2eToken, 'e2e-calendar-b', 'E2E Calendar User B')

		await assertJoinLeaveFlow(page, context.request, title)
		await assertWaitlistFlow(context.request, waitlistEventId)
		await assertContentionFlow(context.request, contextB.request, contentionEventId)

		console.log('[calendar-events-flow] PASS')
	} finally {
		await withRequestRetry(
			'cleanup final e2e fixtures',
			() => context.request.post(`${BASE_URL}/api/admin/dev/cleanup-e2e`, { headers: { origin: BASE_URL } }),
			{ attempts: 4, delayMs: 500 }
		).catch(() => null)
		await context.close()
		await contextB.close()
		await browser.close()
	}
}
