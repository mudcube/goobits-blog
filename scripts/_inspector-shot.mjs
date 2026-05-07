import { chromium } from 'playwright'

const url = 'http://localhost:3610/playground/program-editor-inspector'

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1280, height: 1100 } })
const page = await context.newPage()

await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 })
await page.waitForTimeout(400)

const inspector = await page.locator('aside.inspector').first()
const box = await inspector.boundingBox()
if (box) {
	await page.screenshot({
		path: '/tmp/inspector-only.png',
		clip: { x: box.x - 8, y: box.y - 8, width: box.width + 16, height: box.height + 16 }
	})
	console.log('saved /tmp/inspector-only.png', box.height)
}

const cell = await page.locator('button.calendar__cell').nth(8)
await cell.click()
await page.waitForTimeout(300)

const dayBox = await page.locator('aside.inspector').first().boundingBox()
if (dayBox) {
	await page.screenshot({
		path: '/tmp/inspector-day.png',
		clip: { x: dayBox.x - 8, y: dayBox.y - 8, width: dayBox.width + 16, height: dayBox.height + 16 }
	})
	console.log('saved /tmp/inspector-day.png')
}

await browser.close()
