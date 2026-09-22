#!/usr/bin/env node
// Self-contained: serves build/ locally, drives it with Playwright, checks
// the docs/changelog/privacy/terms pages for overflow, h1, and page-specific behavior.
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { createBuildServer } from './serve-build.mjs';

const PORT = Number(process.env.E2E_PORT) || 4181;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const OUT_DIR = new URL('../e2e-out/', import.meta.url);

let failed = false;
function check(name, ok) {
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}`);
  if (!ok) failed = true;
}

const PAGES = [
  { path: '/docs', name: 'docs' },
  { path: '/changelog', name: 'changelog' },
  { path: '/privacy', name: 'privacy' },
  { path: '/terms', name: 'terms' },
  { path: '/fr/docs', name: null },
  { path: '/success?checkout_id=abc', name: null }
];
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 }
];

await mkdir(OUT_DIR, { recursive: true });

const server = createBuildServer();
await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));

const browser = await chromium.launch();
try {
  for (const viewport of VIEWPORTS) {
    for (const { path, name } of PAGES) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      try {
        await page.goto(BASE_URL + path, { waitUntil: 'networkidle' });
        await page.waitForTimeout(150);

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth
        );
        check(`${path} @ ${viewport.width}px: no horizontal overflow`, overflow);

        const h1Visible = await page.locator('h1').first().isVisible();
        check(`${path} @ ${viewport.width}px: h1 visible`, h1Visible);

        if (name) {
          await page.screenshot({
            path: new URL(`${name}-${viewport.width}.png`, OUT_DIR).pathname
          });
        }

        if (viewport.width === 390) {
          const brandVisible = await page.locator('.site-header .brand').first().isVisible();
          const toggleVisible = await page.locator('.theme-toggle').first().isVisible();
          const startVisible = await page.locator('.site-header .button').first().isVisible();
          check(`${path} @ 390px: header brand/toggle/start visible`, brandVisible && toggleVisible && startVisible);
        }
      } finally {
        await context.close();
      }
    }
  }

  // Docs-specific checks, run once at desktop viewport. Force dark color scheme so
  // the toggle deterministically flips to light (see e2e/theme.mjs).
  {
    const context = await browser.newContext({ viewport: VIEWPORTS[0], colorScheme: 'dark' });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.__copied = [];
      navigator.clipboard.writeText = (t) => {
        window.__copied.push(t);
        return Promise.resolve();
      };
    });
    await page.goto(BASE_URL + '/docs', { waitUntil: 'networkidle' });

    const navHrefs = await page.$$eval('.docs-nav a[href^="#"]', (els) => els.map((el) => el.getAttribute('href')));
    const allResolve = await page.evaluate(
      (hrefs) => hrefs.every((h) => document.getElementById(h.slice(1)) !== null),
      navHrefs
    );
    check('docs: every side-nav anchor resolves to an existing id', navHrefs.length > 0 && allResolve);

    const copyButtonIndex = await page.$$eval('.code-block', (blocks) =>
      blocks.findIndex((b) => b.textContent?.includes('localhost:14200'))
    );
    check('docs: found the generic MCP config code block', copyButtonIndex !== -1);
    await page.locator('.code-block').nth(copyButtonIndex).locator('.copy-button').click();
    const copied = await page.evaluate(() => window.__copied);
    check(
      'docs: copy button copies the generic MCP config',
      copied.some((c) => c.includes('localhost:14200'))
    );

    await page.click('.theme-toggle');
    await page.waitForTimeout(100);
    const themeAttr = await page.evaluate(() => document.documentElement.dataset.theme);
    check('docs: theme toggle switches to light', themeAttr === 'light');

    await context.close();
  }

  // 320px overflow check, home and docs only.
  for (const path of ['/', '/docs']) {
    const context = await browser.newContext({ viewport: { width: 320, height: 568 } });
    const page = await context.newPage();
    try {
      await page.goto(BASE_URL + path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(150);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      );
      check(`${path} @ 320px: no horizontal overflow`, overflow);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

process.exit(failed ? 1 : 0);
