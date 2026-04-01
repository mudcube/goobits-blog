import { chromium, type Page } from 'playwright'
import { BASE_URL } from './_helpers'

async function expectWheelBurstToAdvanceExactlyOneMonth(page: Page) {
	const monthTitle = page.locator('.member-calendar__month-banner-title')
	const readMonthTitle = async () => ((await monthTitle.textContent()) || '').trim()
	const runBurst = async () => {
		await page.locator('.member-calendar__viewport').hover()
		for (const delta of [120, 72, 40, 22, 12, 6, 3]) {
			await page.mouse.wheel(0, delta)
			await page.waitForTimeout(280)
		}
		await page.waitForTimeout(900)
	}
	const before = await readMonthTitle()

	await runBurst()
	let after = await readMonthTitle()
	if (before === after) {
		await runBurst()
		after = await readMonthTitle()
	}

	if (before === after) {
		throw new Error(`wheel burst did not advance the visible month: ${before}`)
	}

	const steppedTwice = await page.evaluate((beforeLabel) => {
		const parseMonth = (label: string) => {
			const parsed = new Date(`${label} 1`)
			return Number.isNaN(parsed.getTime()) ? null : parsed
		}
		const beforeDate = parseMonth(beforeLabel)
		const currentLabel = (document.querySelector('.member-calendar__month-banner-title')?.textContent || '').trim()
		const afterDate = parseMonth(currentLabel)
		if (!beforeDate || !afterDate) return false
		const monthDistance =
			(afterDate.getFullYear() - beforeDate.getFullYear()) * 12 +
			(afterDate.getMonth() - beforeDate.getMonth())
		return Math.abs(monthDistance) !== 1
	}, before)

	if (steppedTwice) {
		throw new Error(`wheel burst advanced more than one month: ${before} -> ${after}`)
	}
}

async function expectSecondWheelGestureToAdvanceOneMoreMonth(page: Page) {
	const monthTitle = page.locator('.member-calendar__month-banner-title')
	const readMonthTitle = async () => ((await monthTitle.textContent()) || '').trim()
	const before = await readMonthTitle()

	await page.waitForTimeout(700)
	await page.locator('.member-calendar__viewport').hover()
	await page.mouse.wheel(0, 120)
	await page.waitForTimeout(700)

	const after = await readMonthTitle()
	if (before === after) {
		throw new Error(`separate wheel gesture did not advance the visible month: ${before}`)
	}

	const steppedTwice = await page.evaluate((beforeLabel) => {
		const parseMonth = (label: string) => {
			const parsed = new Date(`${label} 1`)
			return Number.isNaN(parsed.getTime()) ? null : parsed
		}
		const beforeDate = parseMonth(beforeLabel)
		const currentLabel = (document.querySelector('.member-calendar__month-banner-title')?.textContent || '').trim()
		const afterDate = parseMonth(currentLabel)
		if (!beforeDate || !afterDate) return false
		const monthDistance =
			(afterDate.getFullYear() - beforeDate.getFullYear()) * 12 +
			(afterDate.getMonth() - beforeDate.getMonth())
		return Math.abs(monthDistance) !== 1
	}, before)

	if (steppedTwice) {
		throw new Error(`separate wheel gesture advanced more than one month: ${before} -> ${after}`)
	}
}

async function expectBackwardWheelPagingToRemainMonthAccurate(page: Page) {
	const monthTitle = page.locator('.member-calendar__month-banner-title')
	const parseMonthLabel = (label: string) => {
		const parsed = new Date(`${label} 1`)
		if (Number.isNaN(parsed.getTime())) {
			throw new Error(`could not parse month label: ${label}`)
		}
		return parsed
	}
	const monthDistance = (fromLabel: string, toLabel: string) => {
		const from = parseMonthLabel(fromLabel)
		const to = parseMonthLabel(toLabel)
		return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth())
	}

	const labels: string[] = []
	for (let i = 0; i < 4; i += 1) {
		labels.push(((await monthTitle.textContent()) || '').trim())
		await page.mouse.wheel(0, -120)
		await page.waitForTimeout(900)
	}
	labels.push(((await monthTitle.textContent()) || '').trim())

	for (let i = 1; i < labels.length; i += 1) {
		const previousLabel = labels[i - 1]
		const nextLabel = labels[i]
		if (!previousLabel || !nextLabel) {
			throw new Error('backward wheel paging did not capture a full month label sequence')
		}
		const distance = monthDistance(previousLabel, nextLabel)
		if (distance !== -1) {
			throw new Error(
				`backward wheel paging skipped or misaligned months: ${previousLabel} -> ${nextLabel}`
			)
		}
	}
}

async function assertCanSelectFromALaterMonth(page: Page) {
	const monthTitle = page.locator('.member-calendar__month-banner-title')
	const enabledAvailableDaySelector = '.member-calendar__day--available:not([disabled])'
	const startLabel = ((await monthTitle.textContent()) || '').trim()
	let laterLabel = startLabel
	let foundAvailableDay = false

	await page.locator('.member-calendar__viewport').hover()
	for (let attempt = 0; attempt < 12; attempt += 1) {
		await page.mouse.wheel(0, 120)
		await page.waitForTimeout(900)
		laterLabel = ((await monthTitle.textContent()) || '').trim()
		if (laterLabel !== startLabel && (await page.locator(enabledAvailableDaySelector).count()) > 0) {
			foundAvailableDay = true
			break
		}
	}

	if (!foundAvailableDay) {
		throw new Error('could not reach a later month with available days')
	}

	await page.locator(enabledAvailableDaySelector).first().click()
	await page.locator('.calendar-page__slots-section').waitFor({ timeout: 5000 })

	const selectedCount = await page.locator('.member-calendar__day--selected').count()
	if (selectedCount === 0) {
		throw new Error(`clicking an available day in ${laterLabel} did not select that day`)
	}
}

async function clickVisibleAvailableDay(page: Page) {
	const enabledAvailableDaySelector = '.member-calendar__day--available:not([disabled])'
	const totalAvailable = await page.locator(enabledAvailableDaySelector).count()
	if (totalAvailable === 0) {
		throw new Error('could not find an available day in the current month view')
	}
	await page.locator(enabledAvailableDaySelector).first().click()
}

export async function runCalendarBookingCalendarSmoke() {
	const browser = await chromium.launch({ headless: true })
	const context = await browser.newContext()
	const page = await context.newPage()
	const errors: string[] = []

	try {
		page.on('pageerror', (err) => {
			errors.push(`pageerror: ${String(err)}`)
		})
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				errors.push(`console.error: ${msg.text()}`)
			}
		})

		await page.goto(`${BASE_URL}/schedule/gym/?mock=1&preview=1`, { waitUntil: 'domcontentloaded', timeout: 30000 })

		if (page.url().includes('/schedule/login')) {
			throw new Error('calendar member session bootstrap did not stick')
		}

		await page.locator('.member-calendar__viewport').waitFor({ timeout: 10000 })
		await page.waitForFunction(
			() => document.querySelectorAll('.member-calendar__day--available').length > 0,
			undefined,
			{ timeout: 5000 }
		)
		await page.waitForFunction(
			() => (document.querySelector('.member-calendar__month-banner-title')?.textContent || '').trim().length > 0,
			undefined,
			{ timeout: 5000 }
		)
		await page.waitForTimeout(500)
		await page.locator('.member-calendar__viewport').hover()
		await expectWheelBurstToAdvanceExactlyOneMonth(page)
		await expectSecondWheelGestureToAdvanceOneMoreMonth(page)
		await page.goto(`${BASE_URL}/schedule/gym/?mock=1&preview=1`, {
			waitUntil: 'domcontentloaded',
			timeout: 30000
		})
		await page.locator('.member-calendar__viewport').waitFor({ timeout: 10000 })
		await page.waitForFunction(
			() => (document.querySelector('.member-calendar__month-banner-title')?.textContent || '').trim().length > 0,
			undefined,
			{ timeout: 5000 }
		)
		await page.waitForTimeout(500)
		await page.locator('.member-calendar__viewport').hover()
		await expectBackwardWheelPagingToRemainMonthAccurate(page)

		await page.goto(`${BASE_URL}/schedule/gym/?mock=1&preview=1`, {
			waitUntil: 'domcontentloaded',
			timeout: 30000
		})
		await page.locator('.member-calendar__viewport').waitFor({ timeout: 10000 })
		await page.waitForFunction(
			() => document.querySelectorAll('.member-calendar__day--available').length > 0,
			undefined,
			{ timeout: 5000 }
		)
		await page.waitForTimeout(500)

		const activeDays = page.locator('.member-calendar__day--available')
		const activeCount = await activeDays.count()
		if (activeCount === 0) {
			throw new Error('no active calendar days rendered on mock booking page')
		}

		await clickVisibleAvailableDay(page)

		const slotButtons = page.locator('.calendar-page__slot-button')
		await page.waitForTimeout(500)
		await page.waitForFunction(
			() => document.querySelectorAll('.calendar-page__slot-button').length > 0,
			undefined,
			{ timeout: 10000 }
		)
		const slotCount = await slotButtons.count()
		if (slotCount === 0) {
			throw new Error('clicking an active day did not reveal any slot buttons')
		}

		const firstSlot = slotButtons.first()
		const firstSlotTextBefore = (await firstSlot.textContent()) || ''
		const beforeIndicatesJoinable =
			firstSlotTextBefore.includes('Join') ||
			firstSlotTextBefore.includes('Join waitlist') ||
			firstSlotTextBefore.includes('Leave')
		if (!beforeIndicatesJoinable) {
			throw new Error(`slot button did not expose a booking action: ${firstSlotTextBefore}`)
		}

		await firstSlot.click()
		await page.waitForTimeout(150)

		const firstSlotTextAfterJoin = (await firstSlot.textContent()) || ''
		if (!firstSlotTextAfterJoin.includes('Leave')) {
			throw new Error(`joining a mock slot did not update the CTA to Leave: ${firstSlotTextAfterJoin}`)
		}

		await firstSlot.click()
		await page.waitForTimeout(150)

		const firstSlotTextAfterLeave = (await firstSlot.textContent()) || ''
		if (firstSlotTextAfterLeave.includes('Leave')) {
			throw new Error(`leaving a mock slot did not clear the joined state: ${firstSlotTextAfterLeave}`)
		}

		await assertCanSelectFromALaterMonth(page)

		if (errors.length > 0) {
			throw new Error(`booking page emitted runtime errors:\n- ${errors.join('\n- ')}`)
		}

		console.log('[calendar-booking-calendar-smoke] PASS')
	} finally {
		await context.close()
		await browser.close()
	}
}
