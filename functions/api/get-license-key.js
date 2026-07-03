/* CortexMind — Polar license-key delivery (Cloudflare Pages Function)
 *
 * Route:  POST /api/get-license-key        (file-based routing)
 * Runtime: Cloudflare Pages Functions / Workers — V8, NOT Node.
 *
 * Called by the /success page after Polar redirects back from checkout.
 * Polar's License Key benefit auto-issues the CMND- key when the checkout
 * succeeds; this Function fetches the buyer's key so the success page can
 * display it. The buyer pastes it into the CortexMind app, which validates it
 * against Polar directly (and the bundled tunnel presents the same key to the
 * EtherTunnel relay).
 *
 * Capability model: possession of the unguessable Polar checkout_id (a UUID
 * Polar itself appends to the success_url redirect) is the proof of purchase.
 * Server-side we only act on checkouts Polar reports as `succeeded`.
 *
 * Chain (all server-side, verified live against the sandbox 2026-07-03):
 *   1. GET /v1/checkouts/{id}            (org token)   → status, customer_id,
 *      organization_id, product.benefits (license_keys benefit ids)
 *   2. POST /v1/customer-sessions/       (org token)   → short-lived customer
 *      session token + customer_portal_url
 *   3. GET /v1/customer-portal/license-keys/?organization_id=…
 *      (customer session Bearer — scoped to THIS buyer only)
 *      → granted keys incl. the full `key`; filter to the purchased product's
 *      benefit ids, newest first.
 *
 * Benefit-grant lag: Polar issues the key moments after the checkout
 * succeeds. Until it lands we return 202 { pending: true } and the page polls.
 *
 * Secrets are read ONLY from the runtime env, never logged, never returned:
 *   - context.env.POLAR_ACCESS_TOKEN   Polar org access token (Bearer)
 *   - context.env.POLAR_API_BASE       optional; default https://api.polar.sh
 *                                      (sandbox: https://sandbox-api.polar.sh)
 */

'use strict';

const DEFAULT_POLAR_API_BASE = 'https://api.polar.sh';

// Polar checkout ids are uuid-ish opaque tokens. Keep the edge check
// permissive but bounded; Polar is the real authority.
const CHECKOUT_ID_RE = /^[A-Za-z0-9_-]+$/;
const CHECKOUT_ID_MAX = 128;

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function polarJson(res) {
  try {
    return await res.json();
  } catch (_e) {
    return null;
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // 1. Parse + validate { checkout_id }.
  let payload;
  try {
    payload = await request.json();
  } catch (_e) {
    return json({ error: 'Invalid request' }, 400);
  }
  const checkoutId =
    payload && typeof payload.checkout_id === 'string'
      ? payload.checkout_id.trim()
      : '';
  if (
    !checkoutId ||
    checkoutId.length > CHECKOUT_ID_MAX ||
    !CHECKOUT_ID_RE.test(checkoutId)
  ) {
    return json({ error: 'Invalid checkout' }, 400);
  }

  // 2. Require server-side config.
  const accessToken = env && env.POLAR_ACCESS_TOKEN;
  if (!accessToken) {
    console.error('get-license-key not configured: POLAR_ACCESS_TOKEN missing');
    return json({ error: 'Server not configured' }, 500);
  }
  const base = ((env && env.POLAR_API_BASE) || DEFAULT_POLAR_API_BASE).replace(
    /\/+$/,
    ''
  );
  const orgAuth = {
    Authorization: 'Bearer ' + accessToken,
    'Content-Type': 'application/json',
  };

  // 3. Look up the checkout. Its status is the payment truth; its product
  //    carries the license_keys benefit ids we deliver for.
  let checkout;
  try {
    const res = await fetch(base + '/v1/checkouts/' + checkoutId, {
      headers: orgAuth,
    });
    if (res.status === 404 || res.status === 422) {
      return json({ error: 'Unknown checkout' }, 404);
    }
    checkout = await polarJson(res);
    if (!res.ok || !checkout) {
      console.error('Polar checkout lookup failed', res.status);
      return json({ error: 'Could not verify checkout' }, 502);
    }
  } catch (_e) {
    return json({ error: 'Could not reach licensing service' }, 502);
  }

  // Not paid (yet). `open`/`confirmed` can still become `succeeded` → poll.
  // `expired`/`failed` never will → terminal.
  if (checkout.status === 'open' || checkout.status === 'confirmed') {
    return json({ pending: true }, 202);
  }
  if (checkout.status !== 'succeeded') {
    return json({ error: 'Checkout was not completed' }, 410);
  }
  const customerId =
    typeof checkout.customer_id === 'string' ? checkout.customer_id : '';
  const organizationId =
    typeof checkout.organization_id === 'string'
      ? checkout.organization_id
      : '';
  if (!customerId || !organizationId) {
    // Succeeded checkouts always carry both; treat absence as propagation lag.
    return json({ pending: true }, 202);
  }

  // The benefit ids this purchase grants a license key for. Filtering on them
  // keeps a buyer with older keys (e.g. a second purchase) seeing the RIGHT
  // key for this checkout.
  const wantedBenefits = new Set();
  const products = []
    .concat(checkout.products || [])
    .concat(checkout.product ? [checkout.product] : []);
  for (const p of products) {
    for (const b of (p && p.benefits) || []) {
      if (b && b.type === 'license_keys' && typeof b.id === 'string') {
        wantedBenefits.add(b.id);
      }
    }
  }
  if (wantedBenefits.size === 0) {
    // Product has no License Key benefit — a configuration error on our side.
    console.error(
      'get-license-key: product on checkout has no license_keys benefit',
      checkoutId
    );
    return json({ error: 'License not configured for this product' }, 500);
  }

  // 4. Mint a short-lived customer session. Its Bearer scopes the key list to
  //    THIS buyer only, and it doubles as the billing-portal URL.
  let session;
  try {
    const res = await fetch(base + '/v1/customer-sessions/', {
      method: 'POST',
      headers: orgAuth,
      body: JSON.stringify({ customer_id: customerId }),
    });
    session = await polarJson(res);
    if (!res.ok || !session || typeof session.token !== 'string') {
      console.error('Polar customer-session create failed', res.status);
      return json({ error: 'Could not retrieve license key' }, 502);
    }
  } catch (_e) {
    return json({ error: 'Could not reach licensing service' }, 502);
  }
  const portalUrl =
    typeof session.customer_portal_url === 'string'
      ? session.customer_portal_url
      : '';

  // 5. List the buyer's license keys (customer-scoped) and pick the newest
  //    granted key for the purchased benefit.
  let keys;
  try {
    const res = await fetch(
      base +
        '/v1/customer-portal/license-keys/?organization_id=' +
        encodeURIComponent(organizationId) +
        '&limit=100',
      { headers: { Authorization: 'Bearer ' + session.token } }
    );
    keys = await polarJson(res);
    if (!res.ok || !keys || !Array.isArray(keys.items)) {
      console.error('Polar license-key list failed', res.status);
      return json({ error: 'Could not retrieve license key' }, 502);
    }
  } catch (_e) {
    return json({ error: 'Could not reach licensing service' }, 502);
  }

  const granted = keys.items
    .filter(function (k) {
      return (
        k &&
        k.status === 'granted' &&
        typeof k.key === 'string' &&
        wantedBenefits.has(k.benefit_id)
      );
    })
    .sort(function (a, b) {
      return String(b.created_at || '').localeCompare(String(a.created_at || ''));
    });

  if (granted.length === 0) {
    // Paid, but the benefit grant hasn't issued the key yet — poll.
    return json({ pending: true }, 202);
  }

  // 6. Hand the key to the browser. Never logged.
  return json(
    {
      key: granted[0].key,
      display_key: granted[0].display_key || '',
      portal_url: portalUrl,
    },
    200
  );
}
