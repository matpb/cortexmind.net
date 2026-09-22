<script lang="ts">
  import { t, fmtDate } from '$lib/i18n';
  import { macUrl, windowsUrl, linuxUrl, version, pubDate } from '$lib/releases';

  const MONTHLY_ID = '1dc6a2ec-ca63-4db9-b2c8-2dfa4c8de64b';
  const YEARLY_ID = '9adbb9d6-f0f0-4382-92b8-80ace8795144';

  let busy: string | null = null;
  let checkoutError = false;
  let serverError = '';

  async function checkout(productId: string) {
    if (busy) return;
    busy = productId;
    checkoutError = false;
    serverError = '';
    try {
      const res = await fetch('/api/create-polar-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId })
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.url) {
        window.location.href = data.url;
        return;
      }
      serverError = (data && (data.message || data.error)) || '';
      checkoutError = true;
    } catch {
      checkoutError = true;
    } finally {
      busy = null;
    }
  }

  // Splits a "{#link}text{/link}" marker string into leading/link/trailing parts.
  function splitLink(source: string): { pre: string; link: string; post: string } {
    const m = /^(.*)\{#link\}(.*)\{\/link\}(.*)$/s.exec(source);
    if (!m) return { pre: source, link: '', post: '' };
    return { pre: m[1], link: m[2], post: m[3] };
  }

  let detected: 'mac' | 'windows' | 'linux' | null = null;
  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent;
    if (/Mac OS X|Macintosh/.test(ua)) detected = 'mac';
    else if (/Windows/.test(ua)) detected = 'windows';
    else if (/Linux/.test(ua)) detected = 'linux';
  }

  $: fine = splitLink($t('home.pricing.fine'));
</script>

<svelte:head>
  <title>{$t('home.meta.page_title')}</title>
  <meta name="description" content={$t('home.meta.description')} />
</svelte:head>

<section class="hero">
  <div class="hero-media" aria-hidden="true">
    <img src="/media/hero-poster.jpg" alt="" class="hero-poster" />
    <video autoplay muted loop playsinline poster="/media/hero-poster.jpg" aria-label={$t('home.hero.video_aria')}>
      <source src="/media/hero.mp4" type="video/mp4" />
    </video>
    <div class="hero-gradient"></div>
  </div>
  <div class="wrap hero-content">
    <h1>{$t('home.hero.title_line1')}<br />{$t('home.hero.title_line2')}</h1>
    <p class="lead">{$t('home.hero.lead')}</p>
    <div class="hero-actions">
      <a class="button" href="#pricing">{$t('home.hero.primary')}</a>
      <a class="button secondary" href="#how-it-works">{$t('home.hero.secondary')}</a>
    </div>
    <p class="fine muted">{$t('home.hero.fine')}</p>
  </div>
</section>

<section class="clients">
  <div class="wrap clients-row">
    <span class="muted">{$t('home.clients.label')}</span>
    <span>Claude Code</span>
    <span>Claude Desktop</span>
    <span>claude.ai</span>
    <span>ChatGPT</span>
    <span>Codex</span>
    <span>Cursor</span>
    <span class="muted">{$t('home.clients.tail')}</span>
  </div>
</section>

<section class="problem">
  <div class="wrap problem-grid">
    <img src="/media/card.jpg" alt={$t('home.problem.image_alt')} class="problem-image" width="1792" height="1008" loading="lazy" />
    <div class="problem-text">
      <h2>{$t('home.problem.title')}</h2>
      <p>{$t('home.problem.p1')}</p>
      <p>{$t('home.problem.p2')}</p>
      <a href="#how-it-works" class="text-link">{$t('home.problem.link')}</a>
    </div>
  </div>
</section>

<section id="how-it-works" class="how-band">
  <img src="/media/archive.jpg" alt="" class="how-band-image" aria-hidden="true" />
  <div class="how-band-overlay" aria-hidden="true"></div>
  <div class="wrap how-band-content">
    <h2>{$t('home.how.title')}</h2>
    <p class="lead">{$t('home.how.lead')}</p>
  </div>
</section>

<section class="how-steps">
  <div class="wrap steps-grid">
    <div class="step">
      <span class="step-number">{$t('home.how.step1.number')}</span>
      <h3>{$t('home.how.step1.title')}</h3>
      <p>{$t('home.how.step1.body')}</p>
    </div>
    <div class="step">
      <span class="step-number">{$t('home.how.step2.number')}</span>
      <h3>{$t('home.how.step2.title')}</h3>
      <p>{$t('home.how.step2.body')}</p>
    </div>
    <div class="step">
      <span class="step-number">{$t('home.how.step3.number')}</span>
      <h3>{$t('home.how.step3.title')}</h3>
      <p>{$t('home.how.step3.body')}</p>
    </div>
  </div>
</section>

<section class="retrieval">
  <div class="wrap retrieval-grid">
    <div class="retrieval-text">
      <h2>{$t('home.retrieval.title')}</h2>
      <p>{$t('home.retrieval.p1')}</p>
      <p>{$t('home.retrieval.p2')}</p>
    </div>
    <div class="retrieval-visual">
      <img src="/media/panes.jpg" alt={$t('home.retrieval.image_alt')} class="retrieval-image" width="1792" height="1008" loading="lazy" />
      <div class="transcript">
        <div class="transcript-head">
          <span>{$t('home.retrieval.panel_heading')}</span>
          <span class="muted">{$t('home.retrieval.panel_sub')}</span>
        </div>
        <div class="transcript-body">
          <p class="transcript-query">memory_search("{$t('home.retrieval.query')}")</p>
          <div class="transcript-hit">
            <p class="hit-meta">{$t('home.retrieval.hit1_meta')}</p>
            <p class="hit-text">{$t('home.retrieval.hit1_text')}</p>
          </div>
          <div class="transcript-hit">
            <p class="hit-meta">{$t('home.retrieval.hit2_meta')}</p>
            <p class="hit-text">{$t('home.retrieval.hit2_text')}</p>
          </div>
          <div class="transcript-hit">
            <p class="hit-meta">{$t('home.retrieval.hit3_meta')}</p>
            <p class="hit-text">{$t('home.retrieval.hit3_text')}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="boot">
  <div class="wrap boot-grid">
    <div class="boot-text">
      <h2>{$t('home.boot.title')}</h2>
      <p>{$t('home.boot.p1')}</p>
      <p>{$t('home.boot.p2')}</p>
    </div>
    <div class="boot-card">
      <p class="boot-card-head">{$t('home.boot.card_heading')}</p>
      <p class="boot-card-label muted">{$t('home.boot.card_rules_label')}</p>
      <ul class="boot-card-rules">
        <li>{$t('home.boot.rule1')}</li>
        <li>{$t('home.boot.rule2')}</li>
        <li>{$t('home.boot.rule3')}</li>
        <li>{$t('home.boot.rule4')}</li>
        <li>{$t('home.boot.rule5')}</li>
      </ul>
      <p class="boot-card-label muted">{$t('home.boot.card_recent_label')}</p>
      <p class="boot-card-recent muted">{$t('home.boot.recent1')}</p>
      <p class="boot-card-recent muted">{$t('home.boot.recent2')}</p>
    </div>
  </div>
</section>

<section class="dashboard">
  <div class="wrap">
    <div class="dashboard-frame">
      <picture>
        <source media="(max-width:600px)" srcset="/media/dashboard-390.png" />
        <img src="/media/dashboard-1440.png" alt={$t('home.dashboard.image_alt')} loading="lazy" width="1440" height="900" />
      </picture>
    </div>
    <div class="dashboard-text">
      <h2>{$t('home.dashboard.title')}</h2>
      <p>{$t('home.dashboard.p1')}</p>
      <p>{$t('home.dashboard.p2')}</p>
    </div>
  </div>
</section>

<section class="local">
  <div class="wrap">
    <h2>{$t('home.local.title')}</h2>
    <div class="local-grid">
      <div class="local-col">
        <h3>{$t('home.local.col1.title')}</h3>
        <p>{$t('home.local.col1.body')}</p>
      </div>
      <div class="local-col">
        <h3>{$t('home.local.col2.title')}</h3>
        <p>{$t('home.local.col2.body')}</p>
      </div>
      <div class="local-col">
        <h3>{$t('home.local.col3.title')}</h3>
        <p>{$t('home.local.col3.body')}</p>
      </div>
    </div>
  </div>
</section>

<section id="pricing" class="pricing">
  <div class="wrap">
    <h2>{$t('home.pricing.title')}</h2>
    <p class="lead">{$t('home.pricing.lead')}</p>
    <div class="plans">
      <div class="plan">
        <p class="plan-tag">{$t('home.pricing.monthly.tag')}</p>
        <h3>{$t('home.pricing.monthly.name')}</h3>
        <p class="plan-price">{$t('home.pricing.monthly.price')}<span class="plan-unit muted">{$t('home.pricing.monthly.unit')} USD</span></p>
        <ul class="plan-features">
          <li>{$t('home.pricing.monthly.f1')}</li>
          <li>{$t('home.pricing.monthly.f2')}</li>
          <li>{$t('home.pricing.monthly.f3')}</li>
        </ul>
        <button
          type="button"
          class="button"
          data-product={MONTHLY_ID}
          aria-busy={busy === MONTHLY_ID}
          disabled={busy !== null}
          on:click={() => checkout(MONTHLY_ID)}
        >
          {busy === MONTHLY_ID ? $t('home.pricing.monthly.busy') : $t('home.pricing.monthly.button')}
        </button>
      </div>
      <div class="plan featured">
        <p class="plan-tag">{$t('home.pricing.yearly.tag')}</p>
        <h3>{$t('home.pricing.yearly.name')}</h3>
        <p class="plan-price">{$t('home.pricing.yearly.price')}<span class="plan-unit muted">{$t('home.pricing.yearly.unit')} USD</span></p>
        <ul class="plan-features">
          <li>{$t('home.pricing.yearly.f1')}</li>
          <li>{$t('home.pricing.yearly.f2')}</li>
          <li>{$t('home.pricing.yearly.f3')}</li>
        </ul>
        <button
          type="button"
          class="button"
          data-product={YEARLY_ID}
          aria-busy={busy === YEARLY_ID}
          disabled={busy !== null}
          on:click={() => checkout(YEARLY_ID)}
        >
          {busy === YEARLY_ID ? $t('home.pricing.yearly.busy') : $t('home.pricing.yearly.button')}
        </button>
      </div>
    </div>
    {#if checkoutError}
      <p class="pricing-error">{$t('home.pricing.error')}{#if serverError} ({serverError}){/if}</p>
    {/if}
    <p class="fine muted">{fine.pre}<a href="https://polar.sh/matpb/portal/request">{fine.link}</a>{fine.post}</p>
  </div>
</section>

<section id="download" class="download">
  <div class="wrap">
    <h2>{$t('home.download.title', { version })}</h2>
    <p class="lead">{$t('home.download.lead')}</p>
    <div class="platforms">
      <a class="platform" class:detected={detected === 'mac'} href={macUrl}>
        {#if detected === 'mac'}<span class="detected-tag">{$t('home.download.detected')}</span>{/if}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.05 12.04c-.03-2.91 2.38-4.31 2.49-4.38-1.36-1.99-3.48-2.26-4.23-2.29-1.8-.18-3.51 1.06-4.43 1.06-.92 0-2.32-1.04-3.82-1.01-1.96.03-3.78 1.14-4.79 2.9-2.04 3.54-.52 8.78 1.47 11.66.97 1.41 2.13 2.99 3.65 2.93 1.46-.06 2.02-.95 3.79-.95 1.77 0 2.27.95 3.82.92 1.58-.03 2.58-1.43 3.55-2.85 1.12-1.63 1.58-3.21 1.6-3.29-.04-.02-3.07-1.18-3.1-4.7zM14.27 3.5c.81-.98 1.35-2.34 1.2-3.7-1.16.05-2.57.78-3.41 1.75-.75.86-1.41 2.25-1.23 3.58 1.3.1 2.62-.66 3.44-1.63z"/></svg>
        <span class="platform-label"><span>{$t('home.download.mac')}</span><span class="muted">{$t('home.download.mac_arch')}</span></span>
      </a>
      <a class="platform" class:detected={detected === 'windows'} href={windowsUrl}>
        {#if detected === 'windows'}<span class="detected-tag">{$t('home.download.detected')}</span>{/if}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M0 3.45L9.8 2.1v9.45H0V3.45zm0 17.1l9.8 1.35v-9.3H0v7.95zm10.875 1.5L24 24V12.6H10.875v9.45zM10.875 2.1V11.55H24V0L10.875 2.1z"/></svg>
        <span class="platform-label"><span>{$t('home.download.windows')}</span><span class="muted">{$t('home.download.windows_arch')}</span></span>
      </a>
      <a class="platform" class:detected={detected === 'linux'} href={linuxUrl}>
        {#if detected === 'linux'}<span class="detected-tag">{$t('home.download.detected')}</span>{/if}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 1.78.66 3.4 1.74 4.65.32.36.5.83.5 1.31v3.04c0 .46.28.87.71 1.04l3.45 1.38c.39.16.83.16 1.22 0l3.45-1.38c.43-.17.71-.58.71-1.04v-3.04c0-.48.18-.95.5-1.31C18.34 12.4 19 10.78 19 9c0-3.87-3.13-7-7-7zm-2.5 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM12 16l-2-1.5h4L12 16z"/></svg>
        <span class="platform-label"><span>{$t('home.download.linux')}</span><span class="muted">{$t('home.download.linux_arch')}</span></span>
      </a>
    </div>
    <p class="muted released">{$t('home.download.released', { date: fmtDate(pubDate, { dateStyle: 'long' }) })}</p>
    <a class="text-link" href="https://github.com/matpb/cortexmind.net/releases">{$t('home.download.all')}</a>

    <div class="requirements">
      <h3>{$t('home.requirements.title')}</h3>
      <dl class="requirements-list">
        <div class="req-row"><dt>{$t('home.requirements.ram_key')}</dt><dd>{$t('home.requirements.ram_val')}</dd></div>
        <div class="req-row"><dt>{$t('home.requirements.cpu_key')}</dt><dd>{$t('home.requirements.cpu_val')}</dd></div>
        <div class="req-row"><dt>{$t('home.requirements.gpu_key')}</dt><dd>{$t('home.requirements.gpu_val')}</dd></div>
        <div class="req-row"><dt>{$t('home.requirements.disk_key')}</dt><dd>{$t('home.requirements.disk_val')}</dd></div>
        <div class="req-row"><dt>{$t('home.requirements.os_key')}</dt><dd>{$t('home.requirements.os_val')}</dd></div>
      </dl>
      <p class="muted">{$t('home.requirements.note')}</p>
    </div>
  </div>
</section>

<section class="faq">
  <div class="wrap">
    <h2>{$t('home.faq.title')}</h2>
    <div class="faq-list">
      <details><summary>{$t('home.faq.q1')}</summary><p>{$t('home.faq.a1')}</p></details>
      <details><summary>{$t('home.faq.q2')}</summary><p>{$t('home.faq.a2')}</p></details>
      <details><summary>{$t('home.faq.q3')}</summary><p>{$t('home.faq.a3')}</p></details>
      <details><summary>{$t('home.faq.q4')}</summary><p>{$t('home.faq.a4')}</p></details>
      <details><summary>{$t('home.faq.q5')}</summary><p>{$t('home.faq.a5')}</p></details>
      <details><summary>{$t('home.faq.q6')}</summary><p>{$t('home.faq.a6')}</p></details>
      <details><summary>{$t('home.faq.q7')}</summary><p>{$t('home.faq.a7')}</p></details>
      <details><summary>{$t('home.faq.q8')}</summary><p>{$t('home.faq.a8')}</p></details>
    </div>
  </div>
</section>

<section class="cta-band">
  <img src="/media/knot.jpg" alt={$t('home.cta.image_alt')} class="cta-image" loading="lazy" width="1792" height="1008" />
  <div class="cta-overlay" aria-hidden="true"></div>
  <div class="wrap cta-content">
    <h2>{$t('home.cta.title')}</h2>
    <p class="lead">{$t('home.cta.lead')}</p>
    <a class="button" href="#pricing">{$t('home.cta.button')}</a>
  </div>
</section>

<style>
  .lead { font-size: 19px; color: var(--text-2); max-width: 520px; }

  /* Hero: forces dark tokens locally so it stays dark in the light theme. */
  .hero {
    position: relative;
    min-height: 100svh;
    display: flex;
    align-items: center;
    overflow: hidden;
    border-bottom: none;
    padding: 0;
    color-scheme: dark;
    --bg: #12161B; --panel: #1A1F26; --panel-2: #222831; --text: #EEE8DA; --text-2: #CFC7B6;
    --muted: #9A9486; --muted-2: #7C776B; --line: #2B323B; --line-2: #3A424D;
    background: var(--bg);
  }
  .hero-media { position: absolute; inset: 0; z-index: 0; }
  .hero-poster, .hero-media video {
    position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
    animation: hero-drift 36s ease-in-out infinite alternate;
  }
  .hero-media video { opacity: 0; }
  @keyframes hero-drift { from { transform: scale(1); } to { transform: scale(1.08); } }
  .hero-gradient {
    position: absolute; inset: 0;
    background: linear-gradient(90deg, rgba(18,22,27,.94) 0%, rgba(18,22,27,.72) 55%, rgba(18,22,27,.15) 100%),
      linear-gradient(to bottom, transparent calc(100% - 260px), var(--bg) 100%);
  }
  .hero-content { position: relative; z-index: 1; padding-top: 150px; padding-bottom: 80px; max-width: 640px; }
  .hero-content h1 { text-shadow: 0 2px 24px rgba(0,0,0,.45); }
  .hero-actions { display: flex; gap: 14px; margin-top: 32px; flex-wrap: wrap; }
  .hero .lead { margin-top: 22px; }
  .hero .fine { margin-top: 18px; font-size: 13px; }

  @media (prefers-reduced-motion: reduce) {
    .hero-media video { display: none; }
    .hero-poster { animation: none; }
  }

  /* Client band */
  .clients { padding: 40px 0; }
  .clients-row { display: flex; flex-wrap: wrap; align-items: center; gap: 28px; font-size: 14px; color: var(--text-2); }

  /* Problem photo band */
  .problem-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
  .problem-image { width: 100%; height: auto; border-radius: 10px; display: block; }
  .problem-text p { color: var(--text-2); margin-top: 16px; }
  .problem-text h2 { margin-bottom: 8px; }
  .text-link { color: var(--gold-text); text-decoration: underline; text-decoration-color: var(--gold); text-underline-offset: 5px; display: inline-block; margin-top: 8px; }

  /* How it works: dark band + step columns */
  .how-band {
    position: relative; overflow: hidden; padding: 96px 0;
    color-scheme: dark;
    --bg: #12161B; --panel: #1A1F26; --panel-2: #222831; --text: #EEE8DA; --text-2: #CFC7B6;
    --muted: #9A9486; --muted-2: #7C776B; --line: #2B323B; --line-2: #3A424D;
    background: var(--bg); color: var(--text); border-bottom: none;
  }
  .how-band-image { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .28; }
  .how-band-overlay { position: absolute; inset: 0; background: rgba(18,22,27,.72); }
  .how-band-content { position: relative; z-index: 1; }
  .how-band .lead { margin-top: 14px; max-width: 560px; }

  .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 48px; }
  .step { border-top: 1px solid var(--gold-line); padding-top: 20px; }
  .step-number { font-family: 'JetBrains Mono Variable', monospace; color: var(--gold-text); font-size: 14px; }
  .step h3 { margin: 10px 0 8px; }
  .step p { color: var(--text-2); }

  /* Retrieval feature split */
  .retrieval-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
  .retrieval-text p { color: var(--text-2); margin-top: 16px; }
  .retrieval-text h2 { margin-bottom: 8px; }
  .retrieval-visual { position: relative; }
  .retrieval-image { width: 100%; height: auto; border-radius: 10px; display: block; }
  .transcript {
    position: relative; margin: -48px 0 0 -40px; width: calc(100% - 24px);
    background: var(--code-bg); border: 1px solid var(--line); border-radius: 10px; overflow: hidden;
  }
  .transcript-head {
    display: flex; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--line);
    font-family: 'JetBrains Mono Variable', monospace; font-size: 11px; color: var(--text-2);
  }
  .transcript-body { padding: 16px; display: grid; gap: 14px; }
  .transcript-query { font-family: 'JetBrains Mono Variable', monospace; font-size: 13px; color: var(--code-text); margin: 0; }
  .transcript-hit { display: grid; gap: 3px; }
  .hit-meta { font-family: 'JetBrains Mono Variable', monospace; font-size: 12px; color: var(--gold-text); margin: 0; }
  .hit-text { font-size: 13px; color: var(--text-2); margin: 0; max-width: none; }

  /* Boot card */
  .boot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
  .boot-text p { color: var(--text-2); margin-top: 16px; }
  .boot-text h2 { margin-bottom: 8px; }
  .boot-card { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 24px; }
  .boot-card-head { font-family: 'JetBrains Mono Variable', monospace; font-size: 13px; color: var(--gold-text); margin-bottom: 18px; }
  .boot-card-label { font-size: 12px; margin: 0 0 8px; }
  .boot-card-rules { list-style: none; margin: 0 0 18px; padding: 0; display: grid; gap: 8px; font-size: 14px; }
  .boot-card-rules li { position: relative; padding-left: 16px; }
  .boot-card-rules li::before { content: ''; position: absolute; left: 0; top: 8px; width: 5px; height: 5px; border-radius: 50%; background: var(--gold); }
  .boot-card-recent { font-size: 13px; margin: 0 0 6px; }

  /* Dashboard */
  .dashboard-frame {
    border: 1px solid var(--line); border-radius: 12px; overflow: hidden;
    box-shadow: 0 25px 70px rgba(0,0,0,.35);
  }
  .dashboard-frame img { display: block; width: 100%; height: auto; }
  .dashboard-text { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 40px; }
  .dashboard-text p { color: var(--text-2); max-width: none; }

  /* Local */
  .local h2 { margin-bottom: 40px; }
  .local-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
  .local-col { border-left: 1px solid var(--line); padding: 0 32px; }
  .local-col:first-child { border-left: none; padding-left: 0; }
  .local-col h3 { margin-bottom: 10px; }
  .local-col p { color: var(--text-2); }

  /* Pricing */
  .pricing .lead { margin-top: 12px; max-width: 560px; }
  .plans { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 48px; }
  .plan { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 32px; }
  .plan.featured { border-color: var(--gold-line); background: linear-gradient(160deg, var(--gold-soft), var(--panel) 60%); }
  .plan-tag { color: var(--gold-text); font-size: 13px; margin-bottom: 10px; }
  .plan h3 { margin-bottom: 14px; }
  .plan-price { font-family: 'Fraunces Variable', serif; font-size: 56px; font-weight: 400; margin-bottom: 20px; display: flex; align-items: baseline; gap: 8px; }
  .plan-unit { font-size: 14px; }
  .plan-features { list-style: none; margin: 0 0 24px; padding: 0; display: grid; gap: 10px; font-size: 14px; }
  .plan-features li { position: relative; padding-left: 24px; }
  .plan-features li::before { content: '✓'; position: absolute; left: 0; color: var(--gold); }
  .plan .button { width: 100%; }
  .pricing-error { color: var(--gold-text); margin-top: 20px; }
  .pricing .fine { margin-top: 24px; font-size: 13px; }
  .pricing .fine a { color: var(--gold-text); text-decoration: underline; }

  /* Download */
  .platforms { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 36px; }
  .platform {
    display: flex; align-items: center; gap: 14px; position: relative;
    border: 1px solid var(--line-2); border-radius: 8px; padding: 16px 18px; color: var(--text);
  }
  .platform.detected { border-color: var(--gold); }
  .detected-tag {
    position: absolute; top: -10px; left: 14px; background: var(--gold); color: var(--on-gold);
    font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 600;
  }
  .platform-label { display: flex; flex-direction: column; gap: 2px; font-size: 14px; }
  .platform-label span:last-child { font-size: 12px; }
  .released { margin-top: 20px; font-size: 13px; }
  .download .text-link { margin-top: 4px; }

  .requirements { margin-top: 64px; border-top: 1px solid var(--line); padding-top: 40px; }
  .requirements h3 { margin-bottom: 20px; }
  .requirements-list { margin: 0 0 20px; }
  .req-row { display: flex; gap: 16px; padding: 8px 0; border-bottom: 1px solid var(--line); font-size: 14px; }
  .req-row dt { font-family: 'JetBrains Mono Variable', monospace; color: var(--text-2); width: 110px; flex-shrink: 0; margin: 0; }
  .req-row dd { margin: 0; color: var(--text-2); }

  /* FAQ */
  .faq h2 { margin-bottom: 24px; }
  .faq-list { display: grid; }
  .faq-list details { border-bottom: 1px solid var(--line); padding: 18px 0; }
  .faq-list summary {
    font-family: 'Space Grotesk Variable', sans-serif; font-size: 17px; cursor: pointer;
    display: flex; justify-content: space-between; align-items: center; list-style: none;
  }
  .faq-list summary::-webkit-details-marker { display: none; }
  .faq-list summary::after { content: '+'; color: var(--gold-text); font-size: 20px; transition: transform .15s; }
  .faq-list details[open] summary::after { content: '−'; }
  .faq-list p { color: var(--text-2); margin-top: 14px; }

  /* CTA band */
  .cta-band {
    position: relative; overflow: hidden; padding: 120px 0; text-align: center; border-bottom: none;
    color-scheme: dark;
    --bg: #12161B; --panel: #1A1F26; --panel-2: #222831; --text: #EEE8DA; --text-2: #CFC7B6;
    --muted: #9A9486; --muted-2: #7C776B; --line: #2B323B; --line-2: #3A424D;
    background: var(--bg); color: var(--text);
  }
  .cta-image { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .cta-overlay { position: absolute; inset: 0; background: rgba(18,22,27,.68); }
  .cta-content { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 20px; }
  .cta-content .lead { max-width: 480px; }

  @media (max-width: 800px) {
    .problem-grid, .retrieval-grid, .boot-grid, .steps-grid, .local-grid, .plans, .platforms, .dashboard-text {
      grid-template-columns: 1fr;
    }
    .transcript { margin: 24px 0 0; width: 100%; }
    .local-col { border-left: none; border-top: 1px solid var(--line); padding: 24px 0 0; }
    .local-col:first-child { border-top: none; padding-top: 0; }
    .hero-content { padding-top: 120px; }
  }
</style>
