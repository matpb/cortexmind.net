<script lang="ts">
  export let label: string;
  export let prompt: string;
  export let copyLabel: string;
  export let copiedLabel: string;

  let copied = false;
  function copy() {
    navigator.clipboard.writeText(prompt);
    copied = true;
    setTimeout(() => (copied = false), 1600);
  }
</script>

<div class="prompt-card">
  <div class="prompt-card-head">
    <span class="code-label">{label}</span>
    <button type="button" class="button small" on:click={copy}>{copied ? copiedLabel : copyLabel}</button>
  </div>
  <pre class="prompt-body">{prompt}</pre>
</div>

<style>
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

  @media (max-width: 560px) {
    .prompt-card-head {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }
</style>
