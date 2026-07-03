/* CortexMind — Polar.sh Checkout creator (Cloudflare Pages Function)
 *
 * Route:  POST /api/create-polar-checkout   (file-based routing)
 * Runtime: Cloudflare Pages Functions / Workers — V8, NOT Node.
 *          No node SDK, no node built-ins. We talk to Polar over fetch()
 *          against the REST API with a Bearer organization access token and a
 *          JSON body.
 *
 * The access token is read ONLY from context.env.POLAR_ACCESS_TOKEN (a Pages
 * secret / .dev.vars). It is never logged, never returned, never in the repo.
 *
 * SELF-SERVE FLOW (email-only): Polar Checkout collects the email + card and
 * is the Merchant of Record (it handles tax itself). Polar's License Key
 * benefit auto-issues the CMND- license key when the checkout succeeds; the
 * success page fetches + shows it via /api/get-license-key, and the buyer
 * pastes it into the CortexMind app. We send NO client reference / metadata
 * identity: there is nothing here for an attacker to bind to a license.
 *
 * Env used:
 *   - context.env.POLAR_ACCESS_TOKEN   Polar org access token (Bearer)
 *   - context.env.POLAR_PRODUCT_IDS    comma-separated allowlist of product UUIDs
 *   - context.env.POLAR_API_BASE       optional. Defaults to https://api.polar.sh.
 *                                      Sandbox is https://sandbox-api.polar.sh
 */

'use strict';

const DEFAULT_POLAR_API_BASE = 'https://api.polar.sh';

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/* Parse the comma-separated POLAR_PRODUCT_IDS env into a Set of trimmed,
 * non-empty product UUIDs. This is the source of truth for which products a
 * client may check out — never the human-readable plan label. */
function parseAllowedProducts(raw) {
  if (typeof raw !== 'string') return new Set();
  return new Set(
    raw
      .split(',')
      .map(function (s) { return s.trim(); })
      .filter(function (s) { return s.length > 0; })
  );
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // 1. Parse body as JSON. The body only carries { product_id }.
  let payload;
  try {
    payload = await request.json();
  } catch (_e) {
    return json({ error: 'Invalid request' }, 400);
  }
  if (!payload || typeof payload !== 'object') {
    return json({ error: 'Invalid request' }, 400);
  }

  // 2. Require the access token + product allowlist. If either is unset, the
  //    checkout is NOT configured — reject clearly rather than calling Polar.
  const accessToken = env && env.POLAR_ACCESS_TOKEN;
  const allowed = parseAllowedProducts(env && env.POLAR_PRODUCT_IDS);
  if (!accessToken || allowed.size === 0) {
    console.error(
      'create-polar-checkout not configured:',
      !accessToken ? 'POLAR_ACCESS_TOKEN missing' : 'POLAR_PRODUCT_IDS empty/unset'
    );
    return json({ error: 'Checkout not configured' }, 500);
  }

  // 3. Validate product_id against the env-driven allowlist.
  const productId = payload.product_id;
  if (typeof productId !== 'string' || !allowed.has(productId)) {
    return json({ error: 'Unknown product' }, 400);
  }

  // 4. Build the Checkout create request. success_url uses Polar's
  //    {CHECKOUT_ID} placeholder, which Polar substitutes on redirect. The
  //    success page uses that id to fetch the issued license key.
  //    Extensionless clean URLs (Cloudflare Pages serves success.html at
  //    /success) avoid a 308 .html→clean redirect hop.
  const origin = new URL(request.url).origin;
  const base = (env && env.POLAR_API_BASE) || DEFAULT_POLAR_API_BASE;
  const body = {
    products: [productId],
    success_url: origin + '/success?checkout_id={CHECKOUT_ID}',
  };

  let polarRes;
  try {
    polarRes = await fetch(base.replace(/\/+$/, '') + '/v1/checkouts/', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (_e) {
    return json({ error: 'Upstream request failed' }, 502);
  }

  let data;
  try {
    data = await polarRes.json();
  } catch (_e) {
    data = null;
  }

  if (!polarRes.ok) {
    // Log the structured error server-side only — never the token or full body.
    console.error(
      'Polar checkout create failed',
      polarRes.status,
      data && (data.error || data.detail) ? (data.error || data.detail) : '(no error body)'
    );
    let message = 'Could not create checkout';
    if (data && typeof data.error === 'string') {
      message = data.error;
    } else if (data && typeof data.detail === 'string') {
      message = data.detail;
    }
    return json({ error: message }, polarRes.status);
  }

  // Success — front-end redirects to url; id included for the success page
  // (and for debugging).
  return json({ url: data && data.url, id: data && data.id }, 200);
}
