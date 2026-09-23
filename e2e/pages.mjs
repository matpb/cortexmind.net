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
  { path: '/success?checkout_id=abc', name: null },
  { path: '/connect', name: 'connect' },
  { path: '/fr/connect', name: null }
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
          const gearVisible = await page.locator('.site-header .gear-toggle').first().isVisible();
          const startVisible = await page.locator('.site-header .button').first().isVisible();
          check(`${path} @ 390px: header brand/gear/start visible`, brandVisible && gearVisible && startVisible);
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

    await page.locator('button.gear-toggle').click();
    await page.locator('#site-prefs').waitFor({ state: 'visible' });
    await page.click('.theme-toggle');
    await page.waitForTimeout(100);
    const themeAttr = await page.evaluate(() => document.documentElement.dataset.theme);
    check('docs: theme toggle switches to light', themeAttr === 'light');

    const docsConnectLink = await page.locator('.docs-nav a[href="/connect"]').count();
    check('docs: side nav contains a link to /connect', docsConnectLink > 0);

    const calloutLink = await page.locator('#connect a.text-link[href="/connect"]').count();
    check('docs: connect section callout links to /connect', calloutLink > 0);

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

    const frDocsConnectLink = await page.locator('.docs-nav a[href="/fr/connect"]').count();
    check('fr/docs: side nav contains a link to /fr/connect', frDocsConnectLink > 0);

    await page.locator('#ai-install .prompt-card .button.small').nth(0).click();
    const frCopiedPrompts = await page.evaluate(() => window.__copied);
    check(
      'fr/docs: French prompt contains "Partie C" and not "Part C"',
      frCopiedPrompts.some((c) => c.includes('Partie C')) && !frCopiedPrompts.some((c) => c.includes('Part C'))
    );

    await context.close();
  }

  // /connect: headings, anchors, and the French copy check.
  {
    const context = await browser.newContext({ viewport: VIEWPORTS[0] });
    const page = await context.newPage();
    await page.goto(BASE_URL + '/connect', { waitUntil: 'networkidle' });

    const chatgptHeading = await page.locator('h2', { hasText: 'ChatGPT' }).count();
    check('connect: a heading mentions ChatGPT', chatgptHeading > 0);
    const claudeHeading = await page.locator('h2', { hasText: 'Claude' }).count();
    check('connect: a heading mentions Claude', claudeHeading > 0);
    check('connect: #chatgpt anchor exists', (await page.locator('#chatgpt').count()) > 0);
    check('connect: #claude anchor exists', (await page.locator('#claude').count()) > 0);

    await page.goto(BASE_URL + '/fr/connect', { waitUntil: 'networkidle' });
    const frBody = await page.locator('body').textContent();
    check('fr/connect: contains "Avant de commencer"', !!frBody && frBody.includes('Avant de commencer'));

    await context.close();
  }

  // Header nav: zero links to /connect or /changelog (moved to footer only), localized per locale.
  {
    const context = await browser.newContext({ viewport: VIEWPORTS[0] });
    const page = await context.newPage();

    await page.goto(BASE_URL + '/', { waitUntil: 'networkidle' });
    const enHeaderConnectLinks = await page.locator('.site-header nav a[href="/connect"]').count();
    check('/: header nav has zero links to /connect', enHeaderConnectLinks === 0);
    const enHeaderChangelogLinks = await page.locator('.site-header nav a[href="/changelog"]').count();
    check('/: header nav has zero links to /changelog', enHeaderChangelogLinks === 0);
    const enFooterConnectLinks = await page.locator('.site-footer a[href="/connect"]').count();
    check('/: footer has exactly one link to /connect', enFooterConnectLinks === 1);
    const enFooterChangelogLinks = await page.locator('.site-footer a[href="/changelog"]').count();
    check('/: footer has exactly one link to /changelog', enFooterChangelogLinks === 1);
    const enHomeConnectLinks = await page.locator('a[href="/connect"]').count();
    check('/: home page contains a link to /connect', enHomeConnectLinks > 0);

    await page.goto(BASE_URL + '/fr', { waitUntil: 'networkidle' });
    const frHeaderConnectLinks = await page.locator('.site-header nav a[href="/fr/connect"]').count();
    check('/fr: header nav has zero links to /fr/connect', frHeaderConnectLinks === 0);
    const frHeaderChangelogLinks = await page.locator('.site-header nav a[href="/fr/changelog"]').count();
    check('/fr: header nav has zero links to /fr/changelog', frHeaderChangelogLinks === 0);
    const frFooterConnectLinks = await page.locator('.site-footer a[href="/fr/connect"]').count();
    check('/fr: footer has exactly one link to /fr/connect', frFooterConnectLinks === 1);
    const frFooterChangelogLinks = await page.locator('.site-footer a[href="/fr/changelog"]').count();
    check('/fr: footer has exactly one link to /fr/changelog', frFooterChangelogLinks === 1);

    await page.goto(BASE_URL + '/', { waitUntil: 'networkidle' });
    await page.locator('button.gear-toggle').click();
    await page.locator('#site-prefs').waitFor({ state: 'visible' });
    check('/: clicking gear-toggle shows #site-prefs', await page.locator('#site-prefs').isVisible());
    await page.keyboard.press('Escape');
    await page.locator('#site-prefs').waitFor({ state: 'hidden' });
    check('/: pressing Escape hides #site-prefs', (await page.locator('#site-prefs').count()) === 0);

    await context.close();
  }

  // /connect at 390px: no horizontal overflow, in both dark and light theme.
  {
    const context = await browser.newContext({ viewport: VIEWPORTS[1], colorScheme: 'dark' });
    const page = await context.newPage();
    await page.goto(BASE_URL + '/connect', { waitUntil: 'networkidle' });
    await page.waitForTimeout(150);

    const darkOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    check('/connect @ 390px dark: no horizontal overflow', darkOverflow);

    await page.locator('button.gear-toggle').click();
    await page.locator('#site-prefs').waitFor({ state: 'visible' });
    const popoverOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    check('/connect @ 390px dark: popover open causes no horizontal overflow', popoverOverflow);

    await page.click('.theme-toggle');
    await page.waitForTimeout(100);
    const themeAttr = await page.evaluate(() => document.documentElement.dataset.theme);
    check('/connect @ 390px: theme toggle switches to light', themeAttr === 'light');

    await page.keyboard.press('Escape');
    await page.locator('#site-prefs').waitFor({ state: 'hidden' });

    const lightOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    check('/connect @ 390px light: no horizontal overflow', lightOverflow);

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

  // Phone side gutters: a scoped `padding:` shorthand once wiped .wrap's gutters on /connect and /success.
  for (const path of ['/', '/docs', '/connect', '/changelog', '/privacy', '/terms', '/success?checkout_id=preview']) {
    for (const url of [path, path === '/' ? '/fr' : '/fr' + path]) {
      const context = await browser.newContext({ viewport: { width: 390, height: 900 } });
      const page = await context.newPage();
      try {
        await page.goto(BASE_URL + url, { waitUntil: 'networkidle' });
        const offenders = await page.evaluate(() =>
          [...document.querySelectorAll('main h1, main h2, main h3, main p, main li, main details, main pre')]
            .filter((e) => {
              const r = e.getBoundingClientRect();
              return r.width > 0 && r.height > 0 && (r.left < 16 || window.innerWidth - r.right < 16);
            })
            .map((e) => e.tagName + ' ' + e.textContent.trim().slice(0, 30))
        );
        check(`${url}: every text block keeps >= 16px side gutters at 390px${offenders.length ? ' (' + offenders.slice(0, 2).join(' | ') + ')' : ''}`, offenders.length === 0);
      } finally {
        await context.close();
      }
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
