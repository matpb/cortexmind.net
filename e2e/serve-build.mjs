#!/usr/bin/env node
// Usage: node e2e/serve-build.mjs — serves build/ with try_files {path} {path}.html {path}/index.html /200.html.
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { join, normalize, extname } from 'node:path';

const BUILD_DIR = join(import.meta.dirname, '..', 'build');
const PORT = Number(process.env.E2E_PORT) || 4179;
const HOST = '127.0.0.1';

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

function contentTypeFor(path) {
  return CONTENT_TYPES[extname(path).toLowerCase()] || 'application/octet-stream';
}

function resolveInBuild(reqPath) {
  const decoded = decodeURIComponent(reqPath);
  const resolved = normalize(join(BUILD_DIR, decoded));
  if (resolved !== BUILD_DIR && !resolved.startsWith(BUILD_DIR + '/')) return null;
  return resolved;
}

function fileAt(path) {
  return existsSync(path) && statSync(path).isFile() ? path : null;
}

function serveFile(res, path) {
  res.writeHead(200, { 'Content-Type': contentTypeFor(path) });
  createReadStream(path).pipe(res);
}

export function createBuildServer() {
  return createServer((req, res) => {
    const reqPath = req.url.split('?')[0].split('#')[0];
    const target = resolveInBuild(reqPath);
    if (target === null) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('forbidden');
      return;
    }

    const candidates = [target, `${target}.html`, join(target, 'index.html')];
    for (const candidate of candidates) {
      const hit = fileAt(candidate);
      if (hit) {
        serveFile(res, hit);
        return;
      }
    }

    const fallback = fileAt(join(BUILD_DIR, '200.html'));
    if (fallback) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      createReadStream(fallback).pipe(res);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('not found');
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createBuildServer().listen(PORT, HOST, () => {
    console.log(`serving ${BUILD_DIR} at http://${HOST}:${PORT}`);
  });
}
