<script lang="ts">
  import { t, fmtDate, href } from '$lib/i18n';
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

  let detected: 'mac' | 'windows' | 'linux' | null = null;
  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent;
    if (/Mac OS X|Macintosh/.test(ua)) detected = 'mac';
    else if (/Windows/.test(ua)) detected = 'windows';
    else if (/Linux/.test(ua)) detected = 'linux';
  }
</script>

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
  <div class="wrap ai-cta">
    <h3>{$t('home.how.ai_title')}</h3>
    <p>{$t('home.how.ai_body')}</p>
    <a class="button" href={$href('/docs') + '#ai-install'}>{$t('home.how.ai_button')}</a>
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
      <a href="/media/dashboard-1440.png" target="_blank" rel="noopener" class="dashboard-scroll">
        <img src="/media/dashboard-1440.png" alt={$t('home.dashboard.image_alt')} loading="eager" decoding="async" width="1440" height="900" />
      </a>
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
    <p class="fine muted">{$t('home.pricing.fine_pre')}<a href="https://polar.sh/matpb/portal/request">{$t('home.pricing.fine_link')}</a>{$t('home.pricing.fine_post')}</p>
  </div>
</section>

<section id="download" class="download">
  <div class="wrap">
    <h2>{$t('home.download.title', { version })}</h2>
    <p class="lead">{$t('home.download.lead')}</p>
    <div class="platforms">
      <a class="platform" class:detected={detected === 'mac'} href={macUrl}>
        {#if detected === 'mac'}<span class="detected-tag">{$t('home.download.detected')}</span>{/if}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>
        <span class="platform-label"><span>{$t('home.download.mac')}</span><span class="muted">{$t('home.download.mac_arch')}</span></span>
      </a>
      <a class="platform" class:detected={detected === 'windows'} href={windowsUrl}>
        {#if detected === 'windows'}<span class="detected-tag">{$t('home.download.detected')}</span>{/if}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="1" y="1" width="10" height="10" /><rect x="13" y="1" width="10" height="10" /><rect x="1" y="13" width="10" height="10" /><rect x="13" y="13" width="10" height="10" /></svg>
        <span class="platform-label"><span>{$t('home.download.windows')}</span><span class="muted">{$t('home.download.windows_arch')}</span></span>
      </a>
      <a class="platform" class:detected={detected === 'linux'} href={linuxUrl}>
        {#if detected === 'linux'}<span class="detected-tag">{$t('home.download.detected')}</span>{/if}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071.771-.06 1.592-.536 2.257-1.306.631-.765 1.683-1.084 2.378-1.503.348-.199.629-.469.649-.853.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.357.357 0 00-.19-.064c.431-1.278.264-2.55-.173-3.694-.533-1.41-1.465-2.638-2.175-3.483-.796-1.005-1.576-1.957-1.56-3.368.026-2.152.236-6.133-3.544-6.139zm.529 3.405h.013c.213 0 .396.062.584.198.19.135.33.332.438.533.105.259.158.459.166.724 0-.02.006-.04.006-.06v.105a.086.086 0 01-.004-.021l-.004-.024a1.807 1.807 0 01-.15.706.953.953 0 01-.213.335.71.71 0 00-.088-.042c-.104-.045-.198-.064-.284-.133a1.312 1.312 0 00-.22-.066c.05-.06.146-.133.183-.198.053-.128.082-.264.088-.402v-.02a1.21 1.21 0 00-.061-.4c-.045-.134-.101-.2-.183-.333-.084-.066-.167-.132-.267-.132h-.016c-.093 0-.176.03-.262.132a.8.8 0 00-.205.334 1.18 1.18 0 00-.09.4v.019c.002.089.008.179.02.267-.193-.067-.438-.135-.607-.202a1.635 1.635 0 01-.018-.2v-.02a1.772 1.772 0 01.15-.768c.082-.22.232-.406.43-.533a.985.985 0 01.594-.2zm-2.962.059h.036c.142 0 .27.048.399.135.146.129.264.288.344.465.09.199.14.4.153.667v.004c.007.134.006.2-.002.266v.08c-.03.007-.056.018-.083.024-.152.055-.274.135-.393.2.012-.09.013-.18.003-.267v-.015c-.012-.133-.04-.2-.082-.333a.613.613 0 00-.166-.267.248.248 0 00-.183-.064h-.021c-.071.006-.13.04-.186.132a.552.552 0 00-.12.27.944.944 0 00-.023.33v.015c.012.135.037.2.08.334.046.134.098.2.166.268.01.009.02.018.034.024-.07.057-.117.07-.176.136a.304.304 0 01-.131.068 2.62 2.62 0 01-.275-.402 1.772 1.772 0 01-.155-.667 1.759 1.759 0 01.08-.668 1.43 1.43 0 01.283-.535c.128-.133.26-.2.418-.2zm1.37 1.706c.332 0 .733.065 1.216.399.293.2.523.269 1.052.468h.003c.255.136.405.266.478.399v-.131a.571.571 0 01.016.47c-.123.31-.516.643-1.063.842v.002c-.268.135-.501.333-.775.465-.276.135-.588.292-1.012.267a1.139 1.139 0 01-.448-.067 3.566 3.566 0 01-.322-.198c-.195-.135-.363-.332-.612-.465v-.005h-.005c-.4-.246-.616-.512-.686-.71-.07-.268-.005-.47.193-.6.224-.135.38-.271.483-.336.104-.074.143-.102.176-.131h.002v-.003c.169-.202.436-.47.839-.601.139-.036.294-.065.466-.065zm2.8 2.142c.358 1.417 1.196 3.475 1.735 4.473.286.534.855 1.659 1.102 3.024.156-.005.33.018.513.064.646-1.671-.546-3.467-1.089-3.966-.22-.2-.232-.335-.123-.335.59.534 1.365 1.572 1.646 2.757.13.535.16 1.104.021 1.67.067.028.135.06.205.067 1.032.534 1.413.938 1.23 1.537v-.043c-.06-.003-.12 0-.18 0h-.016c.151-.467-.182-.825-1.065-1.224-.915-.4-1.646-.336-1.77.465-.008.043-.013.066-.018.135-.068.023-.139.053-.209.064-.43.268-.662.669-.793 1.187-.13.533-.17 1.156-.205 1.869v.003c-.02.334-.17.838-.319 1.35-1.5 1.072-3.58 1.538-5.348.334a2.645 2.645 0 00-.402-.533 1.45 1.45 0 00-.275-.333c.182 0 .338-.03.465-.067a.615.615 0 00.314-.334c.108-.267 0-.697-.345-1.163-.345-.467-.931-.995-1.788-1.521-.63-.4-.986-.87-1.15-1.396-.165-.534-.143-1.085-.015-1.645.245-1.07.873-2.11 1.274-2.763.107-.065.037.135-.408.974-.396.751-1.14 2.497-.122 3.854a8.123 8.123 0 01.647-2.876c.564-1.278 1.743-3.504 1.836-5.268.048.036.217.135.289.202.218.133.38.333.59.465.21.201.477.335.876.335.039.003.075.006.11.006.412 0 .73-.134.997-.268.29-.134.52-.334.74-.4h.005c.467-.135.835-.402 1.044-.7zm2.185 8.958c.037.6.343 1.245.882 1.377.588.134 1.434-.333 1.791-.765l.211-.01c.315-.007.577.01.847.268l.003.003c.208.199.305.53.391.876.085.4.154.78.409 1.066.486.527.645.906.636 1.14l.003-.007v.018l-.003-.012c-.015.262-.185.396-.498.595-.63.401-1.746.712-2.457 1.57-.618.737-1.37 1.14-2.036 1.191-.664.053-1.237-.2-1.574-.898l-.005-.003c-.21-.4-.12-1.025.056-1.69.176-.668.428-1.344.463-1.897.037-.714.076-1.335.195-1.814.12-.465.308-.797.641-.984l.045-.022zm-10.814.049h.01c.053 0 .105.005.157.014.376.055.706.333 1.023.752l.91 1.664.003.003c.243.533.754 1.064 1.189 1.637.434.598.77 1.131.729 1.57v.006c-.057.744-.48 1.148-1.125 1.294-.645.135-1.52.002-2.395-.464-.968-.536-2.118-.469-2.857-.602-.369-.066-.61-.2-.723-.4-.11-.2-.113-.602.123-1.23v-.004l.002-.003c.117-.334.03-.752-.027-1.118-.055-.401-.083-.71.043-.94.16-.334.396-.4.69-.533.294-.135.64-.202.915-.47h.002v-.002c.256-.268.445-.601.668-.838.19-.201.38-.336.663-.336zm7.159-9.074c-.435.201-.945.535-1.488.535-.542 0-.97-.267-1.28-.466-.154-.134-.28-.268-.373-.335-.164-.134-.144-.333-.074-.333.109.016.129.134.199.2.096.066.215.2.36.333.292.2.68.467 1.167.467.485 0 1.053-.267 1.398-.466.195-.135.445-.334.648-.467.156-.136.149-.267.279-.267.128.016.034.134-.147.332a8.097 8.097 0 01-.69.468zm-1.082-1.583V5.64c-.006-.02.013-.042.029-.05.074-.043.18-.027.26.004.063 0 .16.067.15.135-.006.049-.085.066-.135.066-.055 0-.092-.043-.141-.068-.052-.018-.146-.008-.163-.065zm-.551 0c-.02.058-.113.049-.166.066-.047.025-.086.068-.14.068-.05 0-.13-.02-.136-.068-.01-.066.088-.133.15-.133.08-.031.184-.047.259-.005.019.009.036.03.03.05v.02h.003z"/></svg>
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
      <details><summary>{$t('home.faq.q9')}</summary><p>{$t('home.faq.a9')}</p></details>
      <details><summary>{$t('home.faq.q10')}</summary><p>{$t('home.faq.a10')}</p></details>
      <details><summary>{$t('home.faq.q11')}</summary><p>{$t('home.faq.a11')} <a class="text-link" href="https://ethertunnel.com" target="_blank" rel="noopener">{$t('home.faq.a11_link')}</a></p></details>
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
    --gold-text: #E4B454; --gold-soft: #2B2519; --code-bg: #0C0F13; --code-text: #E7C99E;
    background: var(--bg); color: var(--text);
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
    --gold-text: #E4B454; --gold-soft: #2B2519; --code-bg: #0C0F13; --code-text: #E7C99E;
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

  .ai-cta {
    margin-top: 48px;
    padding: 32px;
    border: 1px solid var(--gold-line);
    background: var(--gold-soft);
    border-radius: 12px;
  }
  .ai-cta h3 { font-size: 28px; }
  .ai-cta p { color: var(--text-2); max-width: 60ch; margin-top: 10px; }
  .ai-cta .button { margin-top: 20px; min-height: 48px; font-size: 16px; }

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
  .dashboard-scroll { display: block; }
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
    --gold-text: #E4B454; --gold-soft: #2B2519; --code-bg: #0C0F13; --code-text: #E7C99E;
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
    .dashboard-frame { overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .dashboard-scroll { width: 1100px; }
    .dashboard-frame img { width: 1100px; max-width: none; }
    .local-col { border-left: none; border-top: 1px solid var(--line); padding: 24px 0 0; }
    .local-col:first-child { border-top: none; padding-top: 0; }
    .hero-content { padding-top: 120px; }
  }
</style>
