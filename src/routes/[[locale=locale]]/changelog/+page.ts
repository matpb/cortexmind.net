import { marked } from 'marked';
import rawReleases from '$lib/data/releases.json';

export const prerender = true;

interface RawRelease {
  tag_name: string;
  name: string | null;
  published_at: string;
  html_url: string;
  body: string | null;
  prerelease: boolean;
}

export interface Release {
  tag_name: string;
  name: string | null;
  published_at: string;
  html_url: string;
  prerelease: boolean;
  notesHtml: string;
}

// marked output is generated from our own GitHub release notes, but strip the
// obvious injection vectors anyway before it goes through {@html}.
function sanitize(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '')
    .replace(/(href\s*=\s*)(["'])\s*javascript:[^"']*\2/gi, '$1$2#$2');
}

export function load() {
  const releases: Release[] = (rawReleases as RawRelease[])
    .slice()
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .map((r) => ({
      tag_name: r.tag_name,
      name: r.name,
      published_at: r.published_at,
      html_url: r.html_url,
      prerelease: r.prerelease,
      notesHtml: sanitize(marked.parse(r.body ?? '', { gfm: true }) as string)
    }));

  return { releases };
}
