<script lang="ts">
  import { t, href } from '$lib/i18n';

  const TUNNEL_URL = 'https://cm-xxxxxxxxxxxx.ethertunnel.com/mcp';
  const STRONG_TERMS = ['CortexMind Password', 'Public URL', 'Local URL', 'Bearer', 'Developer mode', 'mode développeur', 'CortexMind'];
  const STRONG_RE = new RegExp(STRONG_TERMS.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');

  function escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Single-pass alternation match, longest term first, so a match never lands inside another.
  function boldTerms(segment: string): string {
    return segment.replace(STRONG_RE, (m) => `<strong>${m}</strong>`);
  }

  // Wraps curly-quoted runs (English “…” or French «…») in <strong>, keeping the quotes.
  function boldQuotes(segment: string): string {
    return segment.replace(/[“«][^”»]*[”»]/g, (m) => `<strong>${m}</strong>`);
  }

  function formatStep(raw: string): string {
    const escaped = escapeHtml(raw);
    const codeNeedle = escapeHtml(TUNNEL_URL);
    const parts = escaped.split(codeNeedle);
    return parts.map((part) => boldQuotes(boldTerms(part))).join(`<code>${codeNeedle}</code>`);
  }
</script>

<div class="wrap page-head">
  <h1>{$t('connect.title')}</h1>
  <p class="muted">{$t('connect.lead')}</p>
</div>

<div class="wrap connect-content">
  <section class="before-start">
    <h2>{$t('connect.before.title')}</h2>
    <ul>
      <li>{@html formatStep($t('connect.before.running'))}</li>
      <li>{@html formatStep($t('connect.before.values'))}</li>
      <li>{@html formatStep($t('connect.before.awake'))}</li>
    </ul>
  </section>

  <div class="connect-grid">
    <section id="chatgpt">
      <h2>{$t('connect.chatgpt.title')}</h2>
      <p class="model-note">{$t('connect.chatgpt.plans')}</p>
      <ol>
        <li>{@html formatStep($t('connect.chatgpt.s1'))}</li>
        <li>{@html formatStep($t('connect.chatgpt.s2'))}</li>
        <li>{@html formatStep($t('connect.chatgpt.s3'))}</li>
        <li>{@html formatStep($t('connect.chatgpt.s4'))}</li>
        <li>{@html formatStep($t('connect.chatgpt.s5'))}</li>
        <li>{@html formatStep($t('connect.chatgpt.s6'))}</li>
        <li>{@html formatStep($t('connect.chatgpt.s7'))}</li>
        <li>{@html formatStep($t('connect.chatgpt.s8'))}</li>
      </ol>
    </section>

    <section id="claude">
      <h2>{$t('connect.claude.title')}</h2>
      <p class="model-note">{$t('connect.claude.plans')}</p>
      <ol>
        <li>{@html formatStep($t('connect.claude.s1'))}</li>
        <li>{@html formatStep($t('connect.claude.s2'))}</li>
        <li>{@html formatStep($t('connect.claude.s3'))}</li>
        <li>{@html formatStep($t('connect.claude.s4'))}</li>
        <li>{@html formatStep($t('connect.claude.s5'))}</li>
        <li>{@html formatStep($t('connect.claude.s6'))}</li>
      </ol>
    </section>
  </div>

  <section class="trouble">
    <h2>{$t('connect.trouble.title')}</h2>
    <details>
      <summary>{$t('connect.trouble.q1')}</summary>
      <p>{@html formatStep($t('connect.trouble.a1'))}</p>
    </details>
    <details>
      <summary>{$t('connect.trouble.q2')}</summary>
      <p>{@html formatStep($t('connect.trouble.a2'))}</p>
    </details>
    <details>
      <summary>{$t('connect.trouble.q3')}</summary>
      <p>{@html formatStep($t('connect.trouble.a3'))}</p>
    </details>
    <details>
      <summary>{$t('connect.trouble.q4')}</summary>
      <p>{@html formatStep($t('connect.trouble.a4'))}</p>
    </details>
  </section>

  <p class="muted agents-note">
    {$t('connect.agents')}
    <a class="text-link" href={$href('/docs') + '#ai-install'}>{$t('connect.agents_link')}</a>
  </p>
</div>

<style>
  /* padding-bottom only: a padding shorthand here wipes .wrap's side gutters */
  .connect-content { padding-bottom: 96px; }
  .connect-content section { border-bottom: 1px solid var(--line); padding: 0 0 48px; margin-bottom: 48px; }
  .before-start ul { padding-left: 20px; display: grid; gap: 8px; }
  .model-note {
    font-size: 13px;
    color: var(--gold-text);
    background: var(--gold-soft);
    border: 1px solid var(--gold-line);
    border-radius: 6px;
    padding: 10px 14px;
    max-width: none;
    margin: 20px 0 28px;
  }
  .trouble h2 { margin-bottom: 28px; }
  .connect-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; }
  .connect-grid ol { padding-left: 0; list-style: none; counter-reset: step; display: grid; gap: 16px; }
  .connect-grid ol li { counter-increment: step; padding-left: 40px; position: relative; }
  .connect-grid ol li::before {
    content: counter(step);
    position: absolute;
    left: 0;
    top: -2px;
    font-size: 18px;
    font-weight: 700;
    color: var(--gold-text);
  }
  .trouble details { border: 1px solid var(--line); border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; }
  .agents-note { margin-top: 8px; }

  @media (max-width: 760px) {
    .connect-grid { grid-template-columns: 1fr; }
  }
</style>
