#!/usr/bin/env node
// Fetches GitHub releases at build time. Any failure leaves the existing
// releases.json untouched so a bad build never clobbers a working file.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('../src/lib/data/releases.json', import.meta.url));
const API_URL = 'https://api.github.com/repos/matpb/cortexmind.net/releases?per_page=50';
// The public changelog starts at 4.0.0; older releases stay on GitHub only.
const CHANGELOG_SINCE = [4, 0, 0];
const atLeast = (tag) => {
  const v = (tag || '').replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((v[i] || 0) !== CHANGELOG_SINCE[i]) return (v[i] || 0) > CHANGELOG_SINCE[i];
  }
  return true;
};

async function main() {
  const headers = { Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const res = await fetch(API_URL, { headers });
  if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);

  const raw = await res.json();
  if (!Array.isArray(raw)) throw new Error('unexpected GitHub API response shape');

  const releases = raw
    .filter((r) => !r.draft && atLeast(r.tag_name))
    .map((r) => ({
      tag_name: r.tag_name,
      name: r.name,
      published_at: r.published_at,
      html_url: r.html_url,
      body: r.body,
      prerelease: r.prerelease
    }));

  await writeFile(OUT, JSON.stringify(releases, null, 2) + '\n', 'utf8');
  console.log(`fetch-releases: wrote ${releases.length} releases to ${OUT}`);
}

try {
  await main();
} catch (err) {
  console.error('fetch-releases: failed, keeping existing releases.json —', err.message);
  process.exit(0);
}
