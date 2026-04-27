import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';

const CHROME_PATH = '/home/developer/.cache/ms-playwright/chromium-1217/chrome-linux/chrome';

const pages = [
  { url: 'http://localhost:3610/', name: 'home' },
  { url: 'http://localhost:3610/music/', name: 'music' },
  { url: 'http://localhost:3610/apps/', name: 'apps' },
  { url: 'http://localhost:3610/journal/', name: 'journal' },
  { url: 'http://localhost:3610/labs/', name: 'labs' },
];

const chrome = await launch({
  chromePath: CHROME_PATH,
  chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
});

console.log(`Chrome running on port ${chrome.port}`);

const results = {};

for (const { url, name } of pages) {
  console.log(`\nAuditing ${name} (${url})...`);

  // Mobile audit
  const mobile = await lighthouse(url, {
    port: chrome.port,
    output: 'json',
    logLevel: 'error',
    maxWaitForLoad: 30000,
  });

  // Desktop audit
  const desktop = await lighthouse(url, {
    port: chrome.port,
    output: 'json',
    logLevel: 'error',
    maxWaitForLoad: 30000,
    formFactor: 'desktop',
    screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
    throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1, requestLatencyMs: 0, downloadThroughputKbps: 0, uploadThroughputKbps: 0 },
  });

  function extract(result) {
    const { categories, audits } = result.lhr;
    const scores = {};
    for (const [k, v] of Object.entries(categories)) {
      scores[v.title] = v.score !== null ? Math.round(v.score * 100) : null;
    }
    const metrics = {};
    for (const key of ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index', 'interactive']) {
      if (audits[key]) {
        metrics[audits[key].title] = { value: audits[key].displayValue, score: Math.round((audits[key].score || 0) * 100) };
      }
    }
    // Accessibility issues
    const a11yIssues = [];
    for (const [id, audit] of Object.entries(audits)) {
      if (audit.scoreDisplayMode === 'binary' && audit.score === 0 && categories['Accessibility']?.auditRefs?.some(r => r.id === id)) {
        a11yIssues.push({ id, title: audit.title, description: audit.description?.split('.')[0] });
      }
    }
    // SEO issues
    const seoIssues = [];
    for (const [id, audit] of Object.entries(audits)) {
      if (audit.scoreDisplayMode === 'binary' && audit.score === 0 && categories['SEO']?.auditRefs?.some(r => r.id === id)) {
        seoIssues.push({ id, title: audit.title });
      }
    }
    return { scores, metrics, a11yIssues, seoIssues };
  }

  results[name] = {
    mobile: extract(mobile),
    desktop: extract(desktop),
  };
}

await chrome.kill();

// Print summary
console.log('\n' + '='.repeat(80));
console.log('LIGHTHOUSE AUDIT RESULTS');
console.log('='.repeat(80));

for (const [name, { mobile, desktop }] of Object.entries(results)) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  ${name.toUpperCase()} (${pages.find(p => p.name === name).url})`);
  console.log(`${'─'.repeat(60)}`);

  console.log('\n  Category Scores:');
  console.log('  ' + ''.padEnd(20) + 'Mobile'.padEnd(10) + 'Desktop');
  for (const cat of Object.keys(mobile.scores)) {
    const m = mobile.scores[cat];
    const d = desktop.scores[cat];
    const mStr = m !== null ? `${m}` : 'N/A';
    const dStr = d !== null ? `${d}` : 'N/A';
    console.log(`  ${cat.padEnd(20)}${mStr.padEnd(10)}${dStr}`);
  }

  console.log('\n  Mobile Metrics:');
  for (const [title, { value, score }] of Object.entries(mobile.metrics)) {
    console.log(`    ${title}: ${value} (score: ${score})`);
  }

  console.log('\n  Desktop Metrics:');
  for (const [title, { value, score }] of Object.entries(desktop.metrics)) {
    console.log(`    ${title}: ${value} (score: ${score})`);
  }

  if (mobile.a11yIssues.length) {
    console.log('\n  Accessibility Issues (Mobile):');
    for (const i of mobile.a11yIssues) console.log(`    ✗ ${i.title}`);
  }
  if (mobile.seoIssues.length) {
    console.log('\n  SEO Issues (Mobile):');
    for (const i of mobile.seoIssues) console.log(`    ✗ ${i.title}`);
  }
}
