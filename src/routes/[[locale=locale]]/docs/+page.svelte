<script lang="ts">
  import { t } from '$lib/i18n';
  import { macUrl, windowsUrl, linuxUrl, version } from '$lib/releases';
  import { installPrompt } from '$lib/prompts';

  const navItems = [
    ['ai-install', 'docs.nav.ai'],
    ['install', 'docs.nav.install'],
    ['connect', 'docs.nav.connect'],
    ['protocol', 'docs.nav.protocol'],
    ['seed', 'docs.nav.seed'],
    ['remote', 'docs.nav.remote'],
    ['tools', 'docs.nav.tools'],
    ['data', 'docs.nav.data'],
    ['troubleshooting', 'docs.nav.troubleshooting'],
    ['uninstall', 'docs.nav.uninstall']
  ] as const;

  const licenseKeySample = 'CMND-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX';
  const genericMcpConfig = `{
  "mcpServers": {
    "cortexmind": {
      "type": "http",
      "url": "http://localhost:14200/mcp",
      "headers": { "Authorization": "Bearer <token>" }
    }
  }
}`;
  const claudeCodeCmd =
    'claude mcp add --transport http cortexmind http://localhost:14200/mcp --header "Authorization: Bearer <token>"';
  const cursorConfig =
    '{ "mcpServers": { "cortexmind": { "url": "http://localhost:14200/mcp", "headers": { "Authorization": "Bearer <token>" } } } }';
  const codexConfig = `[mcp_servers.cortexmind]
url = "http://localhost:14200/mcp"
bearer_token_env_var = "CORTEXMIND_TOKEN"`;
  const tunnelAddress = 'https://<label>.ethertunnel.com/mcp';
  const dataDir = '~/.cortexmind/';

  function copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  let copiedPrompt = false;

  function copyPrompt() {
    copy(installPrompt);
    copiedPrompt = true;
    setTimeout(() => (copiedPrompt = false), 1600);
  }
</script>

{#snippet codeBlock(code: string)}
  <div class="code-block">
    <pre><code>{code}</code></pre>
    <button type="button" class="copy-button" on:click={() => copy(code)}>{$t('docs.install.copy')}</button>
  </div>
{/snippet}

<div class="wrap page-head">
  <h1>{$t('docs.title')}</h1>
  <p class="muted">{$t('docs.lead')}</p>
</div>

<div class="docs-grid">
  <nav class="docs-nav" aria-label={$t('docs.title')}>
    {#each navItems as [id, key] (id)}
      <a href={'#' + id}>{$t(key)}</a>
    {/each}
  </nav>

  <div class="docs-content">
    <img src="/media/desk.jpg" alt="" class="docs-hero" loading="lazy" />

    <section id="ai-install">
      <h2>{$t('docs.ai.title')}</h2>
      <p>{$t('docs.ai.lead')}</p>
      <p>{$t('docs.ai.p1')}</p>

      <div class="prompt-card">
        <div class="prompt-card-head">
          <span class="code-label">{$t('docs.ai.prompt_label')}</span>
          <button type="button" class="button small" on:click={copyPrompt}>
            {copiedPrompt ? $t('docs.ai.copied') : $t('docs.ai.copy')}
          </button>
        </div>
        <pre class="prompt-body">{installPrompt}</pre>
      </div>

      <p>{$t('docs.ai.manual')}</p>
    </section>

    <h2 id="manual" class="manual-heading">{$t('docs.manual.title')}</h2>

    <section id="install">
      <h2>{$t('docs.install.title')}</h2>
      <p>{$t('docs.install.p1')}</p>
      <ul>
        <li>{$t('docs.install.mac')}</li>
        <li>{$t('docs.install.windows')}</li>
        <li>{$t('docs.install.linux')}</li>
      </ul>
      <ul>
        <li><a class="text-link" href={macUrl}>download for macOS ({version})</a></li>
        <li><a class="text-link" href={windowsUrl}>download for Windows ({version})</a></li>
        <li><a class="text-link" href={linuxUrl}>download for Linux ({version})</a></li>
      </ul>
      <p>{$t('docs.install.p2')}</p>
      {@render codeBlock(licenseKeySample)}
      <p>{$t('docs.install.p3')}</p>
    </section>

    <section id="connect">
      <h2>{$t('docs.connect.title')}</h2>
      <p>{$t('docs.connect.p1')}</p>

      <p class="code-label">{$t('docs.connect.generic_label')}</p>
      {@render codeBlock(genericMcpConfig)}

      <p class="code-label">{$t('docs.connect.claude_code_label')}</p>
      <p>{$t('docs.connect.claude_code_p')}</p>
      {@render codeBlock(claudeCodeCmd)}

      <p class="code-label">{$t('docs.connect.cursor_label')}</p>
      <p>{$t('docs.connect.cursor_p')}</p>
      {@render codeBlock(cursorConfig)}

      <p class="code-label">{$t('docs.connect.codex_label')}</p>
      <p>{$t('docs.connect.codex_p')}</p>
      {@render codeBlock(codexConfig)}

      <p class="code-label">{$t('docs.connect.hosted_label')}</p>
      <p>{$t('docs.connect.hosted_p')}</p>

      <p>{$t('docs.connect.p2')}</p>
    </section>

    <section id="protocol">
      <h2>{$t('docs.protocol.title')}</h2>
      <p>{$t('docs.protocol.p1')}</p>
      <p>{$t('docs.protocol.p2')}</p>
      <div class="code-block">
        <pre>{$t('docs.protocol.block')}</pre>
        <button type="button" class="copy-button" on:click={() => copy($t('docs.protocol.block'))}>{$t('docs.install.copy')}</button>
      </div>
      <p>{$t('docs.protocol.p3')}</p>
    </section>

    <section id="seed">
      <h2>{$t('docs.seed.title')}</h2>
      <p>{$t('docs.seed.p1')}</p>
      <p>{$t('docs.seed.p2')}</p>
    </section>

    <section id="remote">
      <h2>{$t('docs.remote.title')}</h2>
      <p>{$t('docs.remote.p1')}</p>
      {@render codeBlock(tunnelAddress)}
      <p>{$t('docs.remote.p2')}</p>
      <p>{$t('docs.remote.p3')}</p>
    </section>

    <section id="tools">
      <h2>{$t('docs.tools.title')}</h2>
      <p>{$t('docs.tools.lead')}</p>

      <div class="tools-group">
        <h3>{$t('docs.tools.boot_label')}</h3>
        <dl>
          <dt><code>{$t('docs.tools.t_init')}</code></dt>
          <dd>{$t('docs.tools.d_init')}</dd>
        </dl>
      </div>

      <div class="tools-group">
        <h3>{$t('docs.tools.core_label')}</h3>
        <dl>
          <dt><code>{$t('docs.tools.t_search')}</code></dt>
          <dd>{$t('docs.tools.d_search')}</dd>
          <dt><code>{$t('docs.tools.t_recall')}</code></dt>
          <dd>{$t('docs.tools.d_recall')}</dd>
          <dt><code>{$t('docs.tools.t_get')}</code></dt>
          <dd>{$t('docs.tools.d_get')}</dd>
          <dt><code>{$t('docs.tools.t_save')}</code></dt>
          <dd>{$t('docs.tools.d_save')}</dd>
          <dt><code>{$t('docs.tools.t_save_fact')}</code></dt>
          <dd>{$t('docs.tools.d_save_fact')}</dd>
          <dt><code>{$t('docs.tools.t_status')}</code></dt>
          <dd>{$t('docs.tools.d_status')}</dd>
        </dl>
      </div>

      <div class="tools-group">
        <h3>{$t('docs.tools.control_label')}</h3>
        <dl>
          <dt><code>{$t('docs.tools.t_archive')}</code></dt>
          <dd>{$t('docs.tools.d_archive')}</dd>
          <dt><code>{$t('docs.tools.t_supersede')}</code></dt>
          <dd>{$t('docs.tools.d_supersede')}</dd>
          <dt><code>{$t('docs.tools.t_set_importance')}</code></dt>
          <dd>{$t('docs.tools.d_set_importance')}</dd>
          <dt><code>{$t('docs.tools.t_ack')}</code></dt>
          <dd>{$t('docs.tools.d_ack')}</dd>
        </dl>
      </div>
    </section>

    <section id="data">
      <h2>{$t('docs.data.title')}</h2>
      <p>{$t('docs.data.p1')}</p>
      {@render codeBlock(dataDir)}
      <ul>
        <li>{$t('docs.data.db')}</li>
        <li>{$t('docs.data.config')}</li>
        <li>{$t('docs.data.models')}</li>
      </ul>
      <p>{$t('docs.data.p2')}</p>
    </section>

    <section id="troubleshooting">
      <h2>{$t('docs.troubleshooting.title')}</h2>
      <details>
        <summary>{$t('docs.troubleshooting.q1')}</summary>
        <p>{$t('docs.troubleshooting.a1')}</p>
      </details>
      <details>
        <summary>{$t('docs.troubleshooting.q2')}</summary>
        <p>{$t('docs.troubleshooting.a2')}</p>
      </details>
      <details>
        <summary>{$t('docs.troubleshooting.q3')}</summary>
        <p>{$t('docs.troubleshooting.a3')}</p>
      </details>
      <details>
        <summary>{$t('docs.troubleshooting.q4')}</summary>
        <p>{$t('docs.troubleshooting.a4')}</p>
      </details>
      <details>
        <summary>{$t('docs.troubleshooting.q5')}</summary>
        <p>{$t('docs.troubleshooting.a5')}</p>
      </details>
    </section>

    <section id="uninstall">
      <h2>{$t('docs.uninstall.title')}</h2>
      <p>{$t('docs.uninstall.p1')}</p>
      <p><a class="text-link" href="https://polar.sh/matpb/portal/request">{$t('docs.uninstall.portal')}</a></p>
    </section>
  </div>
</div>

<style>
  .manual-heading {
    font-size: 28px;
    margin: 0 0 32px;
    border-top: 1px solid var(--line);
    padding-top: 48px;
  }

  .prompt-card {
    border: 1px solid var(--line);
    border-radius: 8px;
    background: var(--code-bg);
    margin: 0 0 16px;
    overflow: hidden;
  }

  .prompt-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px;
    border-bottom: 1px solid var(--line);
  }

  .prompt-body {
    margin: 0;
    padding: 14px 16px;
    max-height: 320px;
    overflow: auto;
    font-family: 'JetBrains Mono Variable', monospace;
    font-size: 12.5px;
    line-height: 1.5;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    color: var(--code-text);
  }
</style>
