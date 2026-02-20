const { chromium } = require('playwright');
(async()=>{
 const base='http://localhost:3610';
 const { execSync } = require('node:child_process');
 let pass='';
 try { pass = execSync('pnpm exec dotenvx get ADMIN_PASSCODE -f config/env/.env',{stdio:['ignore','pipe','ignore']}).toString().trim(); } catch {}
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext();
 const page=await context.newPage();
 page.on('console', msg => {
   if (msg.type() === 'error' || msg.type() === 'warning') {
     const l=msg.location();
     console.log(`[console:${msg.type()}] ${msg.text()} ${l?.url?`@ ${l.url}:${l.lineNumber}:${l.columnNumber}`:''}`);
   }
 });
 page.on('pageerror', err => console.log('[pageerror]', err.message));
 await page.goto(base + '/admin/', { waitUntil: 'domcontentloaded' });
 if (await page.locator('input[name="password"]').count()) {
   await page.fill('input[name="password"]', pass);
   await page.click('button[type="submit"]');
   for (let i=0; i<20; i++) {
     const cookies = await context.cookies(base + '/admin/');
     if (cookies.some((c) => c.name === 'admin_session')) break;
     await page.waitForTimeout(150);
   }
 }
 const res = await page.goto(base + '/admin/crew/', { waitUntil: 'domcontentloaded' });
 console.log('initial_status', res && res.status());
 console.log('initial_url', page.url());
 console.log('initial_title', await page.title());
 console.log('initial_has_crew', await page.locator('h2', { hasText: 'The Crew' }).count());
 await page.waitForTimeout(6000);
 console.log('after_url', page.url());
 console.log('after_title', await page.title());
 console.log('after_has_crew', await page.locator('h2', { hasText: 'The Crew' }).count());
 await browser.close();
})();
