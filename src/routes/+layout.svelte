<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { theme, toggleTheme, watchSystem } from '$lib/theme';
  import { href, locale, localizePath, LOCALES, preferredLocale, selectLocale, splitLocalePath, t, type Locale } from '$lib/i18n';
  import { jsonLdTag } from '$lib/seo';

  const SITE = 'https://cortexmind.net';

  $: routeLocale = $page.data.locale as Locale | undefined;
  $: locale.set(routeLocale ?? preferredLocale());
  $: if (browser) document.documentElement.lang = $locale;
  $: base = splitLocalePath($page.url.pathname).path;
  $: canonical = SITE + $page.url.pathname.replace(/(.)\/$/, '$1');
  $: enUrl = SITE + base;
  $: frUrl = SITE + localizePath(base, 'fr');
  $: isLight = $theme === 'light';
  $: isHome = base === '/';

  $: structuredData = isHome
    ? {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'CortexMind',
        applicationCategory: 'DeveloperApplication',
        description: $t('layout.meta.description'),
        url: SITE + localizePath('/', $locale),
        offers: [
          { '@type': 'Offer', price: '10', priceCurrency: 'USD', name: 'Monthly' },
          { '@type': 'Offer', price: '99', priceCurrency: 'USD', name: 'Yearly' }
        ],
        author: { '@type': 'Person', name: 'Mathieu-Philippe Bourgeois', url: 'https://matpb.com' }
      }
    : null;

  onMount(() => {
    if ($page.url.pathname === '/' && preferredLocale() === 'fr') void goto('/fr' + $page.url.search + $page.url.hash, { replaceState: true });
    const stopWatch = watchSystem();
    return () => stopWatch();
  });

  function choose(value: Locale) {
    selectLocale(value);
    void goto(localizePath(base, value) + $page.url.search + $page.url.hash, { noScroll: true, keepFocus: true });
  }
</script>

<svelte:head>
  <title>{$t('layout.meta.page_title')}</title>
  <meta name="description" content={$t('layout.meta.description')} />
  <link rel="canonical" href={canonical} />
  <link rel="alternate" hreflang="en" href={enUrl} />
  <link rel="alternate" hreflang="fr" href={frUrl} />
  <link rel="alternate" hreflang="x-default" href={enUrl} />
  {#if structuredData}
    {@html jsonLdTag(structuredData)}
  {/if}
</svelte:head>

<a href="#main" class="skip">{$t('layout.skip_to_content')}</a>

<header class="site-header" class:over-hero={isHome}>
  <a href={$href('/')} class="brand" aria-label="CortexMind">
    <img src="/logo.png" alt="" width="28" height="28" />
    <span class="brand-text">CortexMind</span>
  </a>
  <nav>
    <a href={$href('/') + '#how-it-works'}>{$t('layout.nav.how_it_works')}</a>
    <a href={$href('/') + '#pricing'}>{$t('layout.nav.pricing')}</a>
    <a href={$href('/docs')}>{$t('layout.nav.docs')}</a>
    <a href={$href('/changelog')}>{$t('layout.nav.changelog')}</a>
    <div class="header-controls">
      <button type="button" class="theme-toggle" on:click={toggleTheme} aria-label={isLight ? $t('layout.theme.to_dark') : $t('layout.theme.to_light')}>
        {#if isLight}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
          </svg>
        {:else}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        {/if}
      </button>
      <div class="locale-select-wrap">
        <label class="sr-only" for="locale-select">{$t('layout.locale.label')}</label>
        <select id="locale-select" class="locale-select" aria-label={$t('layout.locale.aria')} value={$locale} on:change={(e) => choose(e.currentTarget.value as Locale)}>
          {#each LOCALES as l (l.code)}
            <option value={l.code}>{l.code.toUpperCase()}</option>
          {/each}
        </select>
      </div>
      <a class="button" href={$href('/') + '#pricing'}>{$t('layout.nav.start_trial')}</a>
    </div>
  </nav>
</header>

<main id="main">
  <slot />
</main>

<footer class="site-footer">
  <div>
    <a href={$href('/')} class="brand">
      <img src="/logo.png" alt="" width="28" height="28" />
      CortexMind
    </a>
    <p>{$t('layout.footer.tagline')}</p>
  </div>
  <nav class="footer-links">
    <a href={$href('/docs')}>{$t('layout.footer.docs')}</a>
    <a href={$href('/changelog')}>{$t('layout.footer.changelog')}</a>
    <a href={$href('/privacy')}>{$t('layout.footer.privacy')}</a>
    <a href={$href('/terms')}>{$t('layout.footer.terms')}</a>
    <a href="mailto:info@cortexmind.net">{$t('layout.footer.contact')}</a>
    <a href="https://github.com/matpb/cortexmind.net/releases">{$t('layout.footer.releases')}</a>
    <a class="credit-link" href="https://matpb.com" target="_blank" rel="noopener">
      {$t('layout.footer.copyright')}
    </a>
  </nav>
</footer>
