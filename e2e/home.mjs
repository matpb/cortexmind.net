#!/usr/bin/env node
// Usage: node e2e/home.mjs — serves build/ on 4180, drives the home page with Playwright.
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
import { createBuildServer } from './serve-build.mjs';
import updateInfo from '../update-v2.json' with { type: 'json' };

const PORT = 4180;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const MONTHLY_ID = '1dc6a2ec-ca63-4db9-b2c8-2dfa4c8de64b';
const YEARLY_ID = '9adbb9d6-f0f0-4382-92b8-80ace8795144';
const OUT_DIR = new URL('../e2e-out/', import.meta.url).pathname;

let failed = false;
function check(name, ok) {
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}`);
  if (!ok) failed = true;
}

// Relative luminance (WCAG) from a "rgb(r, g, b)" / "rgba(r, g, b, a)" computed color string.
function luminance(rgbString) {
  const [r, g, b] = rgbString.match(/[\d.]+/g).map(Number).map((v) => v / 255);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

mkdirSync(OUT_DIR, { recursive: true });

const server = createBuildServer();
await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));

const browser = await chromium.launch();
try {
  for (const viewport of [{ w: 1440, h: 900, name: '1440' }, { w: 390, h: 844, name: '390' }]) {
    const context = await browser.newContext({ viewport: { width: viewport.w, height: viewport.h }, colorScheme: 'dark' });
    const page = await context.newPage();
    await page.goto(BASE_URL + '/', { waitUntil: 'networkidle' });
    // Step-scroll to trigger native lazy-loading on every image, then wait for decode.
    const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < scrollHeight; y += viewport.h) {
      await page.evaluate((pos) => window.scrollTo(0, pos), y);
      await page.waitForTimeout(80);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll('img')).every((img) => img.complete && img.naturalWidth > 0)
    );

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    check(`${viewport.name}: no horizontal overflow (dark)`, overflow);

    const h1Visible = await page.locator('h1').first().isVisible();
    check(`${viewport.name}: h1 is visible`, h1Visible);

    const images = await page.locator('img').all();
    let allLoaded = images.length > 0;
    for (const img of images) {
      const naturalWidth = await img.evaluate((el) => el.naturalWidth);
      if (!(naturalWidth > 0)) allLoaded = false;
    }
    check(`${viewport.name}: every img has naturalWidth > 0 (${images.length} images)`, allLoaded);

    const monthlyProduct = await page.locator('[data-product]').nth(0).getAttribute('data-product');
    const yearlyProduct = await page.locator('[data-product]').nth(1).getAttribute('data-product');
    check(`${viewport.name}: monthly button carries data-product`, monthlyProduct === MONTHLY_ID);
    check(`${viewport.name}: yearly button carries data-product`, yearlyProduct === YEARLY_ID);

    let checkoutCalls = 0;
    let checkoutBody = null;
    await page.route('**/api/create-polar-checkout', async (route) => {
      checkoutCalls += 1;
      checkoutBody = route.request().postData();
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ url: '/success?checkout_id=test' }) });
    });
    await page.locator(`[data-product="${YEARLY_ID}"]`).click();
    await page.waitForURL(/\/success\?checkout_id=test$/);
    check(`${viewport.name}: exactly one POST to create-polar-checkout`, checkoutCalls === 1);
    check(`${viewport.name}: checkout body has correct product_id`, checkoutBody === JSON.stringify({ product_id: YEARLY_ID }));
    check(`${viewport.name}: navigated to /success?checkout_id=test`, /\/success\?checkout_id=test$/.test(new URL(page.url()).pathname + new URL(page.url()).search));

    await page.goto(BASE_URL + '/', { waitUntil: 'networkidle' });
    const downloadLinks = await page.locator('a[href*="/releases/download/v"]').all();
    let versionOk = downloadLinks.length >= 3;
    for (const link of downloadLinks) {
      const href = await link.getAttribute('href');
      if (!href || !href.includes(`/releases/download/v${updateInfo.version}`)) versionOk = false;
    }
    check(`${viewport.name}: three download links carry version ${updateInfo.version}`, versionOk);

    const platformSvgCount = await page.locator('.platforms a.platform svg').count();
    check(`${viewport.name}: three platform icons render as svg`, platformSvgCount === 3);

    const firstDetails = page.locator('details').first();
    await firstDetails.locator('summary').click();
    const isOpen = await firstDetails.evaluate((el) => el.open);
    check(`${viewport.name}: FAQ first details opens on click`, isOpen);

    const darkBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await page.screenshot({ path: `${OUT_DIR}home-${viewport.name}-dark.png`, fullPage: true });

    await page.emulateMedia({ colorScheme: 'light' });
    await page.evaluate(() => { document.documentElement.setAttribute('data-theme', 'light'); });
    await page.waitForTimeout(100);
    const overflowLight = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    check(`${viewport.name}: no horizontal overflow (light)`, overflowLight);
    const lightBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    check(`${viewport.name}: dark and light screenshots render visibly different backgrounds`, darkBg !== lightBg);

    const heroH1Color = await page.evaluate(() => getComputedStyle(document.querySelector('.hero h1')).color);
    check(`${viewport.name}: hero h1 readable in light theme (luminance > 0.7)`, luminance(heroH1Color) > 0.7);
    if (viewport.name === '1440') {
      const headerNavColor = await page.evaluate(() => getComputedStyle(document.querySelector('.site-header.over-hero nav a:not(.button)')).color);
      check(`${viewport.name}: header nav over hero readable in light theme (luminance > 0.4)`, luminance(headerNavColor) > 0.4);
    }

    if (viewport.name === '390') {
      const frame = page.locator('.dashboard-frame');
      const scrolls = await frame.evaluate((el) => el.scrollWidth > el.clientWidth);
      check('390: dashboard frame scrolls horizontally on phone', scrolls);
      const dashboardLink = await page.locator('a.dashboard-scroll[href="/media/dashboard-1440.png"]').count();
      check('390: dashboard image links to full-size PNG', dashboardLink === 1);
    }

    await page.screenshot({ path: `${OUT_DIR}home-${viewport.name}-light.png`, fullPage: true });

    await context.close();
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

process.exit(failed ? 1 : 0);
