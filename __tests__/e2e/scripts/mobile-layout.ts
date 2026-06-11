#!/usr/bin/env node
import { BASE_URL } from './_config'
import { withBrowserContext } from './_helpers'

const ROUTES = ['/', '/about', '/journal', '/labs', '/contact']

const VIEWPORTS = [
	{ name: 'mobile-375', width: 375, height: 800 },
	{ name: 'mobile-414', width: 414, height: 896 },
	{ name: 'tablet-768', width: 768, height: 1024 }
]

const MAX_HEADER_HEIGHT = 110

type Failure = { route: string; viewport: string; reason: string }

export async function runMobileLayout() {
	const failures: Failure[] = []

	for (const vp of VIEWPORTS) {
		await withBrowserContext(
			async (context) => {
				const page = await context.newPage()

				for (const route of ROUTES) {
					const url = `${BASE_URL}${route}`
					const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
					if (!res || res.status() >= 500) {
						failures.push({ route, viewport: vp.name, reason: `bad response ${res?.status()}` })
						continue
					}

					await page.waitForTimeout(500)

					const result = await page.evaluate(({ maxHeader }) => {
						const out: { issues: string[]; headerH: number; navDisplay: string | null; btnDisplay: string | null; docW: number; winW: number } = {
							issues: [],
							headerH: 0,
							navDisplay: null,
							btnDisplay: null,
							docW: document.documentElement.scrollWidth,
							winW: window.innerWidth
						}

						const header = document.querySelector('.layout-header') as HTMLElement | null
						if (header) {
							out.headerH = header.offsetHeight
							if (out.headerH > maxHeader) {
								out.issues.push(`header height ${out.headerH}px exceeds ${maxHeader}px (nav likely wrapping to second row)`)
							}
						}

						const nav = document.querySelector('.layout-header__nav') as HTMLElement | null
						const btn = document.querySelector('.layout-header__menu-button') as HTMLElement | null
						if (nav) out.navDisplay = getComputedStyle(nav).display
						if (btn) out.btnDisplay = getComputedStyle(btn).display

						if (header) {
							if (out.navDisplay !== 'none') out.issues.push(`desktop nav visible at mobile width (display=${out.navDisplay})`)
							if (out.btnDisplay === 'none') out.issues.push(`hamburger button hidden at mobile width (display=${out.btnDisplay})`)
						}

						if (out.docW > out.winW + 1) {
							out.issues.push(`horizontal overflow: doc=${out.docW} > win=${out.winW}`)
						}

						return out
					}, { maxHeader: MAX_HEADER_HEIGHT })

					for (const issue of result.issues) {
						failures.push({ route, viewport: vp.name, reason: issue })
					}
				}

				await page.close()
			},
			{ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2 }
		)
	}

	if (failures.length) {
		const lines = failures.map((f) => `  [${f.viewport}] ${f.route}: ${f.reason}`).join('\n')
		throw new Error(`mobile-layout: ${failures.length} issue(s) detected:\n${lines}`)
	}
}
