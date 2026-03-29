#!/usr/bin/env node

import { chromium } from 'playwright'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3610'
const LOGIN_URL = `${BASE_URL}/schedule/login/?redirect=%2Fschedule%2Fcircus%2F`
const GOOGLE_EMAIL = process.env.E2E_GOOGLE_EMAIL || ''
const GOOGLE_PASSWORD = process.env.E2E_GOOGLE_PASSWORD || ''

function log(message) {
	process.stdout.write(`${message}\n`)
}

async function main() {
	const browser = await chromium.launch({ headless: true })
	const page = await browser.newPage()

	page.on('request', request => {
		const url = request.url()
		if (url.includes('accounts.google.com') || url.includes('localhost:3610')) {
			log(`REQ ${request.method()} ${url}`)
		}
	})

	page.on('response', response => {
		const url = response.url()
		if (url.includes('accounts.google.com') || url.includes('localhost:3610')) {
			log(`RES ${response.status()} ${url}`)
		}
	})

	try {
		log(`Opening ${LOGIN_URL}`)
		await page.goto(LOGIN_URL, { waitUntil: 'networkidle', timeout: 30000 })

		const googleButton = page.getByRole('button', { name: /sign in with google/i })
		await googleButton.waitFor({ state: 'visible', timeout: 10000 })
		await page.waitForTimeout(1000)
		await googleButton.click()

		await page.waitForURL(url => {
			return (
				url.href.startsWith('https://accounts.google.com/') ||
				url.href.includes('/schedule/login?error=')
			)
		}, { timeout: 30000 })

		log(`AFTER_CLICK ${page.url()}`)

		if (page.url().includes('/schedule/login?error=')) {
			throw new Error(`Login flow returned to app with error: ${page.url()}`)
		}

		if (!page.url().startsWith('https://accounts.google.com/')) {
			throw new Error(`Did not reach Google Accounts: ${page.url()}`)
		}

		log(`TITLE ${await page.title()}`)

		if (!GOOGLE_EMAIL || !GOOGLE_PASSWORD) {
			log('RESULT handoff-ok')
			log('No E2E_GOOGLE_EMAIL/E2E_GOOGLE_PASSWORD provided; stopping after Google handoff.')
			return
		}

		const emailInput = page.locator('input[type="email"]').first()
		await emailInput.waitFor({ state: 'visible', timeout: 20000 })
		await emailInput.fill(GOOGLE_EMAIL)
		await page.getByRole('button', { name: /next/i }).click()

		const passwordInput = page.locator('input[type="password"]').first()
		await passwordInput.waitFor({ state: 'visible', timeout: 20000 })
		await passwordInput.fill(GOOGLE_PASSWORD)
		await page.getByRole('button', { name: /next/i }).click()

		await page.waitForURL(url => {
			return url.origin === new URL(BASE_URL).origin && !url.href.includes('/schedule/login?error=')
		}, { timeout: 60000 })

		log(`FINAL ${page.url()}`)

		if (page.url().includes('/schedule/login?error=')) {
			throw new Error(`Full OAuth flow failed: ${page.url()}`)
		}

		log('RESULT full-flow-ok')
	} finally {
		await browser.close()
	}
}

main().catch(error => {
	console.error(error instanceof Error ? error.message : String(error))
	process.exit(1)
})
