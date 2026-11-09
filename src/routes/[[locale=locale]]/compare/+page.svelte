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

  const STAGES: { stage: MessageKey; result: MessageKey }[] = [
    { stage: 'compare.test.stage_small', result: 'compare.test.result_small' },
    { stage: 'compare.test.stage_serious', result: 'compare.test.result_serious' },
    { stage: 'compare.test.stage_large', result: 'compare.test.result_large' }
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
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>{$t('compare.test.col_stage')}</th>
            <th>{$t('compare.test.col_result')}</th>
          </tr>
        </thead>
        <tbody>
          {#each STAGES as row (row.stage)}
            <tr>
              <td>{$t(row.stage)}</td>
              <td>{$t(row.result)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
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
  .swatch.b, .bar.b { background: #6b7280; }
  .swatch.c, .bar.c { background: #d9a441; }
  .bars-head { font-weight: 600; font-size: 15px; margin: 0 0 12px; }
  .bar-row { padding: 12px 0; border-top: 1px solid var(--line); }
  .bar-row.total .bar-label { font-weight: 600; }
  .bar-label { margin: 0 0 8px; font-size: 15px; }
  .bar-line { display: flex; align-items: center; gap: 10px; margin-top: 6px; font-size: 14px; }
  .bar { height: 12px; border-radius: 3px; flex: 0 1 auto; min-width: 3px; max-width: calc(100% - 56px); }
  @media (max-width: 720px) { .more-grid { grid-template-columns: 1fr; } }
</style>
