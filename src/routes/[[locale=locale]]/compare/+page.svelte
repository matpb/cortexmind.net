<script lang="ts">
  import { t, href, type MessageKey } from '$lib/i18n';

  const MEMORY_ROWS: { name: MessageKey; where: MessageKey; find: MessageKey; url: string | null }[] = [
    {
      name: 'compare.what.claude_code.name',
      where: 'compare.what.claude_code.where',
      find: 'compare.what.claude_code.find',
      url: 'https://code.claude.com/docs/en/memory'
    },
    {
      name: 'compare.what.codex.name',
      where: 'compare.what.codex.where',
      find: 'compare.what.codex.find',
      url: 'https://learn.chatgpt.com/docs/customization/memories.md'
    },
    {
      name: 'compare.what.claude_ai.name',
      where: 'compare.what.claude_ai.where',
      find: 'compare.what.claude_ai.find',
      url: 'https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context'
    },
    {
      name: 'compare.what.chatgpt.name',
      where: 'compare.what.chatgpt.where',
      find: 'compare.what.chatgpt.find',
      url: 'https://help.openai.com/en/articles/8590148-memory-in-chatgpt'
    },
    {
      name: 'compare.what.cortexmind.name',
      where: 'compare.what.cortexmind.where',
      find: 'compare.what.cortexmind.find',
      url: null
    }
  ];

  const SAVE_ROWS: { label: MessageKey; b: number; c: number; total?: boolean }[] = [
    { label: 'compare.save.r_told', b: 92, c: 100 },
    { label: 'compare.save.r_passing', b: 17, c: 75 },
    { label: 'compare.save.r_detail', b: 8, c: 92 },
    { label: 'compare.save.r_total', b: 39, c: 89, total: true }
  ];

  const STAGES: { stage: MessageKey; result: MessageKey; n: number; b: number; c: number }[] = [
    { stage: 'compare.test.stage_small', result: 'compare.test.result_small', n: 39, b: 81, c: 81 },
    { stage: 'compare.test.stage_serious', result: 'compare.test.result_serious', n: 33, b: 68, c: 73 },
    { stage: 'compare.test.stage_large', result: 'compare.test.result_large', n: 33, b: 68, c: 78 }
  ];

  const MORE: { title: MessageKey; body: MessageKey; icon: string }[] = [
    {
      title: 'compare.more.item1.title',
      body: 'compare.more.item1.body',
      icon: '<path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 12 10 5 10-5"/><path d="m2 17 10 5 10-5"/>'
    },
    {
      title: 'compare.more.item2.title',
      body: 'compare.more.item2.body',
      icon: '<circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M6 9v6"/><path d="M18 9a9 9 0 0 1-9 9"/>'
    },
    {
      title: 'compare.more.item3.title',
      body: 'compare.more.item3.body',
      icon: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4"/><path d="m15.4 6.5-6.8 4"/>'
    },
    {
      title: 'compare.more.item5.title',
      body: 'compare.more.item5.body',
      icon: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>'
    }
  ];

  // Bars render full without JS; the entrance only runs once the panel scrolls into view.
  function reveal(node: HTMLElement) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      return { destroy() {} };
    }
    node.classList.add('pre');
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          node.classList.remove('pre');
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(node);
    return { destroy: () => io.disconnect() };
  }
</script>

<section class="cmp-hero on-art">
  <img class="hero-img" src="/media/compare-hero.jpg" alt={$t('compare.art.hero_alt')} width="1672" height="941" fetchpriority="high" />
  <div class="hero-shade" aria-hidden="true"></div>
  <div class="wrap hero-copy">
    <div class="hero-inner">
      <p class="eyebrow">{$t('compare.eyebrow')}</p>
      <h1>{$t('compare.title')}</h1>
      <p class="hero-lead">{$t('compare.lead')}</p>
      <div class="stats">
        <div class="stat"><b>39%</b><span>{$t('compare.test.col_builtin')}</span></div>
        <div class="stat ours"><b>89%</b><span>{$t('compare.test.col_cortex')}</span></div>
      </div>
      <p class="stat-label">{$t('compare.hero.stat_label')}</p>
      <p class="updated">{$t('compare.updated')}</p>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>{$t('compare.what.title')}</h2>
    <div class="mem-grid">
      {#each MEMORY_ROWS as row (row.name)}
        <article class="mem" class:ours={!row.url}>
          <h3>{$t(row.name)}</h3>
          <dl>
            <div><dt>{$t('compare.what.col_where')}</dt><dd>{$t(row.where)}</dd></div>
            <div><dt>{$t('compare.what.col_find')}</dt><dd>{$t(row.find)}</dd></div>
          </dl>
          {#if row.url}<a class="text-link" href={row.url} target="_blank" rel="noopener">{$t('compare.what.source')}</a>{/if}
        </article>
      {/each}
    </div>
  </div>
</section>

<section class="block band-section">
  <img class="band band-save" src="/media/compare-save.jpg" alt={$t('compare.art.save_alt')} loading="lazy" width="1672" height="941" />
  <div class="wrap split">
    <div class="copy">
      <h2>{$t('compare.save.title')}</h2>
      <p>{$t('compare.save.p1')}</p>
      <p>{$t('compare.save.p2')}</p>
    </div>
    <div class="panel" use:reveal>
      <div class="legend">
        <span><i class="swatch b"></i>{$t('compare.test.col_builtin')}</span>
        <span><i class="swatch c"></i>{$t('compare.test.col_cortex')}</span>
      </div>
      <p class="bars-head">{$t('compare.save.col_kind')}</p>
      {#each SAVE_ROWS as row (row.label)}
        <div class="bar-row" class:total={row.total}>
          <p class="bar-label">{$t(row.label)}</p>
          <div class="bar-line" role="img" aria-label="{$t('compare.test.col_builtin')}: {row.b}%">
            <div class="track"><div class="bar b" style="width: {row.b}%"></div></div><span>{row.b}%</span>
          </div>
          <div class="bar-line" role="img" aria-label="{$t('compare.test.col_cortex')}: {row.c}%">
            <div class="track"><div class="bar c" style="width: {row.c}%"></div></div><span>{row.c}%</span>
          </div>
        </div>
      {/each}
    </div>
  </div>
  <div class="wrap"><p class="pull">{$t('compare.save.read')}</p></div>
</section>

<section class="block band-section">
  <img class="band band-search" src="/media/compare-search.jpg" alt={$t('compare.art.search_alt')} loading="lazy" width="1672" height="941" />
  <div class="wrap split flip">
    <div class="copy">
      <h2>{$t('compare.test.title')}</h2>
      <p>{$t('compare.test.p1')}</p>
      <p>{$t('compare.test.p2')}</p>
      <p>{$t('compare.test.p3')}</p>
    </div>
    <figure class="panel chart" aria-label={$t('compare.test.chart_alt')} use:reveal>
      <div class="legend">
        <span><i class="swatch n"></i>{$t('compare.test.legend_normal')}</span>
        <span><i class="swatch h"></i>{$t('compare.test.legend_all')}</span>
        <span><i class="swatch c"></i>{$t('compare.test.col_cortex')}</span>
      </div>
      <div class="groups">
        {#each STAGES as row (row.stage)}
          <div class="group">
            <div class="plot" aria-hidden="true">
              <div class="col n" style="height: {row.n}%" title={$t('compare.test.legend_normal')}></div>
              <div class="col b" style="height: {row.b}%" title={$t('compare.test.legend_all')}></div>
              <div class="col c" style="height: {row.c}%" title={$t('compare.test.col_cortex')}></div>
            </div>
            <p class="stage-name">{$t(row.stage)}</p>
            <p class="stage-result">{$t(row.result)}</p>
          </div>
        {/each}
      </div>
      <figcaption>{$t('compare.test.chart_note')}</figcaption>
    </figure>
  </div>
</section>

<section class="block tint">
  <div class="wrap">
    <h2>{$t('compare.more.title')}</h2>
    <div class="more-grid">
      {#each MORE as item (item.title)}
        <article class="feat">
          <span class="chip" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">{@html item.icon}</svg>
          </span>
          <h3>{$t(item.title)}</h3>
          <p>{$t(item.body)}</p>
        </article>
      {/each}
    </div>
  </div>
</section>

<section class="block note">
  <div class="wrap note-inner">
    <h2>{$t('compare.note.title')}</h2>
    <p>{$t('compare.note.p')}</p>
  </div>
</section>

<section class="cta-band">
  <img src="/media/knot.jpg" alt={$t('home.cta.image_alt')} class="cta-image" loading="lazy" width="1792" height="1008" />
  <div class="cta-overlay" aria-hidden="true"></div>
  <div class="wrap cta-content">
    <h2>{$t('home.cta.title')}</h2>
    <p class="cta-lead">{$t('home.cta.lead')}</p>
    <a class="button" href={$href('/') + '#pricing'}>{$t('home.cta.button')}</a>
  </div>
</section>

<style>
  .on-art { --text: #EEE8DA; --text-2: #CFC7B6; --muted: #A8A294; color: var(--text); }

  .cmp-hero { position: relative; overflow: hidden; padding: 0; border-bottom: 0; background: #0B0E12; }
  .hero-img { position: absolute; top: 0; right: 0; width: 60%; height: 100%; object-fit: cover; object-position: 62% 60%; mask-image: linear-gradient(90deg, transparent, #000 20%); }
  .hero-shade {
    position: absolute; inset: 0;
    background:
      linear-gradient(90deg, rgba(8, 11, 15, .94) 0%, rgba(8, 11, 15, .7) 38%, rgba(8, 11, 15, .1) 56%, rgba(8, 11, 15, .03) 75%),
      linear-gradient(0deg, rgba(8, 11, 15, .72), transparent 36%);
  }
  .hero-copy { position: relative; z-index: 1; padding-top: clamp(88px, 10vw, 136px); padding-bottom: clamp(72px, 8vw, 104px); }
  .hero-inner { max-width: 600px; }
  .eyebrow { margin: 0 0 18px; font-size: 15px; font-weight: 500; letter-spacing: .03em; color: #E4B454; }
  .cmp-hero h1 { font-size: clamp(40px, 5.4vw, 68px); line-height: 1.05; text-shadow: 0 2px 24px rgba(0, 0, 0, .45); }
  .hero-lead { margin-top: 24px; font-size: clamp(17px, 1.5vw, 19px); line-height: 1.6; color: var(--text-2); }
  .stats { display: grid; grid-template-columns: repeat(2, minmax(0, 240px)); gap: 14px; margin-top: 40px; }
  .stat { padding: 22px 24px; border: 1px solid rgba(238, 232, 218, .16); border-radius: 14px; background: rgba(14, 18, 23, .64); backdrop-filter: blur(6px); }
  .stat.ours { border-color: rgba(217, 164, 65, .62); background: rgba(43, 37, 25, .72); }
  .stat b { display: block; font-family: 'Fraunces Variable', Georgia, serif; font-size: clamp(46px, 5vw, 62px); font-weight: 500; line-height: 1; letter-spacing: -.02em; }
  .stat.ours b { color: #E4B454; }
  .stat span { display: block; margin-top: 10px; font-size: 14px; line-height: 1.35; color: var(--text-2); }
  .stat-label { margin-top: 16px; max-width: 500px; font-size: 14px; line-height: 1.5; color: var(--text-2); }
  .updated { margin-top: 28px; font-size: 13px; color: var(--muted); }

  .block { padding: clamp(72px, 9vw, 128px) 0; border-bottom: 0; }
  .block h2 { font-size: clamp(30px, 3.5vw, 44px); line-height: 1.12; margin-bottom: 28px; }
  .tint { background: var(--panel); }

  .mem-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; margin-top: 44px; }
  .mem { display: flex; flex-direction: column; padding: 32px; border: 1px solid var(--line); border-radius: 16px; background: var(--panel); transition: border-color .2s ease, transform .2s ease; }
  .mem:hover { border-color: var(--line-2); transform: translateY(-2px); }
  .mem h3 { margin-bottom: 22px; }
  .mem dl { margin: 0; display: grid; gap: 18px; }
  .mem dt { margin-bottom: 4px; font-size: 13px; font-weight: 500; color: var(--gold-text); }
  .mem dd { margin: 0; font-size: 15.5px; line-height: 1.55; color: var(--text-2); }
  .mem a { margin-top: 22px; align-self: flex-start; font-size: 14px; }
  .mem.ours { grid-column: 1 / -1; border-color: var(--gold-line); background: linear-gradient(115deg, var(--gold-soft), var(--panel) 64%); }
  .mem.ours dl { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px 48px; }

  .band-section { padding-top: 0; }
  .band { display: block; width: 100%; height: clamp(200px, 30vw, 420px); object-fit: cover; }
  .band-save { object-position: center 54%; }
  .band-search { object-position: center 58%; }
  .split { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: clamp(40px, 6vw, 84px); align-items: start; margin-top: clamp(56px, 7vw, 96px); }
  .split.flip { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); }
  .flip .panel { order: -1; }
  .copy p + p { margin-top: 18px; }

  .panel { margin: 0; padding: clamp(22px, 3vw, 38px); border: 1px solid var(--line-2); border-radius: 18px; background: var(--panel); box-shadow: 0 32px 64px -36px rgba(0, 0, 0, .6); }
  .legend { display: flex; flex-wrap: wrap; gap: 10px 26px; margin-bottom: 26px; font-size: 14px; color: var(--text-2); }
  .swatch { display: inline-block; width: 12px; height: 12px; margin-right: 8px; border-radius: 3px; vertical-align: -1px; }
  .swatch.b, .swatch.n, .bar.b, .col.n { background: #4f86c6; }
  .swatch.h, .col.b { background: repeating-linear-gradient(135deg, #4f86c6 0 4px, rgba(79, 134, 198, .35) 4px 8px); }
  .swatch.c, .bar.c, .col.c { background: #bd8a2b; }

  .bars-head { margin: 0 0 6px; font-size: 15px; font-weight: 600; }
  .bar-row { padding: 20px 0; border-top: 1px solid var(--line); }
  .bar-row:last-child { padding-bottom: 0; }
  .bar-label { margin: 0 0 12px; font-size: 15px; color: var(--text-2); }
  .bar-row.total .bar-label { font-weight: 600; color: var(--text); }
  .bar-line { display: grid; grid-template-columns: minmax(0, 1fr) 50px; gap: 12px; align-items: center; margin-top: 8px; font-size: 14px; font-variant-numeric: tabular-nums; text-align: right; }
  .bar-row.total .bar-line { font-size: 16px; font-weight: 600; }
  .track { height: 14px; border-radius: 5px; background: var(--panel-2); text-align: left; }
  .bar { height: 100%; min-width: 3px; border-radius: 5px; transform-origin: left center; transition: transform 1s cubic-bezier(.2, .75, .2, 1); }
  :global(.pre) .bar { transform: scaleX(0); }

  .groups { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(12px, 2.4vw, 28px); }
  .plot { display: flex; align-items: flex-end; justify-content: center; gap: 2px; height: 290px; border-bottom: 1px solid var(--line-2); background: repeating-linear-gradient(0deg, transparent 0 71.5px, var(--line) 71.5px 72.5px); }
  .col { width: clamp(20px, 3.3vw, 40px); border-radius: 4px 4px 0 0; transform-origin: center bottom; transition: transform 1s cubic-bezier(.2, .75, .2, 1); }
  :global(.pre) .col { transform: scaleY(0); }
  .stage-name { margin: 16px 0 4px; font-size: 15px; font-weight: 600; }
  .stage-result { margin: 0; font-size: 14px; line-height: 1.4; color: var(--muted); }
  figcaption { margin-top: 26px; font-size: 13px; line-height: 1.5; color: var(--muted); }

  .pull { position: relative; max-width: 26em; margin: clamp(64px, 8vw, 104px) auto 0; padding-top: 32px; font-family: 'Fraunces Variable', Georgia, serif; font-size: clamp(22px, 2.6vw, 32px); line-height: 1.3; letter-spacing: -.015em; text-align: center; color: var(--text); }
  .pull::before { content: ''; position: absolute; top: 0; left: 50%; width: 56px; height: 2px; margin-left: -28px; background: var(--gold); }

  .more-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; margin-top: 44px; }
  .feat { padding: 32px; border: 1px solid var(--line); border-radius: 16px; background: var(--bg); }
  .chip { display: inline-flex; align-items: center; justify-content: center; width: 46px; height: 46px; margin-bottom: 22px; border-radius: 12px; background: var(--gold-soft); color: var(--gold-text); }
  .feat h3 { margin-bottom: 12px; }

  .note { padding: clamp(56px, 6vw, 80px) 0; }
  .note-inner { text-align: center; }
  .note h2 { font-size: 22px; margin-bottom: 14px; }
  .note p { margin: 0 auto; color: var(--muted); }

  .cta-band {
    position: relative; overflow: hidden; padding: 120px 0; text-align: center; border-bottom: none;
    color-scheme: dark;
    --bg: #12161B; --panel: #1A1F26; --panel-2: #222831; --text: #EEE8DA; --text-2: #CFC7B6;
    --muted: #9A9486; --muted-2: #7C776B; --line: #2B323B; --line-2: #3A424D;
    --gold-text: #E4B454; --gold-soft: #2B2519;
    background: var(--bg); color: var(--text);
  }
  .cta-image { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .cta-overlay { position: absolute; inset: 0; background: rgba(18, 22, 27, .68); }
  .cta-content { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 20px; }
  .cta-lead { max-width: 480px; color: var(--text-2); }

  @media (max-width: 900px) {
    .split, .split.flip { grid-template-columns: minmax(0, 1fr); }
    .flip .panel { order: 0; }
    .hero-img { width: 100%; height: 340px; object-position: 58% 60%; mask-image: none; }
    .hero-shade { height: 340px; bottom: auto; background: linear-gradient(180deg, rgba(11, 14, 18, .05) 0, rgba(11, 14, 18, .15) 240px, #0B0E12 340px); }
    .hero-copy { padding-top: 330px; }
  }
  @media (max-width: 720px) {
    .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .mem-grid, .more-grid, .mem.ours dl { grid-template-columns: minmax(0, 1fr); }
    .mem, .feat { padding: 26px 22px; }
    .plot { height: 220px; background: none; }
  }
  @media (prefers-reduced-motion: reduce) {
    .mem, .bar, .col { transition: none; }
  }
</style>
