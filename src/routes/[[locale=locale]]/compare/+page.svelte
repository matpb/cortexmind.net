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

  const SIZE_ROWS: { size: MessageKey; loaded: MessageKey; b: string; c: string; bn: string; cn: string; br: string; cr: string }[] = [
    { size: 'compare.test.size_150', loaded: 'compare.test.loaded_all', b: '35/40', c: '30/40', bn: '19/20', cn: '16/20', br: '16/20', cr: '14/20' },
    { size: 'compare.test.size_352', loaded: 'compare.test.loaded_half', b: '33/40', c: '32/40', bn: '18/20', cn: '18/20', br: '15/20', cr: '14/20' },
    { size: 'compare.test.size_3743', loaded: 'compare.test.loaded_5', b: '27/40', c: '29/40', bn: '11/20', cn: '16/20', br: '16/20', cr: '13/20' },
    { size: 'compare.test.size_23305', loaded: 'compare.test.loaded_1', b: '27/40', c: '31/40', bn: '17/20', cn: '17/20', br: '10/20', cr: '14/20' }
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
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>{$t('compare.save.col_kind')}</th>
            <th>{$t('compare.test.col_builtin')}</th>
            <th>{$t('compare.test.col_cortex')}</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>{$t('compare.save.r_told')}</td><td>11/12</td><td>12/12</td></tr>
          <tr><td>{$t('compare.save.r_passing')}</td><td>2/12</td><td>9/12</td></tr>
          <tr><td>{$t('compare.save.r_detail')}</td><td>1/12</td><td>11/12</td></tr>
          <tr><td><strong>{$t('compare.save.r_total')}</strong></td><td><strong>14/36</strong></td><td><strong>32/36</strong></td></tr>
          <tr><td>{$t('compare.save.r_saves')}</td><td>13/48</td><td>46/48</td></tr>
        </tbody>
      </table>
    </div>
    <p>{$t('compare.save.read')}</p>
  </section>

  <section>
    <h2>{$t('compare.test.title')}</h2>
    <p>{$t('compare.test.p1')}</p>
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>{$t('compare.test.col_size')}</th>
            <th>{$t('compare.test.col_loaded')}</th>
            <th>{$t('compare.test.col_builtin')}</th>
            <th>{$t('compare.test.col_cortex')}</th>
          </tr>
        </thead>
        <tbody>
          {#each SIZE_ROWS as row (row.size)}
            <tr>
              <td>{$t(row.size)}</td>
              <td>{$t(row.loaded)}</td>
              <td>{row.b}</td>
              <td>{row.c}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <p>{$t('compare.test.read1')}</p>
    <p>{$t('compare.test.read2')}</p>
    <details>
      <summary>{$t('compare.test.details_summary')}</summary>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>{$t('compare.test.col_size')}</th>
              <th>{$t('compare.test.col_b_nat')}</th>
              <th>{$t('compare.test.col_c_nat')}</th>
              <th>{$t('compare.test.col_b_re')}</th>
              <th>{$t('compare.test.col_c_re')}</th>
            </tr>
          </thead>
          <tbody>
            {#each SIZE_ROWS as row (row.size)}
              <tr>
                <td>{$t(row.size)}</td>
                <td>{row.bn}</td>
                <td>{row.cn}</td>
                <td>{row.br}</td>
                <td>{row.cr}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </details>
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
    <h2>{$t('compare.other.title')}</h2>
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>{$t('compare.test.col_test')}</th>
            <th>{$t('compare.test.col_builtin')}</th>
            <th>{$t('compare.test.col_cortex')}</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>{$t('compare.test.r_other')}</td><td>0/6</td><td>6/6</td></tr>
          <tr><td>{$t('compare.test.r_correct')}</td><td>8/8</td><td>8/8</td></tr>
          <tr><td>{$t('compare.test.r_absent')}</td><td>0</td><td>0</td></tr>
          <tr><td>{$t('compare.test.r_time')}</td><td>{$t('compare.test.time_builtin')}</td><td>{$t('compare.test.time_cortex')}</td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <section>
    <h2>{$t('compare.choose.title')}</h2>
    <p>{$t('compare.choose.p')}</p>
  </section>

  <section>
    <h2>{$t('compare.limits.title')}</h2>
    <ul>
      <li>{$t('compare.limits.l1')}</li>
      <li>{$t('compare.limits.l2')}</li>
      <li>{$t('compare.limits.l3')}</li>
      <li>{$t('compare.limits.l4')}</li>
      <li>{$t('compare.limits.l5')}</li>
      <li>{$t('compare.limits.l6')}</li>
      <li>{$t('compare.limits.l7')}</li>
      <li>{$t('compare.limits.l8')}</li>
    </ul>
  </section>
</div>

<style>
  .table-scroll { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 15px; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--line); vertical-align: top; }
  details { margin-top: 16px; }
  summary { cursor: pointer; }
  .more-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
  .more-grid h3 { margin-top: 0; }
  @media (max-width: 720px) { .more-grid { grid-template-columns: 1fr; } }
</style>
