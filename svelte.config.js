import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({ fallback: '200.html' }),
    prerender: { entries: ['*', '/fr', '/fr/docs', '/fr/changelog', '/fr/privacy', '/fr/terms'] },
    csp: {
      mode: 'hash',
      directives: {
        'default-src': ['self'],
        'img-src': ['self', 'data:'],
        'media-src': ['self'],
        'style-src': ['self', 'unsafe-inline'],
        'connect-src': ['self'],
        'font-src': ['self'],
        'script-src': ['self', 'sha256-nJbFvIqkHivoSiKe76VQtIGuQ6GBSvXLE/kmkMtswPg='],
        'object-src': ['none'],
        'base-uri': ['self'],
        'form-action': ['self']
      }
    }
  }
};
