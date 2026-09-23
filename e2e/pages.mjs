#!/usr/bin/env node
// Self-contained: serves build/ locally, drives it with Playwright, checks
// the docs/changelog/privacy/terms pages for overflow, h1, and page-specific behavior.
import { mkdir, readFile, stat } from 'node:fs/promises';
import { chromium } from 'playwright';
import { createBuildServer } from './serve-build.mjs';
import updateInfo from '../update-v2.json' with { type: 'json' };

const PORT = Number(process.env.E2E_PORT) || 4181;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const OUT_DIR = new URL('../e2e-out/', import.meta.url);
const BUILD_DOWNLOADS_PATH = new URL('../build/downloads.json', import.meta.url);

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
    check('docs: nav first link targets #ai-install', navHrefs[0] === '#ai-install');

    const aiInstallExists = await page.locator('#ai-install').count();
    check('docs: #ai-install section exists', aiInstallExists > 0);
    const aiBeforeInstall = await page.evaluate(() => {
      const ai = document.getElementById('ai-install');
      const install = document.getElementById('install');
      if (!ai || !install) return false;
      return !!(ai.compareDocumentPosition(install) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    check('docs: #ai-install comes before #install in DOM order', aiBeforeInstall);

    const promptCards = page.locator('#ai-install .prompt-card');
    check('docs: exactly one .prompt-card', (await promptCards.count()) === 1);

    const modelNote = await page.locator('.model-note').first().textContent();
    check('docs: model note is shown above the prompt card', !!modelNote && modelNote.includes('Sonnet 5'));

    const promptButtons = page.locator('#ai-install .prompt-card .button.small');
    await promptButtons.nth(0).click();
    const copiedPrompts = await page.evaluate(() => window.__copied);
    check(
      'docs: prompt button copies text with downloads.json, Part B and memory_search',
      copiedPrompts.some(
        (c) => c.includes('downloads.json') && c.includes('Part B') && c.includes('memory_search')
      )
    );
    check(
      'docs: English prompt contains "Part C" and not "Partie C"',
      copiedPrompts.some((c) => c.includes('Part C')) && !copiedPrompts.some((c) => c.includes('Partie C'))
    );

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

  // /fr/docs: French prompt and model note.
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
    await page.goto(BASE_URL + '/fr/docs', { waitUntil: 'networkidle' });

    const frModelNote = await page.locator('.model-note').first().textContent();
    check('fr/docs: model note is shown above the prompt card', !!frModelNote && frModelNote.includes('Sonnet 5'));

    await page.locator('#ai-install .prompt-card .button.small').nth(0).click();
    const frCopiedPrompts = await page.evaluate(() => window.__copied);
    check(
      'fr/docs: French prompt contains "Partie C" and not "Part C"',
      frCopiedPrompts.some((c) => c.includes('Partie C')) && !frCopiedPrompts.some((c) => c.includes('Part C'))
    );

    await context.close();
  }

  // Success page AI-install section: prompt card, dark mode, both viewports.
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({ viewport, colorScheme: 'dark' });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.__copied = [];
      navigator.clipboard.writeText = (t) => {
        window.__copied.push(t);
        return Promise.resolve();
      };
    });
    await page.route('**/api/get-license-key', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          key: 'CMND-TEST-1234',
          display_key: 'CMND-…1234',
          portal_url: 'https://polar.sh/matpb/portal/request'
        })
      })
    );
    await page.goto(BASE_URL + '/success?checkout_id=abc', { waitUntil: 'networkidle' });
    await page.waitForTimeout(150);

    const keyVisible = await page.locator('.key-row code').filter({ hasText: 'CMND-TEST-1234' }).count();
    check(`success @ ${viewport.width}px: license key shown`, keyVisible > 0);

    const aiHeading = await page.locator('h2', { hasText: 'Next: let your AI install it' }).count();
    check(`success @ ${viewport.width}px: AI install heading exists`, aiHeading === 1);

    const successPromptCards = page.locator('.prompt-card');
    check(`success @ ${viewport.width}px: exactly one .prompt-card`, (await successPromptCards.count()) === 1);

    await page.locator('.prompt-card .button.small').click();
    const successCopied = await page.evaluate(() => window.__copied);
    check(
      `success @ ${viewport.width}px: copy button copies prompt with downloads.json and Part C`,
      successCopied.some((c) => c.includes('downloads.json') && c.includes('Part C'))
    );

    const manualLinkHref = await page
      .locator('a', { hasText: 'Follow the manual steps' })
      .getAttribute('href');
    check(`success @ ${viewport.width}px: manual steps link points to /docs#manual`, !!manualLinkHref && manualLinkHref.endsWith('/docs#manual'));

    const successModelNote = await page.locator('.model-note').first().textContent();
    check(`success @ ${viewport.width}px: model note is shown above the prompt card`, !!successModelNote && successModelNote.includes('Sonnet 5'));

    const successOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    check(`success @ ${viewport.width}px: no horizontal overflow`, successOverflow);

    await context.close();
  }

  // /success and /fr/success with ?checkout_id=preview: locale renders the right copy.
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

    await page.goto(BASE_URL + '/success?checkout_id=preview', { waitUntil: 'networkidle' });
    const enTitle = await page.locator('h1').first().textContent();
    check('success (preview, en): renders the English title', enTitle === 'Your agents are about to remember.');
    await page.locator('.prompt-card .button.small').click();
    const enPreviewCopied = await page.evaluate(() => window.__copied);
    check(
      'success (preview, en): prompt is English (Part C, not Partie C)',
      enPreviewCopied.some((c) => c.includes('Part C')) && !enPreviewCopied.some((c) => c.includes('Partie C'))
    );

    await page.evaluate(() => { window.__copied = []; });
    await page.goto(BASE_URL + '/fr/success?checkout_id=preview', { waitUntil: 'networkidle' });
    const frTitle = await page.locator('h1').first().textContent();
    check('success (preview, fr): renders the French title', frTitle === 'Vos agents sont sur le point de se souvenir.');
    const frModelNote = await page.locator('.model-note').first().textContent();
    check('success (preview, fr): model note is shown above the prompt card', !!frModelNote && frModelNote.includes('Sonnet 5'));
    await page.locator('.prompt-card .button.small').click();
    const frPreviewCopied = await page.evaluate(() => window.__copied);
    check(
      'success (preview, fr): prompt is French (Partie C, not Part C)',
      frPreviewCopied.some((c) => c.includes('Partie C')) && !frPreviewCopied.some((c) => c.includes('Part C'))
    );

    await context.close();
  }

  // downloads.json and llms.txt: static endpoints, checked directly.
  try {
    const raw = await readFile(BUILD_DOWNLOADS_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    check('build/downloads.json parses as JSON', true);
    check(
      `build/downloads.json version equals update-v2.json (${updateInfo.version})`,
      parsed.version === updateInfo.version
    );
  } catch {
    check('build/downloads.json parses as JSON', false);
  }

  {
    const res = await fetch(BASE_URL + '/llms.txt');
    const text = await res.text();
    check('/llms.txt returns 200 text/plain', res.ok);
    check(`/llms.txt contains version ${updateInfo.version}`, text.includes(updateInfo.version));
    check('/llms.txt mentions downloads.json', text.includes('downloads.json'));
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

  // Open Graph / Twitter card meta, home and docs, both locales.
  const OG_PAGES = [
    { path: '/', imageSuffix: '/og.jpg' },
    { path: '/fr', imageSuffix: '/og-fr.jpg' },
    { path: '/docs', imageSuffix: '/og.jpg' },
    { path: '/fr/docs', imageSuffix: '/og-fr.jpg' }
  ];
  let homeTitle = null;
  let docsTitle = null;
  for (const { path, imageSuffix } of OG_PAGES) {
    const context = await browser.newContext({ viewport: VIEWPORTS[0] });
    const page = await context.newPage();
    try {
      await page.goto(BASE_URL + path, { waitUntil: 'networkidle' });

      const getContent = (selector) => page.locator(selector).getAttribute('content');
      const ogTitle = await getContent('meta[property="og:title"]');
      const ogDescription = await getContent('meta[property="og:description"]');
      const ogImage = await getContent('meta[property="og:image"]');
      const ogUrl = await getContent('meta[property="og:url"]');
      const twitterCard = await getContent('meta[name="twitter:card"]');

      check(`${path}: og:title present`, !!ogTitle);
      check(`${path}: og:description present`, !!ogDescription);
      check(`${path}: og:image present`, !!ogImage);
      check(`${path}: og:url present`, !!ogUrl);
      check(`${path}: twitter:card present`, !!twitterCard);
      check(`${path}: og:image ends with ${imageSuffix}`, !!ogImage && ogImage.endsWith(imageSuffix));

      if (path === '/') homeTitle = await page.title();
      if (path === '/docs') docsTitle = await page.title();
    } finally {
      await context.close();
    }
  }
  check('/docs <title> differs from / <title>', !!homeTitle && !!docsTitle && homeTitle !== docsTitle);

  for (const name of ['og.jpg', 'og-fr.jpg']) {
    try {
      const { size } = await stat(new URL(`../build/${name}`, import.meta.url));
      check(`build/${name} exists and is > 30 KB`, size > 30000);
    } catch {
      check(`build/${name} exists and is > 30 KB`, false);
    }
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

process.exit(failed ? 1 : 0);
