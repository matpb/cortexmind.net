<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { macUrl, windowsUrl, linuxUrl } from '$lib/releases';
  import PromptCard from '$lib/PromptCard.svelte';
  import { installPrompt } from '$lib/prompts';

  const KEY_ENDPOINT = '/api/get-license-key';
  const MAX_POLLS = 6;
  const POLL_DELAY_MS = 3000;
  const FALLBACK_PORTAL = 'https://polar.sh/matpb/portal/request';

  let checkoutId: string | null = null;
  let status: 'pending' | 'ok' | 'error' = 'pending';
  let key = '';
  let portalUrl = FALLBACK_PORTAL;
  let errorMsg = '';
  let copyLabel = 'Copy';
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
        errorMsg = 'Your license key is still being issued. Refresh in a minute — it will also appear in your customer portal.';
        status = 'error';
        return;
      }
      if (res.status === 410) {
        errorMsg = 'This checkout was not completed, so no license key was issued. If you believe you were charged, reply to your receipt email.';
        status = 'error';
        return;
      }
      errorMsg = "We couldn't fetch your license key automatically.";
      status = 'error';
    } catch {
      if (attempts < MAX_POLLS) {
        setTimeout(fetchKey, POLL_DELAY_MS);
      } else {
        errorMsg = "We couldn't fetch your license key automatically.";
        status = 'error';
      }
    }
  }

  function copyKey() {
    if (!key) return;
    navigator.clipboard
      ?.writeText(key)
      .then(() => {
        copyLabel = 'Copied!';
        setTimeout(() => (copyLabel = 'Copy'), 1600);
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
      errorMsg = 'No checkout reference found. Your license key is in your customer portal — sign in with your checkout email.';
      status = 'error';
      return;
    }
    fetchKey();
  });
</script>

<svelte:head>
  <title>Welcome to CortexMind</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="wrap success-wrap">
  <h1>Your agents are about to remember.</h1>
  <p class="muted">
    You're in — thanks for backing local-first memory. Your license key is below; paste it into the app and you're done.
  </p>

  {#if status === 'pending'}
    <p class="muted">Fetching your license key…</p>
  {:else if status === 'ok'}
    <div class="key-block">
      <span class="muted">Your license key</span>
      <div class="key-row">
        <code>{key}</code>
        <button type="button" class="button small" on:click={copyKey}>{copyLabel}</button>
      </div>
      <p class="muted">Keep it handy — you can always find it again in your <a href={portalUrl}>customer portal</a>.</p>
    </div>

    <div class="ai-install">
      <h2>Next: let your AI install it</h2>
      <p class="muted">Copy this prompt into Claude Code, Codex, Cursor or any agent that can run commands on your machine. It will ask for the key above, download and install CortexMind, connect itself, move over what it already remembers, and interview you to seed the memory.</p>
      <PromptCard label="Setup prompt" prompt={installPrompt} copyLabel="Copy prompt" copiedLabel="Copied" />
      <p class="muted">Prefer to do it by hand? <a class="text-link" href="/docs#manual">Follow the manual steps</a>.</p>
    </div>

    <ol>
      <li>
        <strong>Or install manually:</strong> download CortexMind for your platform:
        <div class="step-downloads">
          <a class="button secondary small" href={macUrl}>Download for macOS</a>
          <a class="button secondary small" href={windowsUrl}>Download for Windows</a>
          <a class="button secondary small" href={linuxUrl}>Download for Linux</a>
        </div>
      </li>
      <li><strong>Open the app</strong> and paste the license key above when asked.</li>
      <li><strong>Connect your agents.</strong> The app's tray menu gives you a ready-made MCP config snippet.</li>
    </ol>

    <p class="muted">
      Manage or cancel your subscription anytime in your <a href={portalUrl}>customer portal</a>.
    </p>
  {:else}
    <p class="muted">
      {errorMsg} It's waiting in your <a href={FALLBACK_PORTAL}>customer portal</a> (sign in with your checkout email) — or
      reply to your receipt email and we'll get you set up right away.
    </p>
  {/if}

  {#if checkoutId}
    <p class="muted">Reference: {checkoutId}</p>
  {/if}

  <p><a href="/">&larr; Back to CortexMind</a></p>
</div>

<style>
  .success-wrap { padding: 64px 0 96px; max-width: 620px; }
  .key-block { margin: 32px 0; padding: 20px; border: 1px solid var(--line); border-radius: 8px; background: var(--panel); }
  .ai-install { margin: 32px 0; }
  .key-row { display: flex; align-items: center; gap: 12px; margin: 10px 0; }
  .key-row code { background: var(--code-bg); color: var(--code-text); padding: 8px 12px; border-radius: 6px; flex: 1; overflow-wrap: anywhere; }
  ol { padding-left: 20px; display: grid; gap: 16px; }
  .step-downloads { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
</style>
