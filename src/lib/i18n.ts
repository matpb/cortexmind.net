import { browser } from '$app/environment';
import { derived, get, writable } from 'svelte/store';
import { m } from '$lib/paraglide/messages.js';

export type Locale = 'en' | 'fr';
export type MessageKey = keyof typeof m;

export const LOCALES: { code: Locale; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' }
];

const supported = new Set<Locale>(['en', 'fr']);

function valid(value: string | null | undefined): Locale | null {
  if (!value) return null;
  const base = value.toLowerCase().split('-')[0] as Locale;
  return supported.has(base) ? base : null;
}

const initialLocale: Locale = browser ? (valid(document.documentElement.lang) ?? 'en') : 'en';
export const locale = writable<Locale>(initialLocale);

const STORAGE_KEY = 'cortexmind-locale';
// success/ is not localized: it lives outside the [[locale]] route group.
const UNLOCALIZED = ['/success'];

export function preferredLocale(): Locale {
  if (!browser) return 'en';
  let stored: Locale | null = null;
  try { stored = valid(localStorage.getItem(STORAGE_KEY)); } catch {}
  return stored ?? navigator.languages.map(valid).find(Boolean) ?? valid(navigator.language) ?? 'en';
}

export function selectLocale(next: Locale) {
  const chosen = valid(next) ?? 'en';
  locale.set(chosen);
  if (browser) {
    try { localStorage.setItem(STORAGE_KEY, chosen); } catch {}
  }
}

export function splitLocalePath(pathname: string): { locale: Locale; path: string } {
  if (pathname === '/fr') return { locale: 'fr', path: '/' };
  if (pathname.startsWith('/fr/')) return { locale: 'fr', path: pathname.slice(3) };
  return { locale: 'en', path: pathname };
}

export function localizePath(href: string, active: Locale): string {
  const m = /^(\/[^?#]*)(.*)$/.exec(href);
  if (!m || active === 'en') return href;
  const [, path, rest] = m;
  if (UNLOCALIZED.some((root) => path === root || path.startsWith(root + '/'))) return href;
  if (splitLocalePath(path).locale === 'fr') return href;
  return (path === '/' ? '/fr' : '/fr' + path) + rest;
}

export const href = derived(locale, (l) => (path: string) => localizePath(path, l));

export function tr(key: MessageKey, inputs: Record<string, unknown> = {}, active: Locale = get(locale)): string {
  const fn = (m as unknown as Record<string, (values: Record<string, unknown>, options: { locale: Locale }) => string>)[key as string];
  return fn ? fn(inputs, { locale: active }) : (key as string);
}

export const t = derived(locale, (l) => (key: MessageKey, inputs: Record<string, unknown> = {}) => tr(key, inputs, l));

export function fmtDate(value: string | number | Date, options: Intl.DateTimeFormatOptions = {}, active: Locale = get(locale)): string {
  const tag = active === 'fr' ? 'fr-CA' : 'en-CA';
  return new Intl.DateTimeFormat(tag, options).format(new Date(value));
}
