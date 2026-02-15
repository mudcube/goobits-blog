#!/usr/bin/env node
import { chromium } from 'playwright'

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3610'
const ROUTES = [
	'/',
	'/about',
	'/labs',
	'/journal',
	'/contact',
	'/privacy',
	'/terms',
	'/cookies',
	'/calendar/login',
	'/admin'
]

// Strict by default; allow overrides for tuning.
const CLS_MAX = Number.parseFloat(process.env.E2E_CLS_MAX || '0.02')
const POST_LOAD_SETTLE_MS = Number.parseInt(process.env.E2E_CLS_SETTLE_MS || '800', 10)

async function run() {
	const browser = await chromium.launch({ headless: true })
	const context = await browser.newContext({
		viewport: { width: 1440, height: 900 }
	})

	try {
		let failed = 0
		for (const route of ROUTES) {
			const page = await context.newPage()

			// Capture CLS from the earliest possible moment.
			await page.addInitScript(() => {
				window.__e2e_cls = 0
				try {
					new PerformanceObserver((list) => {
						for (const entry of list.getEntries()) {
							// Ignore shifts caused by user input.
							if (entry && entry.hadRecentInput) continue
							window.__e2e_cls += entry.value
						}
					}).observe({ type: 'layout-shift', buffered: true })
				} catch {
					// Older browsers may not support layout-shift entries; leave CLS at 0.
				}
			})

			const url = `${BASE_URL}${route}`
			const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
			if (!res) throw new Error(`No response for ${url}`)
			if (res.status() >= 500) throw new Error(`Server error for ${url}: ${res.status()}`)

			// Wait for styles/fonts/network to settle, then read accumulated CLS.
			await page.waitForLoadState('networkidle', { timeout: 30000 })
			await page.evaluate(async () => {
				if (document?.fonts?.ready) await document.fonts.ready
			})
			await page.waitForTimeout(POST_LOAD_SETTLE_MS)

			const cls = await page.evaluate(() => window.__e2e_cls || 0)
			const ok = cls <= CLS_MAX

			// eslint-disable-next-line no-console
			console.log(`[cls] ${route.padEnd(16)} cls=${cls.toFixed(4)} ${ok ? 'OK' : 'FAIL'}`)

			if (!ok) failed++
			await page.close()
		}

		if (failed) {
			throw new Error(`Layout shift regression: ${failed} route(s) exceeded CLS_MAX=${CLS_MAX}`)
		}

		// eslint-disable-next-line no-console
		console.log(`[cls] OK: all routes <= ${CLS_MAX}`)
	} finally {
		await context.close()
		await browser.close()
	}
}

run().catch((err) => {
	// eslint-disable-next-line no-console
	console.error('[cls] Failed:', err?.message || err)
	process.exit(1)
})

