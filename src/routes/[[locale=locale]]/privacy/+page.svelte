<script lang="ts">
  import { t } from '$lib/i18n';

  const EMAIL = 'info@cortexmind.net';

  function withMailto(text: string): { before: string; hasEmail: boolean; after: string } {
    const idx = text.indexOf(EMAIL);
    if (idx === -1) return { before: text, hasEmail: false, after: '' };
    return { before: text.slice(0, idx), hasEmail: true, after: text.slice(idx + EMAIL.length) };
  }

  $: s6 = withMailto($t('privacy.s6'));
</script>

<div class="wrap page-head prose-measure">
  <h1>{$t('privacy.title')}</h1>
  <p class="muted">{$t('privacy.updated')}</p>
</div>

<div class="wrap prose-measure">
  <section>
    <h2>{$t('privacy.s1_title')}</h2>
    <p>{$t('privacy.s1')}</p>
  </section>
  <section>
    <h2>{$t('privacy.s2_title')}</h2>
    <p>{$t('privacy.s2')}</p>
  </section>
  <section>
    <h2>{$t('privacy.s3_title')}</h2>
    <p>{$t('privacy.s3')}</p>
  </section>
  <section>
    <h2>{$t('privacy.s4_title')}</h2>
    <p>{$t('privacy.s4')}</p>
  </section>
  <section>
    <h2>{$t('privacy.s5_title')}</h2>
    <p>{$t('privacy.s5')}</p>
  </section>
  <section>
    <h2>{$t('privacy.s6_title')}</h2>
    <p>{s6.before}{#if s6.hasEmail}<a class="text-link" href={`mailto:${EMAIL}`}>{EMAIL}</a>{/if}{s6.after}</p>
  </section>
</div>
