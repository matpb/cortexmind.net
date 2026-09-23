<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { macUrl, windowsUrl, linuxUrl } from '$lib/releases';
  import PromptCard from '$lib/PromptCard.svelte';
  import { installPromptFor } from '$lib/prompts';
  import { t, tr, href, locale } from '$lib/i18n';

  const KEY_ENDPOINT = '/api/get-license-key';
  const MAX_POLLS = 6;
  const POLL_DELAY_MS = 3000;
  const FALLBACK_PORTAL = 'https://polar.sh/matpb/portal/request';

  let checkoutId: string | null = null;
  let status: 'pending' | 'ok' | 'error' = 'pending';
  let key = '';
  let portalUrl = FALLBACK_PORTAL;
  let errorMsg = '';
  let keyCopied = false;
  let attempts = 0;

  async function fetchKey() {
    attempts += 1;
    try {
      const res = await fetch(KEY_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ checkout_id: checkoutId })
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 200 && data.key) {
        key = data.key;
        if (data.portal_url) portalUrl = data.portal_url;
        status = 'ok';
        return;
      }
      if ((res.status === 202 || data.pending) && attempts < MAX_POLLS) {
        setTimeout(fetchKey, POLL_DELAY_MS);
        return;
      }
      if (res.status === 202 || data.pending) {
        errorMsg = tr('success.error_pending', {}, $locale);
        status = 'error';
        return;
      }
      if (res.status === 410) {
        errorMsg = tr('success.error_not_completed', {}, $locale);
        status = 'error';
        return;
      }
      errorMsg = tr('success.error_generic', {}, $locale);
      status = 'error';
    } catch {
      if (attempts < MAX_POLLS) {
        setTimeout(fetchKey, POLL_DELAY_MS);
      } else {
        errorMsg = tr('success.error_generic', {}, $locale);
        status = 'error';
      }
    }
  }

  function copyKey() {
    if (!key) return;
    navigator.clipboard
      ?.writeText(key)
      .then(() => {
        keyCopied = true;
        setTimeout(() => (keyCopied = false), 1600);
      })
      .catch(() => {});
  }

  onMount(() => {
    checkoutId = $page.url.searchParams.get('checkout_id');
    // ?checkout_id=preview renders the delivered state without a purchase.
    if (checkoutId === 'preview') {
      key = 'CMND-PREVIEW-0000-0000-0000-000000000000';
      status = 'ok';
      return;
    }
    if (!checkoutId) {
      errorMsg = tr('success.no_checkout', {}, $locale);
      status = 'error';
      return;
    }
    fetchKey();
  });
</script>

<svelte:head>
  <title>{$t('success.meta_title')}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="wrap success-wrap">
  <h1>{$t('success.title')}</h1>
  <p class="muted">{$t('success.lead')}</p>

  {#if status === 'pending'}
    <p class="muted">{$t('success.pending')}</p>
  {:else if status === 'ok'}
    <div class="key-block">
      <span class="muted">{$t('success.key_label')}</span>
      <div class="key-row">
        <code>{key}</code>
        <button type="button" class="button small" on:click={copyKey}>{keyCopied ? $t('success.copied') : $t('success.copy')}</button>
      </div>
      <p class="muted">
        {$t('success.key_hint_pre')}<a href={portalUrl}>{$t('success.key_hint_link')}</a>{$t('success.key_hint_post')}
      </p>
      <p class="muted key-saved">{$t('success.key_saved')}</p>
    </div>

    <div class="ai-install">
      <h2>{$t('success.ai_heading')}</h2>
      <p class="muted">{$t('success.ai_lead')}</p>
      <p class="model-note">{$t('docs.ai.model_note')}</p>
      <PromptCard
        label={$t('success.prompt_label')}
        prompt={installPromptFor($locale)}
        copyLabel={$t('success.prompt_copy')}
        copiedLabel={$t('success.prompt_copied')}
      />
      <p class="muted">
        {$t('success.manual_pre')}<a class="text-link" href={$href('/docs') + '#manual'}>{$t('success.manual_link')}</a>{$t('success.manual_post')}
      </p>
    </div>

    <ol>
      <li>
        <strong>{$t('success.manual_step_strong')}</strong> {$t('success.manual_step_lead')}
        <div class="step-downloads">
          <a class="button secondary small" href={macUrl}>{$t('success.download_mac')}</a>
          <a class="button secondary small" href={windowsUrl}>{$t('success.download_windows')}</a>
          <a class="button secondary small" href={linuxUrl}>{$t('success.download_linux')}</a>
        </div>
      </li>
      <li><strong>{$t('success.step_open_strong')}</strong> {$t('success.step_open_rest')}</li>
      <li><strong>{$t('success.step_connect_strong')}</strong> {$t('success.step_connect_rest')}</li>
    </ol>

    <p class="muted">
      {$t('success.manage_pre')}<a href={portalUrl}>{$t('success.manage_link')}</a>{$t('success.manage_post')}
    </p>
  {:else}
    <p class="muted">
      {errorMsg} {$t('success.error_fallback_pre')}<a href={FALLBACK_PORTAL}>{$t('success.error_fallback_link')}</a>{$t('success.error_fallback_post')}
    </p>
  {/if}

  {#if checkoutId}
    <p class="muted">{$t('success.reference', { id: checkoutId })}</p>
  {/if}

  <p><a href={$href('/')}>{$t('success.back')}</a></p>
</div>

<style>
  .success-wrap { padding: 64px 0 96px; max-width: 620px; }
  .key-block { margin: 32px 0; padding: 20px; border: 1px solid var(--line); border-radius: 8px; background: var(--panel); }
  .key-saved { margin-top: 10px; }
  .ai-install { margin: 32px 0; }
  .model-note {
    font-size: 13px;
    color: var(--gold-text);
    background: var(--gold-soft);
    border: 1px solid var(--gold-line);
    border-radius: 6px;
    padding: 10px 14px;
    max-width: none;
  }
  .key-row { display: flex; align-items: center; gap: 12px; margin: 10px 0; }
  .key-row code { background: var(--code-bg); color: var(--code-text); padding: 8px 12px; border-radius: 6px; flex: 1; overflow-wrap: anywhere; }
  ol { padding-left: 20px; display: grid; gap: 16px; }
  .step-downloads { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
</style>
