import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'cortexmind-theme';

function systemTheme(): Theme {
  return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function resolvedTheme(): Theme {
  const attr = document.documentElement.dataset.theme;
  if (attr === 'light' || attr === 'dark') return attr;
  return systemTheme();
}

function updateMeta(t: Theme) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', t === 'dark' ? '#12161B' : '#FBF7F0');
}

export function setTheme(t: Theme) {
  localStorage.setItem(STORAGE_KEY, t);
  document.documentElement.dataset.theme = t;
  updateMeta(t);
  window.dispatchEvent(new CustomEvent('cortexmind:theme', { detail: t }));
}

export function toggleTheme() {
  setTheme(resolvedTheme() === 'dark' ? 'light' : 'dark');
}

export function watchSystem(): () => void {
  const mq = matchMedia('(prefers-color-scheme: light)');
  const handler = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return;
    const t = systemTheme();
    updateMeta(t);
    window.dispatchEvent(new CustomEvent('cortexmind:theme', { detail: t }));
  };
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}

export const theme = writable<Theme>('dark');

if (typeof document !== 'undefined') {
  theme.set(resolvedTheme());
  window.addEventListener('cortexmind:theme', (e) => {
    theme.set((e as CustomEvent<Theme>).detail);
  });
}
