import crypto from 'node:crypto';

function json(res: any, status: number, body: Record<string, unknown>) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

const CART_INDEX_KEY = 'abandonment:carts:index';

function envTrim(key: string): string | undefined {
  const raw = process.env[key];
  if (raw == null) return undefined;
  const value = String(raw).trim();
  if (!value || value === 'YOUR_SECRET_VALUE_GOES_HERE') return undefined;
  return value;
}

function requireRedisEnv() {
  const url = envTrim('UPSTASH_REDIS_REST_URL');
  const token = envTrim('UPSTASH_REDIS_REST_TOKEN');
  if (!url || !token) {
    throw new Error('Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN');
  }
  return { url, token };
}

async function redisCommand(args: string[]): Promise<unknown> {
  const { url, token } = requireRedisEnv();
  const response = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([args]),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Redis command failed: ${response.status} ${text}`);
  }
  const data = (await response.json()) as Array<{ result?: unknown; error?: string }>;
  const first = data?.[0];
  if (!first) return null;
  if (first.error) throw new Error(first.error);
  return first.result ?? null;
}

function cartKeyFromEmail(email: string): string {
  const hash = crypto.createHash('sha256').update(email).digest('hex');
  return `abandonment:cart:${hash}`;
}

function safeParseRecord(raw: unknown): any | null {
  if (!raw || typeof raw !== 'string') return null;
  try {
    const parsed = JSON.parse(raw) as any;
    if (!parsed.email || !parsed.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

function normalizeItems(items: any[]): any[] {
  const compact = (items || [])
    .filter((item) => item && item.title && Number.isFinite(Number(item.unitPrice)) && Number.isFinite(Number(item.quantity)))
    .slice(0, 8);
  return compact.map((item) => ({
    productId: item.productId ? String(item.productId) : '',
    title: String(item.title).slice(0, 180),
    variantTitle: item.variantTitle ? String(item.variantTitle).slice(0, 120) : '',
    image: item.image ? String(item.image).slice(0, 500) : '',
    quantity: Math.max(1, Math.min(50, Math.round(Number(item.quantity) || 1))),
    unitPrice: Number(item.unitPrice),
    productUrl: item.productUrl ? String(item.productUrl).slice(0, 500) : '',
  }));
}

export default async function handler(req: any, res: any) {
  const method = String(req.method || '').toUpperCase();
  if (method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).end();
    return;
  }

  if (method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed', method });
  }

  let body: any = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } catch {
    return json(res, 400, { error: 'Invalid JSON body' });
  }

  try {
    const email = String(body.email || '').trim().toLowerCase();
    if (!/\S+@\S+\.\S+/.test(email)) {
      return json(res, 400, { error: 'Invalid email address' });
    }

    const key = cartKeyFromEmail(email);
    const nowIso = new Date().toISOString();
    const existing = safeParseRecord(await redisCommand(['GET', key]));
    const eventType = String(body.eventType || 'cart_updated');

    if (eventType === 'checkout_started' || eventType === 'order_completed') {
      if (!existing) return json(res, 200, { ok: true, updated: false });
      if (eventType === 'checkout_started') existing.checkoutStartedAt = nowIso;
      if (eventType === 'order_completed') existing.completedAt = nowIso;
      await redisCommand(['SET', key, JSON.stringify(existing), 'EX', String(60 * 60 * 24 * 30)]);
      return json(res, 200, { ok: true, updated: true });
    }

    const items = normalizeItems(body.items || []);
    if (items.length === 0) {
      return json(res, 200, { ok: true, updated: false });
    }

    const record = {
      id: existing?.id || crypto.randomUUID(),
      email,
      source: String(body.source || existing?.source || 'storefront-cart').slice(0, 120),
      cartUrl: String(body.cartUrl || existing?.cartUrl || `${envTrim('SHOP_PUBLIC_URL') || 'https://courtlane.us'}/?openCart=1`),
      currency: String(body.currency || existing?.currency || 'USD').slice(0, 10),
      subtotal: Number.isFinite(Number(body.subtotal)) ? Number(body.subtotal) : existing?.subtotal || 0,
      items,
      updatedAt: nowIso,
      sequence: existing?.sequence || {},
      checkoutStartedAt: existing?.checkoutStartedAt,
      completedAt: existing?.completedAt,
    };

    await redisCommand(['SET', key, JSON.stringify(record), 'EX', String(60 * 60 * 24 * 30)]);
    await redisCommand(['SADD', CART_INDEX_KEY, key]);
    return json(res, 200, { ok: true, updated: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return json(res, 500, { error: 'Could not track cart event', detail: message, step: 'track' });
  }
}

