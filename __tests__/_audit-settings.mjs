import { chromium } from 'playwright'
import { execSync } from 'node:child_process'

const BASE_URL = 'http://localhost:3610'

function getAdminPasscode() {
  return execSync('pnpm exec dotenvx get ADMIN_PASSCODE -f config/env/.env', {
    stdio: ['ignore', 'pipe', 'ignore'],
    cwd: '/workspace'
  })
    .toString('utf8')
    .trim()
}

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1280, height: 1200 } })

try {
  const passcode = getAdminPasscode()
  if (!passcode) throw new Error('No ADMIN_PASSCODE')

  const page = await context.newPage()
  page.on('console', (m) => {
    if (m.type() === 'error') console.log('[browser-console]', m.text())
  })
  page.on('pageerror', (e) => console.log('[browser-error]', String(e)))

  // Login
  await page.goto(`${BASE_URL}/schedule/admin/`, { waitUntil: 'domcontentloaded' })
  await page.fill('input[name="password"]', passcode)
  await Promise.all([
    page.waitForLoadState('networkidle', { timeout: 30000 }),
    page.click('button[type="submit"]')
  ])

  await page.goto(`${BASE_URL}/schedule/admin/settings/`, {
    waitUntil: 'networkidle',
    timeout: 30000
  })
  await page.waitForTimeout(1500)

  async function shot(name) {
    const path = `/tmp/settings-${name}.png`
    await page.screenshot({ path, fullPage: true })
    console.log(`  → ${path}`)
    return path
  }

  console.log('## State 1: empty (nothing configured yet)')
  await shot('1-empty')

  // Click PayPal tile to start editing it
  await page.click('.payment-tile:has-text("PayPal")')
  await page.waitForTimeout(400)
  console.log('## State 2: PayPal tile editing, no handle yet')
  await shot('2-paypal-empty')

  // Type a PayPal handle
  const paypalInput = await page.$('#payment-handle-paypal')
  if (paypalInput) {
    await paypalInput.fill('hello@miko.art')
    await page.waitForTimeout(400)
  }
  console.log('## State 3: PayPal configured (handle filled), now primary')
  await shot('3-paypal-configured')

  // Click Venmo tile to add another method
  await page.click('.payment-tile:has-text("Venmo")')
  await page.waitForTimeout(400)
  console.log('## State 4: Venmo editing (PayPal still configured)')
  await shot('4-venmo-editing')

  // Type a Venmo handle
  const venmoInput = await page.$('#payment-handle-venmo')
  if (venmoInput) {
    await venmoInput.fill('@miko-meow')
    await page.waitForTimeout(400)
  }
  console.log('## State 5: Both PayPal + Venmo configured (PayPal still primary)')
  await shot('5-multi-configured')

  // Make Venmo primary
  const makePrimary = await page.$('button:has-text("Make primary")')
  if (makePrimary) {
    await makePrimary.click()
    await page.waitForTimeout(400)
  }
  console.log('## State 6: Venmo is now primary')
  await shot('6-venmo-primary')

  // Click Cash App tile to add a third
  await page.click('.payment-tile:has-text("Cash App")')
  await page.waitForTimeout(400)
  const cashappInput = await page.$('#payment-handle-cashapp')
  if (cashappInput) {
    await cashappInput.fill('$miko')
    await page.waitForTimeout(400)
  }
  console.log('## State 7: All three configured')
  await shot('7-all-three')

  // Click Cash App tile (already editing) — focus on it
  await page.click('.payment-tile:has-text("Venmo")')
  await page.waitForTimeout(400)
  console.log('## State 8: Editing Venmo (the primary), with all three configured')
  await shot('8-venmo-primary-editing')

  console.log('\nDone.')
} finally {
  await context.close()
  await browser.close()
}
