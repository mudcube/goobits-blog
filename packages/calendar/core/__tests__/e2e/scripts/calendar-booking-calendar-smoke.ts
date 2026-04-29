import { chromium, type Page } from 'playwright'
import { BASE_URL } from './_helpers'
import { waitForMonthChange } from './_ui-waits'

async function expectNextButtonToAdvanceExactlyOneMonth(page: Page) {
	const monthTitle = page.locator('.cg__nav-label')
	const readMonthTitle = async () => ((await monthTitle.textContent()) || '').trim()
	const before = await readMonthTitle()
	await page.getByRole('button', { name: 'Next month' }).click()
	const after = await waitForMonthChange(page, before)

	if (before === after) {
		throw new Error(`next month button did not advance the visible month: ${before}`)
	}

	const steppedTwice = await page.evaluate((beforeLabel) => {
		const parseMonth = (label: string) => {
			const parsed = new Date(`${label} 1`)
			return Number.isNaN(parsed.getTime()) ? null : parsed
		}
		const beforeDate = parseMonth(beforeLabel)
		const currentLabel = (document.querySelector('.cg__nav-label')?.textContent || '').trim()
		const afterDate = parseMonth(currentLabel)
		if (!beforeDate || !afterDate) return false
		const monthDistance =
			(afterDate.getFullYear() - beforeDate.getFullYear()) * 12 +
			(afterDate.getMonth() - beforeDate.getMonth())
		return Math.abs(monthDistance) !== 1
	}, before)

	if (steppedTwice) {
		throw new Error(`next month button advanced more than one month: ${before} -> ${after}`)
	}
}

async function expectSecondNextClickToAdvanceOneMoreMonth(page: Page) {
	const monthTitle = page.locator('.cg__nav-label')
	const readMonthTitle = async () => ((await monthTitle.textContent()) || '').trim()
	const before = await readMonthTitle()

	await page.getByRole('button', { name: 'Next month' }).click()
	const after = await waitForMonthChange(page, before)
	if (before === after) {
		throw new Error(`second next month click did not advance the visible month: ${before}`)
	}

	const steppedTwice = await page.evaluate((beforeLabel) => {
		const parseMonth = (label: string) => {
			const parsed = new Date(`${label} 1`)
			return Number.isNaN(parsed.getTime()) ? null : parsed
		}
		const beforeDate = parseMonth(beforeLabel)
		const currentLabel = (document.querySelector('.cg__nav-label')?.textContent || '').trim()
		const afterDate = parseMonth(currentLabel)
		if (!beforeDate || !afterDate) return false
		const monthDistance =
			(afterDate.getFullYear() - beforeDate.getFullYear()) * 12 +
			(afterDate.getMonth() - beforeDate.getMonth())
		return Math.abs(monthDistance) !== 1
	}, before)

	if (steppedTwice) {
		throw new Error(`second next month click advanced more than one month: ${before} -> ${after}`)
	}
}

async function expectBackwardButtonPagingToRemainMonthAccurate(page: Page) {
	const monthTitle = page.locator('.cg__nav-label')
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

	const labels: string[] = [((await monthTitle.textContent()) || '').trim()]
	for (let i = 0; i < 4; i += 1) {
		const before = ((await monthTitle.textContent()) || '').trim()
		await page.getByRole('button', { name: 'Previous month' }).click()
		labels.push(await waitForMonthChange(page, before))
	}

	for (let i = 1; i < labels.length; i += 1) {
		const previousLabel = labels[i - 1]
		const nextLabel = labels[i]
		if (!previousLabel || !nextLabel) {
			throw new Error('backward wheel paging did not capture a full month label sequence')
		}
		const distance = monthDistance(previousLabel, nextLabel)
		if (distance !== -1) {
			throw new Error(
				`backward button paging skipped or misaligned months: ${previousLabel} -> ${nextLabel}`
			)
		}
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

		await page.goto(`${BASE_URL}/schedule/gym/?mock=1&preview=1`, { waitUntil: 'domcontentloaded', timeout: 30000 })

		if (page.url().includes('/schedule/login')) {
			throw new Error('calendar member session bootstrap did not stick')
		}

		await page.locator('[data-calendar-ready="true"]').waitFor({ timeout: 10000 })
		await page.locator('.cg__cell--active:not([disabled])').first().waitFor({ timeout: 10000 })
		await page.locator('.cg__nav-label').waitFor({ timeout: 10000 })
		await expectNextButtonToAdvanceExactlyOneMonth(page)
		await expectSecondNextClickToAdvanceOneMoreMonth(page)
		await page.goto(`${BASE_URL}/schedule/gym/?mock=1&preview=1`, {
			waitUntil: 'domcontentloaded',
			timeout: 30000
		})
		await page.locator('[data-calendar-ready="true"]').waitFor({ timeout: 10000 })
		await page.locator('.cg__nav-label').waitFor({ timeout: 10000 })
		await expectBackwardButtonPagingToRemainMonthAccurate(page)

		await page.goto(`${BASE_URL}/schedule/gym/?mock=1&preview=1`, {
			waitUntil: 'domcontentloaded',
			timeout: 30000
		})
		await page.locator('[data-calendar-ready="true"]').waitFor({ timeout: 10000 })
		await page.locator('.cg__cell--active:not([disabled])').first().waitFor({ timeout: 10000 })

		const activeDays = page.locator('.cg__cell--active:not([disabled])')
		const activeCount = await activeDays.count()
		if (activeCount === 0) {
			throw new Error('no active calendar days rendered on mock booking page')
		}

		await activeDays.first().click()

		const slotButtons = page.locator('.ts__slot')
		await slotButtons.first().waitFor({ timeout: 10000 })
		const slotCount = await slotButtons.count()
		if (slotCount === 0) {
			throw new Error('clicking an active day did not reveal preset slot buttons')
		}

		const firstSlot = slotButtons.first()
		const firstSlotTextBefore = (await firstSlot.textContent()) || ''
		if (!firstSlotTextBefore.includes('left') && !firstSlotTextBefore.includes('Waitlist')) {
			throw new Error(`preset slot did not expose availability: ${firstSlotTextBefore}`)
		}

		await firstSlot.click()
		if ((await page.locator('.ts__slot--selected').count()) === 0) {
			throw new Error('clicking a preset slot did not mark it selected')
		}

		await page.locator('.ts__confirm').click()
		await page.locator('.bs__card').waitFor({ timeout: 10000 })

		if (errors.length > 0) {
			throw new Error(`booking page emitted runtime errors:\n- ${errors.join('\n- ')}`)
		}

		console.log('[calendar-booking-calendar-smoke] PASS')
	} finally {
		await context.close()
		await browser.close()
	}
}
