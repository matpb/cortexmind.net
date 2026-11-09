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
    <h2>{$t('compare.test.title')}</h2>
    <p>{$t('compare.test.p1')}</p>
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
          <tr><td>{$t('compare.test.r_natural_150')}</td><td>19/20</td><td>16/20</td></tr>
          <tr><td>{$t('compare.test.r_natural_352')}</td><td>19/20</td><td>18/20</td></tr>
          <tr><td>{$t('compare.test.r_natural_3743')}</td><td>19/20</td><td>15/20</td></tr>
          <tr><td>{$t('compare.test.r_para_150')}</td><td>16/20</td><td>14/20</td></tr>
          <tr><td>{$t('compare.test.r_para_352')}</td><td>16/20</td><td>14/20</td></tr>
          <tr><td>{$t('compare.test.r_para_3743')}</td><td>16/20</td><td>14/20</td></tr>
          <tr><td>{$t('compare.test.r_absent')}</td><td>0</td><td>0</td></tr>
          <tr><td>{$t('compare.test.r_correct')}</td><td>8/8</td><td>8/8</td></tr>
          <tr><td>{$t('compare.test.r_other')}</td><td>0/6</td><td>6/6</td></tr>
          <tr><td>{$t('compare.test.r_time')}</td><td>{$t('compare.test.time_builtin')}</td><td>{$t('compare.test.time_cortex')}</td></tr>
        </tbody>
      </table>
    </div>
    <p>{$t('compare.test.read1')}</p>
    <p>{$t('compare.test.read2')}</p>
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
    </ul>
  </section>

  <section>
    <h2>{$t('compare.choose.title')}</h2>
    <p>{$t('compare.choose.p')}</p>
  </section>
</div>

<style>
  .table-scroll { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 15px; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--line); vertical-align: top; }
</style>
