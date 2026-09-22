#!/usr/bin/env node
// Self-contained: serves build/ locally on port 4179, drives it with Playwright,
// checks default theme, toggle + persistence, and locale switching.
import { chromium } from 'playwright';
import { createBuildServer } from './serve-build.mjs';

const PORT = 4179;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const DARK_BG = 'rgb(18, 22, 27)';
const LIGHT_BG = 'rgb(251, 247, 240)';

let failed = false;
function check(name, ok) {
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}`);
  if (!ok) failed = true;
}

const server = createBuildServer();
await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));

const browser = await chromium.launch();
try {
  // System scheme set to dark (not light) so the `@media (prefers-color-scheme: light)`
  // override never fires — isolates the app's own default, which is dark.
  const context = await browser.newContext({ colorScheme: 'dark' });
  const page = await context.newPage();
  await page.goto(BASE_URL + '/');

  const initialTheme = await page.evaluate(() => document.documentElement.dataset.theme);
  const initialBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  check('default theme is dark (no data-theme attr, dark --bg)', initialTheme === undefined && initialBg === DARK_BG);

  await page.click('.theme-toggle');
  await page.waitForTimeout(100);
  const toggledTheme = await page.evaluate(() => document.documentElement.dataset.theme);
  const toggledBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  check('toggle switches to light theme', toggledTheme === 'light' && toggledBg === LIGHT_BG);

  await page.reload();
  const persistedTheme = await page.evaluate(() => document.documentElement.dataset.theme);
  const persistedBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  check('theme persists across reload (localStorage)', persistedTheme === 'light' && persistedBg === LIGHT_BG);

  await page.selectOption('#locale-select', 'fr');
  await page.waitForURL(/\/fr\/?$/);
  check('locale select navigates to /fr', /\/fr\/?$/.test(new URL(page.url()).pathname));

  await page.selectOption('#locale-select', 'en');
  await page.waitForURL((url) => !/\/fr\/?$/.test(url.pathname));
  check('locale select back to English returns to /', new URL(page.url()).pathname === '/');
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

process.exit(failed ? 1 : 0);
