<script lang="ts">
  import { t } from '$lib/i18n';

  const EMAIL = 'info@cortexmind.net';

  function withMailto(text: string): { before: string; hasEmail: boolean; after: string } {
    const idx = text.indexOf(EMAIL);
    if (idx === -1) return { before: text, hasEmail: false, after: '' };
    return { before: text.slice(0, idx), hasEmail: true, after: text.slice(idx + EMAIL.length) };
  }

  $: s3 = withMailto($t('terms.s3'));
  $: s9 = withMailto($t('terms.s9'));
</script>

<div class="wrap page-head prose-measure">
  <h1>{$t('terms.title')}</h1>
  <p class="muted">{$t('terms.updated')}</p>
</div>

<div class="wrap prose-measure">
  <section>
    <h2>{$t('terms.s1_title')}</h2>
    <p>{$t('terms.s1')}</p>
  </section>
  <section>
    <h2>{$t('terms.s2_title')}</h2>
    <p>{$t('terms.s2')}</p>
  </section>
  <section>
    <h2>{$t('terms.s3_title')}</h2>
    <p>{s3.before}{#if s3.hasEmail}<a class="text-link" href={`mailto:${EMAIL}`}>{EMAIL}</a>{/if}{s3.after}</p>
  </section>
  <section>
    <h2>{$t('terms.s4_title')}</h2>
    <p>{$t('terms.s4')}</p>
  </section>
  <section>
    <h2>{$t('terms.s5_title')}</h2>
    <p>{$t('terms.s5')}</p>
  </section>
  <section>
    <h2>{$t('terms.s6_title')}</h2>
    <p>{$t('terms.s6')}</p>
  </section>
  <section>
    <h2>{$t('terms.s7_title')}</h2>
    <p>{$t('terms.s7')}</p>
  </section>
  <section>
    <h2>{$t('terms.s8_title')}</h2>
    <p>{$t('terms.s8')}</p>
  </section>
  <section>
    <h2>{$t('terms.s9_title')}</h2>
    <p>{s9.before}{#if s9.hasEmail}<a class="text-link" href={`mailto:${EMAIL}`}>{EMAIL}</a>{/if}{s9.after}</p>
  </section>
</div>
