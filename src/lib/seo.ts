// Serialized for {@html} inside <svelte:head>: "<" is escaped so "</script>" or "<!--" in a string cannot end the block.
export function jsonLdTag(data: unknown): string {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}<\/script>`;
}
