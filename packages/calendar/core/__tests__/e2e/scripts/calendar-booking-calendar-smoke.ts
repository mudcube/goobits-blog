import { chromium, type Page } from 'playwright'
import { BASE_URL } from './_helpers'

async function assertMonthSlide(page: Page, buttonName: 'Next month' | 'Previous month') {
	const labelBefore = ((await page.locator('.admin-calendar__title').textContent()) || '').trim()
	await page.getByRole('button', { name: buttonName }).click()
	await page.waitForTimeout(30)

	const duringSlide = await page.evaluate(() => {
		const current = document.querySelector('.admin-calendar__grid-layer--current')
		const previous = document.querySelector('.admin-calendar__grid-layer--previous')
		const currentStyle = current ? getComputedStyle(current) : null
		const previousStyle = previous ? getComputedStyle(previous) : null
		return {
			label: document.querySelector('.admin-calendar__title')?.textContent?.trim() || '',
			layerCount: document.querySelectorAll('.admin-calendar__grid-layer').length,
			currentAnimation: currentStyle?.animationName || '',
			previousAnimation: previousStyle?.animationName || '',
			currentTransform: currentStyle?.transform || '',
			previousTransform: previousStyle?.transform || ''
		}
	})

	if (duringSlide.layerCount !== 2) {
		throw new Error(`${buttonName} did not render exactly two grid layers during animation`)
	}
	if (duringSlide.currentAnimation === 'none' || duringSlide.previousAnimation === 'none') {
		throw new Error(`${buttonName} did not apply an animation to both calendar layers`)
	}
	if (duringSlide.currentTransform === 'none' || duringSlide.previousTransform === 'none') {
		throw new Error(`${buttonName} did not apply a transform while animating`)
	}
	if (duringSlide.label === labelBefore) {
		throw new Error(`${buttonName} did not update the month label at animation start`)
	}

	await page.waitForTimeout(260)

	const afterSlide = await page.evaluate(() => ({
		label: document.querySelector('.admin-calendar__title')?.textContent?.trim() || '',
		layerCount: document.querySelectorAll('.admin-calendar__grid-layer').length
	}))

	if (afterSlide.layerCount !== 1) {
		throw new Error(`${buttonName} did not collapse back to a single interactive grid`)
	}
	if (afterSlide.label === labelBefore) {
		throw new Error(`${buttonName} did not leave the calendar on a different month`)
	}
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

		await page.goto(`${BASE_URL}/schedule/gym/?mock=1&preview=1`, { waitUntil: 'networkidle', timeout: 30000 })

		if (page.url().includes('/schedule/login')) {
			throw new Error('calendar member session bootstrap did not stick')
		}

		const activeDays = page.locator('.admin-calendar__day--active')
		const activeCount = await activeDays.count()
		if (activeCount === 0) {
			throw new Error('no active calendar days rendered on mock booking page')
		}

		await assertMonthSlide(page, 'Next month')
		await assertMonthSlide(page, 'Previous month')

		const futureOffMonthActiveDay = page.locator('.admin-calendar__day--off.admin-calendar__day--active').first()
		const offMonthActiveCount = await page.locator('.admin-calendar__day--off.admin-calendar__day--active').count()
		if (offMonthActiveCount > 0) {
			const monthLabelBefore = ((await page.locator('.admin-calendar__title').textContent()) || '').trim()
			const offMonthDayNum = Number(((await futureOffMonthActiveDay.locator('.admin-calendar__day-num').textContent()) || '').trim())
			await futureOffMonthActiveDay.click()
			await page.locator('.calendar-page__slots-section').waitFor({ timeout: 10000 })
			const offMonthSlotCount = await page.locator('.calendar-page__slot-button').count()
			if (offMonthSlotCount === 0) {
				throw new Error('clicking an active off-month future day did not reveal any slot buttons')
			}
			const monthLabelAfter = ((await page.locator('.admin-calendar__title').textContent()) || '').trim()
			if (monthLabelBefore === monthLabelAfter) {
				throw new Error('clicking an active off-month future day did not change the visible month label')
			}
			const selectedDayNum = Number(((await page.locator('.admin-calendar__day--selected .admin-calendar__day-num').textContent()) || '').trim())
			if (selectedDayNum !== offMonthDayNum) {
				throw new Error(`selected off-month day mismatch: expected ${offMonthDayNum}, got ${selectedDayNum}`)
			}
		}

		await activeDays.first().click()

		const slotsSection = page.locator('.calendar-page__slots-section')
		await slotsSection.waitFor({ timeout: 10000 })

		const slotButtons = page.locator('.calendar-page__slot-button')
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

		if (errors.length > 0) {
			throw new Error(`booking page emitted runtime errors:\n- ${errors.join('\n- ')}`)
		}

		console.log('[calendar-booking-calendar-smoke] PASS')
	} finally {
		await context.close()
		await browser.close()
	}
}
