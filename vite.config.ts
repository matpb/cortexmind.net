import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
// assetsInlineLimit 0: no data: fonts, so the CSP font-src stays 'self'.
export default defineConfig({ plugins: [sveltekit()], build: { assetsInlineLimit: 0 } });
