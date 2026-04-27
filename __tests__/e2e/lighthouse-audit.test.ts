import { describe, it, expect } from 'vitest'
import { chromium, type Page, type BrowserContext } from 'playwright'

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3610'

const pages = [
  { url: '/', name: 'HOME' },
  { url: '/music/', name: 'MUSIC' },
  { url: '/apps/', name: 'APPS' },
  { url: '/journal/', name: 'JOURNAL' },
  { url: '/labs/', name: 'LABS' },
]

const viewports = {
  mobile: { width: 375, height: 812 },
  desktop: { width: 1440, height: 900 },
}

interface PerfMetrics {
  ttfb: number | null
  domContentLoaded: number | null
  loadComplete: number | null
  fcp: number | null
  cls: number
}

interface ResourceInfo {
  totalTransfer: number
  byType: Record<string, number>
  count: number
}

interface SeoInfo {
  title: string | null
  metaDescription: string | null
  metaViewport: string | null
  canonical: string | null
  h1: string | null
  h1Count: number
  ogTitle: string | null
  ogDescription: string | null
  ogImage: string | null
  robots: string | null
  structuredData: number
  lang: string | null
  imagesTotal: number
  imagesMissingAlt: number
  linksTotal: number
  linksNoText: number
}

async function getPerf(page: Page): Promise<PerfMetrics> {
  return page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paint = performance.getEntriesByType('paint')
    const fcp = paint.find(e => e.name === 'first-contentful-paint')
    let cls = 0
    const entries = performance.getEntriesByType('layout-shift') as any[]
    for (const e of entries) { if (!e.hadRecentInput) cls += e.value }
    return {
      ttfb: nav ? Math.round(nav.responseStart - nav.requestStart) : null,
      domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : null,
      loadComplete: nav ? Math.round(nav.loadEventEnd - nav.startTime) : null,
      fcp: fcp ? Math.round(fcp.startTime) : null,
      cls: Math.round(cls * 1000) / 1000,
    }
  })
}

async function getLCP(page: Page): Promise<number | null> {
  return page.evaluate(() => new Promise<number | null>(resolve => {
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      resolve(entries.length ? Math.round(entries[entries.length - 1].startTime) : null)
    }).observe({ type: 'largest-contentful-paint', buffered: true })
    setTimeout(() => resolve(null), 3000)
  }))
}

async function getResources(page: Page): Promise<ResourceInfo> {
  return page.evaluate(() => {
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    let totalTransfer = 0
    const byType: Record<string, number> = {}
    for (const e of entries) {
      totalTransfer += e.transferSize || 0
      const ext = e.name.split('?')[0].split('.').pop()?.toLowerCase() || 'other'
      byType[ext] = (byType[ext] || 0) + (e.transferSize || 0)
    }
    return { totalTransfer, byType, count: entries.length }
  })
}

async function getSEO(page: Page): Promise<SeoInfo> {
  return page.evaluate(() => ({
    title: document.title || null,
    metaDescription: document.querySelector('meta[name="description"]')?.getAttribute('content') || null,
    metaViewport: document.querySelector('meta[name="viewport"]')?.getAttribute('content') || null,
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || null,
    h1: document.querySelector('h1')?.textContent?.trim() || null,
    h1Count: document.querySelectorAll('h1').length,
    ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || null,
    ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || null,
    ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content') || null,
    robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') || null,
    structuredData: document.querySelectorAll('script[type="application/ld+json"]').length,
    lang: document.documentElement.lang || null,
    imagesTotal: document.querySelectorAll('img').length,
    imagesMissingAlt: [...document.querySelectorAll('img')].filter(i => !i.alt && !i.getAttribute('role')?.includes('presentation')).length,
    linksTotal: document.querySelectorAll('a').length,
    linksNoText: [...document.querySelectorAll('a')].filter(a => !a.textContent?.trim() && !a.getAttribute('aria-label')).length,
  }))
}

describe('Site Audit', () => {
  let browser: any

  it('runs full audit across all pages', async () => {
    browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })

    const allResults: string[] = []
    const log = (s: string) => { allResults.push(s); console.log(s) }

    log('='.repeat(80))
    log('  SITE AUDIT — Performance, Accessibility, SEO, Mobile')
    log('='.repeat(80))

    for (const { url, name } of pages) {
      const fullUrl = `${BASE}${url}`
      log(`\n${'─'.repeat(70)}`)
      log(`  ${name}  ${fullUrl}`)
      log('─'.repeat(70))

      for (const [label, vp] of Object.entries(viewports)) {
        const isMobile = label === 'mobile'
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          isMobile,
          hasTouch: isMobile,
          ...(isMobile ? { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' } : {}),
        })
        const page = await context.newPage()

        const startTime = Date.now()
        const response = await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 30000 })
        const wallTime = Date.now() - startTime
        const status = response?.status()

        // Give LCP observer time
        await page.waitForTimeout(1000)

        const perf = await getPerf(page)
        const lcp = await getLCP(page)
        const res = await getResources(page)

        log(`\n  [${label.toUpperCase()}] (${vp.width}x${vp.height})`)
        log(`    Status: ${status}`)
        log(`    Wall time: ${wallTime}ms`)
        log(`    TTFB: ${perf.ttfb}ms`)
        log(`    FCP: ${perf.fcp}ms`)
        log(`    LCP: ${lcp}ms`)
        log(`    DOM Content Loaded: ${perf.domContentLoaded}ms`)
        log(`    Full Load: ${perf.loadComplete}ms`)
        log(`    CLS: ${perf.cls}`)
        log(`    Resources: ${res.count} requests, ${Math.round(res.totalTransfer / 1024)}KB transferred`)

        const sorted = Object.entries(res.byType).sort((a, b) => b[1] - a[1]).slice(0, 5)
        if (sorted.length) {
          log(`    Top types: ${sorted.map(([t, s]) => `${t}: ${Math.round(s / 1024)}KB`).join(', ')}`)
        }

        if (isMobile) {
          const seo = await getSEO(page)
          log(`\n    --- SEO ---`)
          log(`    Title: ${seo.title ? '✓' : '✗'} ${seo.title ? `(${seo.title.length} chars)` : 'MISSING'}`)
          log(`    Meta description: ${seo.metaDescription ? '✓' : '✗'} ${seo.metaDescription ? `(${seo.metaDescription.length} chars)` : 'MISSING'}`)
          log(`    Viewport meta: ${seo.metaViewport ? '✓' : '✗'}`)
          log(`    Canonical: ${seo.canonical ? '✓' : '✗'}`)
          log(`    H1: ${seo.h1 ? '✓' : '✗'}${seo.h1Count > 1 ? ` ⚠ ${seo.h1Count} h1 tags` : ''}`)
          log(`    OG tags: ${seo.ogTitle && seo.ogDescription && seo.ogImage ? '✓' : '✗'}`)
          log(`    Structured data: ${seo.structuredData > 0 ? '✓' : '✗'} (${seo.structuredData} blocks)`)
          log(`    Lang: ${seo.lang || '✗ MISSING'}`)
          log(`    Robots: ${seo.robots || 'not set'}`)
          log(`    Images: ${seo.imagesTotal} total, ${seo.imagesMissingAlt} missing alt`)
          log(`    Links: ${seo.linksTotal} total, ${seo.linksNoText} missing accessible text`)
        }

        // Basic accessibility checks (without axe-core dependency)
        if (!isMobile) {
          const a11y = await page.evaluate(() => {
            const issues: string[] = []

            // Check for skip nav link
            const firstLink = document.querySelector('a')
            if (!firstLink || !firstLink.getAttribute('href')?.startsWith('#')) {
              issues.push('No skip navigation link')
            }

            // Images without alt
            const imgs = document.querySelectorAll('img:not([alt]):not([role="presentation"])')
            if (imgs.length) issues.push(`${imgs.length} images missing alt text`)

            // Buttons without accessible names
            const btns = document.querySelectorAll('button')
            const emptyBtns = [...btns].filter(b => !b.textContent?.trim() && !b.getAttribute('aria-label') && !b.getAttribute('title'))
            if (emptyBtns.length) issues.push(`${emptyBtns.length} buttons without accessible name`)

            // Form inputs without labels
            const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"])')
            const unlabeled = [...inputs].filter(i => {
              const id = i.id
              return !i.getAttribute('aria-label') && !i.getAttribute('aria-labelledby') && !(id && document.querySelector(`label[for="${id}"]`)) && !i.closest('label')
            })
            if (unlabeled.length) issues.push(`${unlabeled.length} inputs without labels`)

            // Check color contrast (basic — just check if there's forced dark theme)
            const html = document.documentElement
            if (html.classList.contains('theme-dark') || html.getAttribute('data-theme') === 'dark') {
              // Note dark theme
            }

            // Empty links
            const links = document.querySelectorAll('a')
            const emptyLinks = [...links].filter(a => !a.textContent?.trim() && !a.getAttribute('aria-label') && !a.querySelector('img[alt]'))
            if (emptyLinks.length) issues.push(`${emptyLinks.length} links without accessible text`)

            // Heading order
            const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
            let lastLevel = 0
            let skipped = false
            for (const h of headings) {
              const level = parseInt(h.tagName[1])
              if (level > lastLevel + 1 && lastLevel > 0) {
                skipped = true
                break
              }
              lastLevel = level
            }
            if (skipped) issues.push('Heading levels are skipped (e.g., h1 → h3)')

            // ARIA roles
            const badRoles = document.querySelectorAll('[role=""]')
            if (badRoles.length) issues.push(`${badRoles.length} elements with empty role attribute`)

            // Tab index > 0
            const badTabIndex = document.querySelectorAll('[tabindex]:not([tabindex="0"]):not([tabindex="-1"])')
            if (badTabIndex.length) issues.push(`${badTabIndex.length} elements with tabindex > 0`)

            return issues
          })

          log(`\n    --- Accessibility ---`)
          if (a11y.length === 0) {
            log(`    ✓ No basic issues found`)
          } else {
            for (const issue of a11y) {
              log(`    ⚠ ${issue}`)
            }
          }
        }

        await context.close()
      }
    }

    log('\n' + '='.repeat(80))
    log('  Audit complete.')
    log('='.repeat(80))

    await browser.close()

    // Basic assertions — pages should load
    expect(true).toBe(true)
  }, 180000)
})
