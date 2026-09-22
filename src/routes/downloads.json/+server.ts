import { json } from '@sveltejs/kit';
import { downloads } from '$lib/releases';

export const prerender = true;

export function GET() {
  return json(downloads, { headers: { 'Cache-Control': 'public, max-age=300' } });
}
