<script lang="ts">
  import { t, type MessageKey } from '$lib/i18n';

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

  const MORE: { title: MessageKey; body: MessageKey }[] = [
    { title: 'compare.more.item1.title', body: 'compare.more.item1.body' },
    { title: 'compare.more.item2.title', body: 'compare.more.item2.body' },
    { title: 'compare.more.item3.title', body: 'compare.more.item3.body' },
    { title: 'compare.more.item5.title', body: 'compare.more.item5.body' }
  ];
</script>

<div class="wrap page-head prose-measure">
  <h1>{$t('compare.title')}</h1>
  <p class="muted">{$t('compare.updated')}</p>
  <p>{$t('compare.lead')}</p>
</div>

<div class="wrap">
  <section>
    <h2>{$t('compare.what.title')}</h2>
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>{$t('compare.what.col_memory')}</th>
            <th>{$t('compare.what.col_where')}</th>
            <th>{$t('compare.what.col_find')}</th>
            <th>{$t('compare.what.source')}</th>
          </tr>
        </thead>
        <tbody>
          {#each MEMORY_ROWS as row (row.name)}
            <tr>
              <td>{$t(row.name)}</td>
              <td>{$t(row.where)}</td>
              <td>{$t(row.find)}</td>
              <td>{#if row.url}<a class="text-link" href={row.url} target="_blank" rel="noopener">{$t('compare.what.source')}</a>{/if}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>

  <section>
    <h2>{$t('compare.save.title')}</h2>
    <p>{$t('compare.save.p1')}</p>
    <p>{$t('compare.save.p2')}</p>
    <div class="bars">
      <div class="legend">
        <span><i class="swatch b"></i>{$t('compare.test.col_builtin')}</span>
        <span><i class="swatch c"></i>{$t('compare.test.col_cortex')}</span>
      </div>
      <p class="bars-head">{$t('compare.save.col_kind')}</p>
      {#each SAVE_ROWS as row (row.label)}
        <div class="bar-row" class:total={row.total}>
          <p class="bar-label">{$t(row.label)}</p>
          <div class="bar-line"><div class="bar b" style="width: {row.b}%"></div><span>{row.b}%</span></div>
          <div class="bar-line"><div class="bar c" style="width: {row.c}%"></div><span>{row.c}%</span></div>
        </div>
      {/each}
    </div>
    <p>{$t('compare.save.read')}</p>
  </section>

  <section>
    <h2>{$t('compare.test.title')}</h2>
    <p>{$t('compare.test.p1')}</p>
    <p>{$t('compare.test.p2')}</p>
    <p>{$t('compare.test.p3')}</p>
    <figure class="chart" aria-label={$t('compare.test.chart_alt')}>
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
      <figcaption class="muted">{$t('compare.test.chart_note')}</figcaption>
    </figure>
  </section>

  <section>
    <h2>{$t('compare.more.title')}</h2>
    <div class="more-grid">
      {#each MORE as item (item.title)}
        <div>
          <h3>{$t(item.title)}</h3>
          <p>{$t(item.body)}</p>
        </div>
      {/each}
    </div>
  </section>

  <section>
    <h2>{$t('compare.note.title')}</h2>
    <p class="muted">{$t('compare.note.p')}</p>
  </section>
</div>

<style>
  .table-scroll { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 15px; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--line); vertical-align: top; }
  .more-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
  .more-grid h3 { margin-top: 0; }
  .bars { margin: 24px 0; max-width: 760px; }
  .legend { display: flex; flex-wrap: wrap; gap: 8px 24px; font-size: 14px; margin-bottom: 16px; }
  .swatch { display: inline-block; width: 12px; height: 12px; border-radius: 3px; margin-right: 8px; }
  .swatch.b, .swatch.n, .bar.b, .col.n { background: #4f86c6; }
  .swatch.h, .col.b { background: repeating-linear-gradient(135deg, #4f86c6 0 4px, rgba(79, 134, 198, 0.35) 4px 8px); }
  .swatch.c, .bar.c, .col.c { background: #bd8a2b; }
  .bars-head { font-weight: 600; font-size: 15px; margin: 0 0 12px; }
  .bar-row { padding: 12px 0; border-top: 1px solid var(--line); }
  .bar-row.total .bar-label { font-weight: 600; }
  .bar-label { margin: 0 0 8px; font-size: 15px; }
  .bar-line { display: flex; align-items: center; gap: 10px; margin-top: 6px; font-size: 14px; }
  .bar { height: 12px; border-radius: 3px; flex: 0 1 auto; min-width: 3px; max-width: calc(100% - 56px); }
  .chart { margin: 24px 0 0; max-width: 760px; }
  .groups { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(12px, 4vw, 40px); }
  .plot { height: 260px; display: flex; align-items: flex-end; justify-content: center; gap: 2px; border-bottom: 1px solid var(--line-2); }
  .col { width: clamp(22px, 6vw, 48px); border-radius: 4px 4px 0 0; }
  .stage-name { margin: 12px 0 2px; font-size: 15px; font-weight: 600; }
  .stage-result { margin: 0; font-size: 14px; color: var(--muted); }
  figcaption { margin-top: 24px; font-size: 13px; }
  .page-head h1 { margin: 14px 0 20px; }
  .page-head p + p { margin-top: 20px; }
  section h2 { margin-bottom: 28px; }
  section > p + p { margin-top: 18px; }
  .more-grid { gap: 44px 56px; }
  .more-grid h3 { margin: 0 0 12px; }
  .bars { margin: 40px 0; }
  .legend { margin-bottom: 24px; }
  .bars-head { margin: 0 0 16px; }
  .bar-row { padding: 18px 0; }
  .bar-label { margin: 0 0 10px; }
  .chart { margin: 40px 0 0; }
  .stage-name { margin: 16px 0 4px; }
  @media (max-width: 720px) { .more-grid { grid-template-columns: 1fr; } .plot { height: 200px; } }
</style>
