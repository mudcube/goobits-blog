import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const pages = [
  { url: 'http://localhost:3610/', name: 'HOME' },
  { url: 'http://localhost:3610/music/', name: 'MUSIC' },
  { url: 'http://localhost:3610/apps/', name: 'APPS' },
  { url: 'http://localhost:3610/journal/', name: 'JOURNAL' },
  { url: 'http://localhost:3610/labs/', name: 'LABS' },
];

const viewports = {
  mobile: { width: 375, height: 812, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' },
  desktop: { width: 1440, height: 900, isMobile: false, hasTouch: false },
};

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });

console.log('=' .repeat(80));
console.log('  SITE AUDIT — Performance, Accessibility, SEO, Mobile');
console.log('  Using Playwright + axe-core (Lighthouse Chrome crashes in this environment)');
console.log('='.repeat(80));

for (const { url, name } of pages) {
  console.log(`\n${'─'.repeat(70)}`);
  console.log(`  ${name}  ${url}`);
  console.log('─'.repeat(70));

  for (const [label, vp] of Object.entries(viewports)) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch,
      userAgent: vp.userAgent,
    });
    const page = await context.newPage();

    // --- Performance metrics ---
    const startTime = Date.now();
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const loadTime = Date.now() - startTime;
    const status = response?.status();

    // Web Vitals via Performance API
    const perfMetrics = await page.evaluate(() => {
      const perf = performance;
      const nav = perf.getEntriesByType('navigation')[0];
      const paint = perf.getEntriesByType('paint');
      const fcp = paint.find(e => e.name === 'first-contentful-paint');

      // CLS observation
      let cls = 0;
      const entries = perf.getEntriesByType('layout-shift');
      for (const e of entries) {
        if (!e.hadRecentInput) cls += e.value;
      }

      return {
        ttfb: nav ? Math.round(nav.responseStart - nav.requestStart) : null,
        domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : null,
        loadComplete: nav ? Math.round(nav.loadEventEnd - nav.startTime) : null,
        fcp: fcp ? Math.round(fcp.startTime) : null,
        transferSize: nav ? nav.transferSize : null,
        cls: Math.round(cls * 1000) / 1000,
      };
    });

    // LCP via PerformanceObserver
    const lcp = await page.evaluate(() => {
      return new Promise(resolve => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          resolve(entries.length ? Math.round(entries[entries.length - 1].startTime) : null);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        setTimeout(() => resolve(null), 3000);
      });
    });

    // Total resource sizes
    const resources = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource');
      let totalTransfer = 0;
      const byType = {};
      for (const e of entries) {
        totalTransfer += e.transferSize || 0;
        const ext = e.name.split('?')[0].split('.').pop()?.toLowerCase() || 'other';
        byType[ext] = (byType[ext] || 0) + (e.transferSize || 0);
      }
      return { totalTransfer, byType, count: entries.length };
    });

    console.log(`\n  [${label.toUpperCase()}] (${vp.width}x${vp.height})`);
    console.log(`    Status: ${status}`);
    console.log(`    Load time: ${loadTime}ms`);
    console.log(`    TTFB: ${perfMetrics.ttfb}ms`);
    console.log(`    FCP: ${perfMetrics.fcp}ms`);
    console.log(`    LCP: ${lcp}ms`);
    console.log(`    DOM Content Loaded: ${perfMetrics.domContentLoaded}ms`);
    console.log(`    Full Load: ${perfMetrics.loadComplete}ms`);
    console.log(`    CLS: ${perfMetrics.cls}`);
    console.log(`    Resources: ${resources.count} requests, ${Math.round(resources.totalTransfer / 1024)}KB transferred`);

    // Top resource types by size
    const sorted = Object.entries(resources.byType).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (sorted.length) {
      console.log(`    Top resource types: ${sorted.map(([t, s]) => `${t}: ${Math.round(s / 1024)}KB`).join(', ')}`);
    }

    // --- SEO checks ---
    const seo = await page.evaluate(() => {
      const checks = {};
      checks.title = document.title || null;
      checks.metaDescription = document.querySelector('meta[name="description"]')?.content || null;
      checks.metaViewport = document.querySelector('meta[name="viewport"]')?.content || null;
      checks.canonical = document.querySelector('link[rel="canonical"]')?.href || null;
      checks.h1 = document.querySelector('h1')?.textContent?.trim() || null;
      checks.h1Count = document.querySelectorAll('h1').length;
      checks.ogTitle = document.querySelector('meta[property="og:title"]')?.content || null;
      checks.ogDescription = document.querySelector('meta[property="og:description"]')?.content || null;
      checks.ogImage = document.querySelector('meta[property="og:image"]')?.content || null;
      checks.robots = document.querySelector('meta[name="robots"]')?.content || null;
      checks.structuredData = document.querySelectorAll('script[type="application/ld+json"]').length;
      checks.lang = document.documentElement.lang || null;

      // Image alt text
      const imgs = document.querySelectorAll('img');
      checks.imagesTotal = imgs.length;
      checks.imagesMissingAlt = [...imgs].filter(i => !i.alt && !i.getAttribute('role')?.includes('presentation')).length;

      // Links without text
      const links = document.querySelectorAll('a');
      checks.linksTotal = links.length;
      checks.linksNoText = [...links].filter(a => !a.textContent?.trim() && !a.getAttribute('aria-label')).length;

      return checks;
    });

    if (label === 'mobile') {
      console.log(`\n    --- SEO ---`);
      console.log(`    Title: ${seo.title ? '✓' : '✗'} ${seo.title ? `(${seo.title.length} chars)` : 'MISSING'}`);
      console.log(`    Meta description: ${seo.metaDescription ? '✓' : '✗'} ${seo.metaDescription ? `(${seo.metaDescription.length} chars)` : 'MISSING'}`);
      console.log(`    Viewport meta: ${seo.metaViewport ? '✓' : '✗'}`);
      console.log(`    Canonical: ${seo.canonical ? '✓' : '✗'}`);
      console.log(`    H1: ${seo.h1 ? '✓' : '✗'} ${seo.h1Count > 1 ? `⚠ ${seo.h1Count} h1 tags` : ''}`);
      console.log(`    OG tags: ${seo.ogTitle && seo.ogDescription && seo.ogImage ? '✓' : '✗'}`);
      console.log(`    Structured data: ${seo.structuredData > 0 ? '✓' : '✗'} (${seo.structuredData} blocks)`);
      console.log(`    Lang attribute: ${seo.lang ? '✓' : '✗'} ${seo.lang || ''}`);
      console.log(`    Robots: ${seo.robots || 'not set'}`);
      console.log(`    Images: ${seo.imagesTotal} total, ${seo.imagesMissingAlt} missing alt`);
      console.log(`    Links: ${seo.linksTotal} total, ${seo.linksNoText} missing text/label`);
    }

    // --- Accessibility (axe-core) ---
    if (label === 'desktop') {
      try {
        const axeResults = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
          .analyze();

        const violations = axeResults.violations;
        const critical = violations.filter(v => v.impact === 'critical');
        const serious = violations.filter(v => v.impact === 'serious');
        const moderate = violations.filter(v => v.impact === 'moderate');
        const minor = violations.filter(v => v.impact === 'minor');

        console.log(`\n    --- Accessibility (axe-core) ---`);
        console.log(`    Violations: ${violations.length} (${critical.length} critical, ${serious.length} serious, ${moderate.length} moderate, ${minor.length} minor)`);

        for (const v of [...critical, ...serious]) {
          console.log(`    ✗ [${v.impact.toUpperCase()}] ${v.id}: ${v.description}`);
          console.log(`      Affects ${v.nodes.length} element(s)`);
          if (v.nodes[0]) {
            console.log(`      Example: ${v.nodes[0].html.slice(0, 100)}`);
          }
        }
        for (const v of moderate) {
          console.log(`    ⚠ [MODERATE] ${v.id}: ${v.description}`);
          console.log(`      Affects ${v.nodes.length} element(s)`);
        }
      } catch (e) {
        console.log(`    Accessibility audit error: ${e.message}`);
      }
    }

    await context.close();
  }
}

await browser.close();
console.log('\n' + '='.repeat(80));
console.log('  Audit complete.');
console.log('='.repeat(80));
