#!/usr/bin/env node
// Usage: node e2e/prompt-parity.mjs — no build/browser needed, reads the .md sources directly.
import { readFile } from 'node:fs/promises';

let failed = false;
function check(name, ok) {
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}`);
  if (!ok) failed = true;
}

// Tagged blocks (```toml, ...) are commands/config and must match verbatim;
// untagged ``` blocks are translated illustrative text, count-only.
function codeBlocks(text) {
  const blocks = text.match(/```[\s\S]*?```/g) || [];
  const tagged = new Set();
  let untaggedCount = 0;
  for (const b of blocks) {
    if (/^```[a-zA-Z]+/.test(b)) tagged.add(b.trim());
    else untaggedCount += 1;
  }
  return { tagged, untaggedCount, total: blocks.length };
}

function urls(text) {
  const found = text.match(/https?:\/\/[^\s)"'`<>]+/g) || [];
  return new Set(found.map((u) => u.replace(/[.,:]+$/, '')));
}

function headingLines(text) {
  return text.split('\n').filter((l) => /^#{1,6}\s/.test(l));
}

function setDiff(a, b) {
  return [...a].filter((x) => !b.has(x));
}

const en = await readFile(new URL('../src/lib/prompts/install.en.md', import.meta.url), 'utf8');
const fr = await readFile(new URL('../src/lib/prompts/install.fr.md', import.meta.url), 'utf8');

const enBlocks = codeBlocks(en);
const frBlocks = codeBlocks(fr);
const taggedDiff = setDiff(enBlocks.tagged, frBlocks.tagged).length + setDiff(frBlocks.tagged, enBlocks.tagged).length;
check('prompt parity: identical set of tagged (command/config) fenced code blocks', taggedDiff === 0);
if (taggedDiff) {
  console.log('  en-only tagged blocks:', setDiff(enBlocks.tagged, frBlocks.tagged));
  console.log('  fr-only tagged blocks:', setDiff(frBlocks.tagged, enBlocks.tagged));
}
check('prompt parity: same total fenced code block count', enBlocks.total === frBlocks.total);
check('prompt parity: same untagged (illustrative) fenced block count', enBlocks.untaggedCount === frBlocks.untaggedCount);

const enUrls = urls(en);
const frUrls = urls(fr);
check('prompt parity: identical set of URLs', enUrls.size === frUrls.size && setDiff(enUrls, frUrls).length === 0);
if (setDiff(enUrls, frUrls).length || setDiff(frUrls, enUrls).length) {
  console.log('  en-only urls:', setDiff(enUrls, frUrls));
  console.log('  fr-only urls:', setDiff(frUrls, enUrls));
}

const enHeadings = headingLines(en);
const frHeadings = headingLines(fr);
check(`prompt parity: same number of markdown heading lines (${enHeadings.length})`, enHeadings.length === frHeadings.length);

check('prompt parity: English prompt says "Part C", not "Partie C"', en.includes('Part C') && !en.includes('Partie C'));
check('prompt parity: French prompt says "Partie C", not "Part C"', fr.includes('Partie C') && !fr.includes('Part C'));

process.exit(failed ? 1 : 0);
