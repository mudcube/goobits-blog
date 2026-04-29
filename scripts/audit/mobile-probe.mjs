import { chromium } from 'playwright'

const URLS = [
  'http://localhost:3001/',
  'http://localhost:3001/journal/',
  'http://localhost:3001/journal/2024/07/be-here-meow/',
  'http://localhost:3001/about/',
  'http://localhost:3001/labs/'
]

const browser = await chromium.launch({
  executablePath: '/home/developer/.cache/ms-playwright/chromium_headless_shell-1217/chrome-linux/headless_shell',
  args: ['--no-sandbox', '--disable-dev-shm-usage']
})

const context = await browser.newContext({
  viewport: { width: 375, height: 812 }, // iPhone 12 Pro
  deviceScaleFactor: 3,
  isMobile: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
})

for (const url of URLS) {
  const page = await context.newPage()
  const issues = []
  page.on('console', msg => { if (msg.type() === 'error') issues.push({ type:'console', text: msg.text().slice(0, 200) }) })
  page.on('pageerror', err => issues.push({ type:'pageerror', text: err.message.slice(0, 200) }))
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
  } catch (e) {
    issues.push({ type:'nav', text: e.message })
  }
  
  // Check: horizontal overflow
  const overflow = await page.evaluate(() => {
    const w = window.innerWidth
    const docW = document.documentElement.scrollWidth
    if (docW > w) {
      // Find the offender
      const offenders = []
      document.querySelectorAll('*').forEach(el => {
        const r = el.getBoundingClientRect()
        if (r.right > w + 1 && r.width > 1) {
          offenders.push({
            tag: el.tagName,
            cls: (el.className || '').toString().slice(0, 80),
            id: el.id || '',
            right: Math.round(r.right),
            width: Math.round(r.width)
          })
        }
      })
      return { docW, viewW: w, offenders: offenders.slice(0, 5) }
    }
    return null
  })
  
  // Check: small touch targets (<44x44)
  const smallTaps = await page.evaluate(() => {
    const targets = document.querySelectorAll('a, button, [role="button"], input[type="button"], input[type="submit"]')
    const small = []
    targets.forEach(el => {
      const r = el.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) return  // hidden
      if (r.width < 44 || r.height < 44) {
        small.push({
          tag: el.tagName,
          cls: (el.className || '').toString().slice(0, 60),
          text: (el.textContent || '').trim().slice(0, 30),
          w: Math.round(r.width),
          h: Math.round(r.height)
        })
      }
    })
    return small.slice(0, 10)
  })
  
  // Check: text smaller than 12px (Lighthouse's threshold for legibility)
  const tinyText = await page.evaluate(() => {
    const all = document.querySelectorAll('p, span, div, li, a, button, h1, h2, h3, h4, h5, h6')
    const tiny = new Set()
    all.forEach(el => {
      const t = (el.textContent || '').trim()
      if (!t || t.length < 5) return
      const fs = parseFloat(getComputedStyle(el).fontSize)
      if (fs < 12 && el.children.length === 0) {
        tiny.add(`${Math.round(fs)}px - ${(el.tagName.toLowerCase())} - ${t.slice(0,40)}`)
      }
    })
    return [...tiny].slice(0, 5)
  })
  
  console.log(`\n=== ${url} ===`)
  console.log(`  console errors: ${issues.length}`)
  for (const i of issues.slice(0,3)) console.log(`    [${i.type}] ${i.text}`)
  console.log(`  horizontal overflow: ${overflow ? `YES (doc=${overflow.docW}px, view=${overflow.viewW}px)` : 'no'}`)
  if (overflow) {
    for (const o of overflow.offenders) {
      console.log(`    ${o.tag}.${o.cls.slice(0,40)} right=${o.right} width=${o.width}`)
    }
  }
  console.log(`  small touch targets (<44px): ${smallTaps.length}`)
  for (const t of smallTaps.slice(0,5)) {
    console.log(`    ${t.w}x${t.h} ${t.tag}.${t.cls.slice(0,40)} "${t.text}"`)
  }
  console.log(`  tiny text (<12px): ${tinyText.length}`)
  for (const t of tinyText) console.log(`    ${t}`)
  
  await page.close()
}

await browser.close()
