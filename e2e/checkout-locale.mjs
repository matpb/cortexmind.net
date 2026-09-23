#!/usr/bin/env node
// Usage: node e2e/checkout-locale.mjs — unit-tests success_url locale routing
// with a stubbed fetch, no build/browser/network needed.
import { onRequestPost } from '../functions/api/create-polar-checkout.js';

let failed = false;
function check(name, ok) {
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}`);
  if (!ok) failed = true;
}

async function checkoutSuccessUrl(locale) {
  let sentBody = null;
  const stubbedFetch = async (_url, init) => {
    sentBody = JSON.parse(init.body);
    return new Response(JSON.stringify({ url: 'https://polar.example/checkout/abc', id: 'abc' }), { status: 200 });
  };
  const previousFetch = globalThis.fetch;
  globalThis.fetch = stubbedFetch;
  try {
    const request = new Request('https://cortexmind.net/api/create-polar-checkout', {
      method: 'POST',
      body: JSON.stringify({ product_id: 'prod-1', locale })
    });
    const env = { POLAR_ACCESS_TOKEN: 'test', POLAR_PRODUCT_IDS: 'prod-1' };
    await onRequestPost({ request, env });
  } finally {
    globalThis.fetch = previousFetch;
  }
  return sentBody.success_url;
}

check('locale "fr" builds /fr/success', (await checkoutSuccessUrl('fr')) === 'https://cortexmind.net/fr/success?checkout_id={CHECKOUT_ID}');
check('locale "en" builds /success', (await checkoutSuccessUrl('en')) === 'https://cortexmind.net/success?checkout_id={CHECKOUT_ID}');
check('missing locale builds /success', (await checkoutSuccessUrl(undefined)) === 'https://cortexmind.net/success?checkout_id={CHECKOUT_ID}');
check('unknown locale builds /success', (await checkoutSuccessUrl('de')) === 'https://cortexmind.net/success?checkout_id={CHECKOUT_ID}');

process.exit(failed ? 1 : 0);
