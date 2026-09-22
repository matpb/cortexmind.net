#!/usr/bin/env node
// Renders static/og.jpg (EN) and static/og-fr.jpg (FR) share cards via Playwright.
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { chromium } from 'playwright';

const ROOT = new URL('..', import.meta.url).pathname;

const en = JSON.parse(readFileSync(ROOT + 'messages/en.json', 'utf8'));
const fr = JSON.parse(readFileSync(ROOT + 'messages/fr.json', 'utf8'));

const FRAUNCES = `file://${ROOT}node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2`;
const SPACE_GROTESK = `file://${ROOT}node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2`;
const HERO_POSTER = `file://${ROOT}static/media/hero-poster.jpg`;
const LOGO = `file://${ROOT}static/logo.png`;

function html({ headline1, headline2, tagline, wordmark }) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @font-face {
    font-family: 'Fraunces Variable';
    src: url('${FRAUNCES}') format('woff2-variations');
    font-weight: 300 700;
  }
  @font-face {
    font-family: 'Space Grotesk Variable';
    src: url('${SPACE_GROTESK}') format('woff2-variations');
    font-weight: 400 600;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body {
    position: relative;
    background-image: url('${HERO_POSTER}');
    background-size: cover;
    background-position: right center;
    font-family: 'Space Grotesk Variable', sans-serif;
  }
  .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, rgba(18,22,27,.96) 0%, rgba(18,22,27,.80) 45%, rgba(18,22,27,.25) 70%);
  }
  .bottom-fade {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 42%;
    background: linear-gradient(to bottom, rgba(18,22,27,0) 0%, rgba(18,22,27,.85) 100%);
  }
  .content {
    position: relative;
    height: 100%;
    padding: 72px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .brand-row {
    display: flex;
    align-items: center;
    gap: 18px;
  }
  .brand-row img {
    height: 56px;
    width: 56px;
    display: block;
  }
  .wordmark {
    font-family: 'Fraunces Variable', serif;
    font-weight: 500;
    font-size: 34px;
    color: #EEE8DA;
  }
  .headline {
    font-family: 'Fraunces Variable', serif;
    font-weight: 400;
    font-size: 76px;
    line-height: 1.0;
    letter-spacing: -0.02em;
    color: #EEE8DA;
    max-width: 900px;
  }
  .tagline {
    font-size: 24px;
    color: #CFC7B6;
    max-width: 640px;
    margin-top: 28px;
  }
  .domain {
    font-size: 18px;
    color: #9A9486;
  }
</style>
</head>
<body>
  <div class="overlay"></div>
  <div class="bottom-fade"></div>
  <div class="content">
    <div class="brand-row">
      <img src="${LOGO}" alt="" />
      <span class="wordmark">${wordmark}</span>
    </div>
    <div>
      <div class="headline">${headline1}<br />${headline2}</div>
      <div class="tagline">${tagline}</div>
    </div>
    <div class="domain">cortexmind.net</div>
  </div>
</body>
</html>`;
}

const CARDS = [
  {
    outFile: ROOT + 'static/og.jpg',
    headline1: en['home.hero.title_line1'],
    headline2: en['home.hero.title_line2'],
    tagline: en['layout.footer.tagline'],
    wordmark: 'CortexMind'
  },
  {
    outFile: ROOT + 'static/og-fr.jpg',
    headline1: fr['home.hero.title_line1'],
    headline2: fr['home.hero.title_line2'],
    tagline: fr['layout.footer.tagline'],
    wordmark: 'CortexMind'
  }
];

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const card of CARDS) {
    // file:// resources (fonts, images) only load when the document itself is file://.
    const tmpPath = card.outFile.replace(/\.jpg$/, '.tmp.html');
    writeFileSync(tmpPath, html(card));
    await page.goto(`file://${tmpPath}`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: card.outFile, type: 'jpeg', quality: 88 });
    rmSync(tmpPath);
    console.log(`Wrote ${card.outFile}`);
  }
} finally {
  await browser.close();
}
