#!/usr/bin/env node
// Usage: node e2e/home.mjs. Serves build/ on 4180 and drives the home page with Playwright.
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
import { createBuildServer } from './serve-build.mjs';
import updateInfo from '../update-v2.json' with { type: 'json' };

const PORT = 4180;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const MONTHLY_ID = '1dc6a2ec-ca63-4db9-b2c8-2dfa4c8de64b';
const YEARLY_ID = '9adbb9d6-f0f0-4382-92b8-80ace8795144';
const OUT_DIR = new URL('../e2e-out/', import.meta.url).pathname;
const DASHBOARD_IMAGES = {
  upload: '/media/dashboard-upload-v5.png',
  files: '/media/dashboard-files-v5.png',
  search: '/media/dashboard-search-v5.png'
};
const DASHBOARD_TEXT = {
  upload: 'Drop files onto the dashboard, or use the Upload files button, and your AI can search what is inside them. PDF, Word, PowerPoint, spreadsheets, EPUB, email, web pages, Markdown and plain text, up to 50 MB each.',
  files: 'You decide how much each file matters, and you can change it at any time. See each file and how it was split, and archive or restore it in one click.',
  search: 'Search the way your agents do, by keyword and by meaning. Results name the file and the part they come from, and you can sort them by relevance, date or importance.'
};
const DASHBOARD_PRIVATE = 'A private dashboard on your machine. Only your own computer can open it, and nothing on it is sent anywhere.';
const FILM_FILE = 'cortexmind-film-v1.mp4';
const FILM_POSTER = '/media/cortexmind-film-poster-v1.jpg';
const FILM_LABEL_EN = 'Watch the film (1:39)';
const FILM_LABEL_FR = 'Voir le film (1 min 39, en anglais)';

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

// Tab, panel and paragraph state of the home page dashboard, as the browser renders it.
async function dashboardState(page) {
  return page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('.dashboard [role="tab"]'));
    const panels = Array.from(document.querySelectorAll('.dashboard [role="tabpanel"]'));
    const shown = panels.filter((p) => p.getClientRects().length > 0);
    const paragraphs = document.querySelectorAll('.dashboard .dashboard-text p');
    return {
      tabs: tabs.map((t) => [t.id, t.textContent.trim(), t.getAttribute('aria-selected'), t.getAttribute('tabindex')]),
      panels: panels.map((p) => ({
        hidden: p.hidden,
        href: p.getAttribute('href'),
        loading: p.querySelector('img').getAttribute('loading')
      })),
      shownSrc: shown.map((p) => p.querySelector('img').getAttribute('src')),
      shownLoaded: shown.map((p) => p.querySelector('img').naturalWidth > 0),
      firstText: paragraphs[0]?.textContent.trim() ?? null,
      secondText: paragraphs[1]?.textContent.trim() ?? null,
      frameHeight: document.querySelector('.dashboard-frame').getBoundingClientRect().height,
      focusedId: document.activeElement?.id ?? null
    };
  });
}

// Waits until every dashboard panel that is shown has decoded its image.
async function waitForShownDashboardImages(page) {
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll('.dashboard [role="tabpanel"]'))
      .filter((p) => p.getClientRects().length > 0)
      .every((p) => p.querySelector('img').naturalWidth > 0)
  );
}

// Checks the merged dashboard section: tabs, panels, text, keyboard use and the phone layout.
async function checkDashboard(page, name) {
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  await waitForShownDashboardImages(page);
  let s = await dashboardState(page);

  check(`${name}: dashboard has three tabs labelled Upload, Files, Search`, same(s.tabs.map((t) => t[1]), ['Upload', 'Files', 'Search']));
  check(`${name}: on load only the Upload tab is selected and in the tab order`, same(s.tabs, [
    ['dash-tab-upload', 'Upload', 'true', '0'],
    ['dash-tab-files', 'Files', 'false', '-1'],
    ['dash-tab-search', 'Search', 'false', '-1']
  ]));
  check(`${name}: all three panels are in the DOM and only the Upload panel is shown`, same(s.panels.map((p) => p.hidden), [false, true, true]));
  check(`${name}: active panel image is eager, the other two are lazy`, same(s.panels.map((p) => p.loading), ['eager', 'lazy', 'lazy']));
  check(`${name}: every panel links to its full-size PNG`, same(s.panels.map((p) => p.href), [DASHBOARD_IMAGES.upload, DASHBOARD_IMAGES.files, DASHBOARD_IMAGES.search]));
  check(`${name}: on load exactly one panel is visible and it is the upload image`, same(s.shownSrc, [DASHBOARD_IMAGES.upload]) && s.shownLoaded.every(Boolean));
  check(`${name}: on load the first paragraph is the upload text and the second is the private note`, s.firstText === DASHBOARD_TEXT.upload && s.secondText === DASHBOARD_PRIVATE);

  const frameHeights = [s.frameHeight];
  if (name === '390') {
    const scrolls = await page.locator('.dashboard-frame').evaluate((el) => el.scrollWidth > el.clientWidth);
    check('390: dashboard frame scrolls horizontally on phone', scrolls);
  }

  await page.getByRole('tab', { name: 'Files', exact: true }).click();
  await waitForShownDashboardImages(page);
  s = await dashboardState(page);
  check(`${name}: clicking Files shows only dashboard-files-v5.png and hides the other two panels`, same(s.shownSrc, [DASHBOARD_IMAGES.files]) && same(s.panels.map((p) => p.hidden), [true, false, true]) && s.shownLoaded.every(Boolean));
  check(`${name}: clicking Files changes the first paragraph to the files text`, s.firstText === DASHBOARD_TEXT.files && s.secondText === DASHBOARD_PRIVATE);
  frameHeights.push(s.frameHeight);

  await page.getByRole('tab', { name: 'Files', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await waitForShownDashboardImages(page);
  s = await dashboardState(page);
  check(`${name}: ArrowRight from Files selects Search and focuses it`, same(s.tabs.map((t) => [t[0], t[2], t[3]]), [
    ['dash-tab-upload', 'false', '-1'],
    ['dash-tab-files', 'false', '-1'],
    ['dash-tab-search', 'true', '0']
  ]) && s.focusedId === 'dash-tab-search');
  check(`${name}: Search shows only dashboard-search-v5.png with the search text`, same(s.shownSrc, [DASHBOARD_IMAGES.search]) && s.shownLoaded.every(Boolean) && s.firstText === DASHBOARD_TEXT.search);
  frameHeights.push(s.frameHeight);

  await page.keyboard.press('Home');
  s = await dashboardState(page);
  check(`${name}: Home selects the first tab, Upload`, s.focusedId === 'dash-tab-upload' && s.tabs[0][2] === 'true');
  await page.keyboard.press('End');
  s = await dashboardState(page);
  check(`${name}: End selects the last tab, Search`, s.focusedId === 'dash-tab-search' && s.tabs[2][2] === 'true');
  await page.keyboard.press('ArrowLeft');
  s = await dashboardState(page);
  check(`${name}: ArrowLeft from Search selects Files and focuses it`, s.focusedId === 'dash-tab-files' && s.tabs[1][2] === 'true');
  check(`${name}: the dashboard frame keeps the same height on every tab`, frameHeights.length === 3 && frameHeights.every((h) => h === frameHeights[0]));

  const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  check(`${name}: no horizontal overflow after switching dashboard tabs`, noOverflow);
}

async function noOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
}

// Checks the hero film button, the modal film player, every close path and the player layout.
async function checkFilm(browser, viewport) {
  const name = viewport.name;
  const context = await browser.newContext({ viewport: { width: viewport.w, height: viewport.h }, colorScheme: 'dark' });
  const page = await context.newPage();
  page.setDefaultTimeout(5000);
  const filmRequests = [];
  page.on('request', (req) => {
    if (req.url().includes(FILM_FILE)) filmRequests.push(req.url());
  });
  await page.goto(BASE_URL + '/', { waitUntil: 'networkidle' });

  const button = page.locator('.hero .hero-film-button');
  const dialog = page.locator('.film-dialog');
  const video = dialog.locator('video');
  const closeButton = dialog.locator('.film-close');
  const dialogOpen = () => dialog.evaluate((el) => el.open);
  // A wait timeout leaves the state unchanged, so the check that follows reports the failure.
  const waitForOpen = (open) =>
    page.waitForFunction((want) => document.querySelector('.film-dialog').open === want, open, { timeout: 5000 }).catch(() => {});
  // The close event that pauses the film is queued after open turns false, so wait for the paused state.
  const waitForPaused = () =>
    page.waitForFunction(() => document.querySelector('.film-dialog video').paused === true, null, { timeout: 5000 }).catch(() => {});

  check(`${name}: EN hero film button reads "${FILM_LABEL_EN}"`, (await button.textContent()).trim() === FILM_LABEL_EN);
  check(`${name}: hero film button declares aria-haspopup="dialog"`, (await button.getAttribute('aria-haspopup')) === 'dialog');
  check(`${name}: on load the film file was not requested`, filmRequests.length === 0);
  check(`${name}: on load the film dialog is not open`, (await dialogOpen()) === false);
  check(`${name}: dialog closed: no horizontal overflow`, await noOverflow(page));

  await button.click();
  await waitForOpen(true);
  check(`${name}: clicking the film button opens the dialog`, (await dialogOpen()) === true);
  check(`${name}: film dialog is labelled "CortexMind film"`, (await dialog.getAttribute('aria-label')) === 'CortexMind film');
  check(`${name}: film video has controls and the film poster`, (await video.evaluate((v) => v.controls)) === true && (await video.getAttribute('poster')) === FILM_POSTER);
  check(`${name}: close button is labelled "Close the film"`, (await closeButton.getAttribute('aria-label')) === 'Close the film');

  const layout = await page.evaluate(() => {
    const dialogEl = document.querySelector('.film-dialog');
    const videoBox = dialogEl.querySelector('video').getBoundingClientRect();
    const closeBox = dialogEl.querySelector('.film-close').getBoundingClientRect();
    return { videoWidth: videoBox.width, videoHeight: videoBox.height, closeWidth: closeBox.width, closeHeight: closeBox.height, innerWidth: window.innerWidth, innerHeight: window.innerHeight };
  });
  check(`${name}: film video rendered width is at most the viewport width`, layout.videoWidth <= layout.innerWidth);
  check(`${name}: film video is at most 86vh tall`, layout.videoHeight <= 0.86 * layout.innerHeight);
  check(`${name}: film video keeps 16:10`, Math.abs(layout.videoWidth / layout.videoHeight - 1.6) < 0.01);
  check(`${name}: close button is at least 40x40 px`, layout.closeWidth >= 40 && layout.closeHeight >= 40);
  if (name === '390') {
    check('390: film video is full width minus 16 px gutters', Math.abs(layout.videoWidth - (layout.innerWidth - 32)) < 0.5);
  }
  check(`${name}: dialog open: no horizontal overflow`, await noOverflow(page));

  await page.keyboard.press('Escape');
  await waitForOpen(false);
  await waitForPaused();
  check(`${name}: Escape closes the film dialog`, (await dialogOpen()) === false);
  check(`${name}: Escape leaves the film video paused`, (await video.evaluate((v) => v.paused)) === true);
  check(`${name}: dialog closed again: no horizontal overflow`, await noOverflow(page));

  await button.click();
  await waitForOpen(true);
  await closeButton.click();
  await waitForOpen(false);
  await waitForPaused();
  check(`${name}: close button closes the film dialog`, (await dialogOpen()) === false);
  check(`${name}: close button leaves the film video paused`, (await video.evaluate((v) => v.paused)) === true);

  await button.click();
  await waitForOpen(true);
  await page.mouse.click(4, 4);
  await waitForOpen(false);
  await waitForPaused();
  check(`${name}: click on the backdrop closes the film dialog`, (await dialogOpen()) === false);
  check(`${name}: backdrop close leaves the film video paused`, (await video.evaluate((v) => v.paused)) === true);

  await page.goto(BASE_URL + '/fr/', { waitUntil: 'networkidle' });
  const frButton = page.locator('.hero .hero-film-button');
  check(`${name}: FR hero film button reads "${FILM_LABEL_FR}"`, (await frButton.textContent()).trim() === FILM_LABEL_FR);
  await frButton.click();
  await waitForOpen(true);
  check(`${name}: FR film dialog is labelled "Film CortexMind"`, (await page.locator('.film-dialog').getAttribute('aria-label')) === 'Film CortexMind');
  check(`${name}: FR close button is labelled "Fermer le film"`, (await page.locator('.film-dialog .film-close').getAttribute('aria-label')) === 'Fermer le film');
  await page.keyboard.press('Escape');
  await waitForOpen(false);

  await context.close();
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
    // Images in hidden dashboard panels are lazy and do not load until shown.
    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll('img'))
        .filter((img) => !img.closest('[hidden]'))
        .every((img) => img.complete && img.naturalWidth > 0)
    );

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    check(`${viewport.name}: no horizontal overflow (dark)`, overflow);

    const h1Visible = await page.locator('h1').first().isVisible();
    check(`${viewport.name}: h1 is visible`, h1Visible);

    const images = await page.locator('img').all();
    let allLoaded = true;
    let shownImages = 0;
    for (const img of images) {
      const { hidden, naturalWidth } = await img.evaluate((el) => ({
        hidden: el.closest('[hidden]') !== null,
        naturalWidth: el.naturalWidth
      }));
      if (hidden) continue;
      shownImages += 1;
      if (!(naturalWidth > 0)) allLoaded = false;
    }
    check(`${viewport.name}: every shown img has naturalWidth > 0 (${shownImages} images)`, allLoaded && shownImages > 0);

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
    check(`${viewport.name}: checkout body has correct product_id`, checkoutBody === JSON.stringify({ product_id: YEARLY_ID, locale: 'en' }));
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

    const aiCtaButton = page.locator('.ai-cta a.button');
    check(`${viewport.name}: .ai-cta a.button exists`, (await aiCtaButton.count()) === 1);
    check(`${viewport.name}: .ai-cta a.button is visible`, await aiCtaButton.isVisible());
    const aiCtaHref = await aiCtaButton.getAttribute('href');
    check(`${viewport.name}: .ai-cta a.button href ends with /docs#ai-install`, !!aiCtaHref && aiCtaHref.endsWith('/docs#ai-install'));

    const fineLink = page.locator('.pricing .fine a');
    const fineLinkText = (await fineLink.textContent())?.trim() ?? '';
    check(`${viewport.name}: pricing fine print anchor text is "customer portal"`, fineLinkText === 'customer portal');

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

    await page.screenshot({ path: `${OUT_DIR}home-${viewport.name}-light.png`, fullPage: true });

    await checkDashboard(page, viewport.name);

    await context.close();
    await checkFilm(browser, viewport);
  }

  const frContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const frPage = await frContext.newPage();
  await frPage.goto(BASE_URL + '/fr/', { waitUntil: 'networkidle' });
  const frLabels = (await frPage.locator('.dashboard-tabs [role="tab"]').allTextContents()).map((s) => s.trim());
  check('fr: dashboard tabs are Téléverser, Fichiers, Recherche', JSON.stringify(frLabels) === JSON.stringify(['Téléverser', 'Fichiers', 'Recherche']));
  await frContext.close();
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

process.exit(failed ? 1 : 0);
