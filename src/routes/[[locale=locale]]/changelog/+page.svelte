<script lang="ts">
  import { t, fmtDate } from '$lib/i18n';
  import type { PageData } from './$types';

  export let data: PageData;
  $: releases = data.releases;

  function displayVersion(tag: string): string {
    return tag.startsWith('v') ? tag.slice(1) : tag;
  }
</script>

<svelte:head>
  <title>{$t('changelog.meta.page_title')}</title>
  <meta name="description" content={$t('changelog.meta.description')} />
</svelte:head>

<div class="wrap page-head">
  <h1>{$t('changelog.title')}</h1>
  <p class="muted">{$t('changelog.lead')}</p>
</div>

<div class="wrap">
  {#if releases.length === 0}
    <p>
      {$t('changelog.empty')}
      <a class="text-link" href="https://github.com/matpb/cortexmind.net/releases">GitHub</a>
    </p>
  {:else}
    {#each releases as release, i (release.tag_name)}
      <section class="release">
        <div class="release-head">
          <h2>{displayVersion(release.tag_name)}</h2>
          {#if release.name && release.name !== release.tag_name}
            <span class="muted">{release.name}</span>
          {/if}
          {#if i === 0}
            <span class="release-pill">{$t('changelog.current')}</span>
          {/if}
        </div>
        <p class="release-date">{$t('changelog.released', { date: fmtDate(release.published_at, { year: 'numeric', month: 'long', day: 'numeric' }) })}</p>
        <div class="release-notes">{@html release.notesHtml}</div>
        <p><a class="text-link" href={release.html_url}>{$t('changelog.github')}</a></p>
      </section>
    {/each}
  {/if}
</div>
