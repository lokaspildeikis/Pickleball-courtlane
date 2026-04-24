import crypto from 'node:crypto';
import nodemailer from 'nodemailer';

type AbandonedCartItem = {
  productId?: string;
  title: string;
  variantTitle?: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  productUrl?: string;
};

type AbandonedCartRecord = {
  id: string;
  email: string;
  source: string;
  cartUrl: string;
  currency: string;
  subtotal: number;
  items: AbandonedCartItem[];
  updatedAt: string;
  checkoutStartedAt?: string;
  completedAt?: string;
  sequence: {
    email1SentAt?: string;
    email2SentAt?: string;
    email3SentAt?: string;
  };
};

type TrackPayload = {
  eventType?: 'cart_updated' | 'checkout_started' | 'order_completed';
  email: string;
  source?: string;
  cartUrl?: string;
  currency?: string;
  subtotal?: number;
  items?: AbandonedCartItem[];
};

const CART_INDEX_KEY = 'abandonment:carts:index';
const EMAIL1_DELAY_MS = 30 * 60 * 1000;
const EMAIL2_DELAY_MS = 4 * 60 * 60 * 1000;
const EMAIL3_DELAY_MS = 22 * 60 * 60 * 1000;

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

function safeParseRecord(raw: unknown): AbandonedCartRecord | null {
  if (!raw || typeof raw !== 'string') return null;
  try {
    const parsed = JSON.parse(raw) as AbandonedCartRecord;
    if (!parsed.email || !parsed.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

function dedupeItems(items: AbandonedCartItem[]): AbandonedCartItem[] {
  const compact = items
    .filter((item) => item && item.title && Number.isFinite(item.unitPrice) && Number.isFinite(item.quantity))
    .slice(0, 8);
  if (compact.length === 0) return [];
  return compact.map((item) => ({
    ...item,
    title: String(item.title).slice(0, 180),
    variantTitle: item.variantTitle ? String(item.variantTitle).slice(0, 120) : '',
    image: item.image ? String(item.image).slice(0, 500) : '',
    quantity: Math.max(1, Math.min(50, Math.round(item.quantity || 1))),
    unitPrice: Number(item.unitPrice),
    productUrl: item.productUrl ? String(item.productUrl).slice(0, 500) : '',
  }));
}

export async function trackCartEvent(input: TrackPayload) {
  const email = String(input.email || '').trim().toLowerCase();
  if (!/\S+@\S+\.\S+/.test(email)) {
    throw new Error('Invalid email address');
  }

  const key = cartKeyFromEmail(email);
  const nowIso = new Date().toISOString();
  const existing = safeParseRecord(await redisCommand(['GET', key]));
  const eventType = input.eventType || 'cart_updated';

  if (eventType === 'checkout_started') {
    if (!existing) return { ok: true, updated: false };
    existing.checkoutStartedAt = nowIso;
    await redisCommand(['SET', key, JSON.stringify(existing), 'EX', String(60 * 60 * 24 * 30)]);
    return { ok: true, updated: true };
  }

  if (eventType === 'order_completed') {
    if (!existing) return { ok: true, updated: false };
    existing.completedAt = nowIso;
    await redisCommand(['SET', key, JSON.stringify(existing), 'EX', String(60 * 60 * 24 * 30)]);
    return { ok: true, updated: true };
  }

  const items = dedupeItems(input.items || []);
  if (items.length === 0) {
    return { ok: true, updated: false };
  }

  const record: AbandonedCartRecord = {
    id: existing?.id || crypto.randomUUID(),
    email,
    source: String(input.source || existing?.source || 'storefront-cart').slice(0, 120),
    cartUrl: String(input.cartUrl || existing?.cartUrl || `${envTrim('SHOP_PUBLIC_URL') || 'https://courtlane.us'}/?openCart=1`),
    currency: String(input.currency || existing?.currency || 'USD').slice(0, 10),
    subtotal: Number.isFinite(input.subtotal) ? Number(input.subtotal) : existing?.subtotal || 0,
    items,
    updatedAt: nowIso,
    sequence: existing?.sequence || {},
    checkoutStartedAt: existing?.checkoutStartedAt,
    completedAt: existing?.completedAt,
  };

  await redisCommand(['SET', key, JSON.stringify(record), 'EX', String(60 * 60 * 24 * 30)]);
  await redisCommand(['SADD', CART_INDEX_KEY, key]);
  return { ok: true, updated: true };
}

function shouldSuppress(record: AbandonedCartRecord): boolean {
  return Boolean(record.completedAt || record.checkoutStartedAt);
}

function isDue(updatedAtIso: string, delayMs: number): boolean {
  const updatedAt = new Date(updatedAtIso).getTime();
  if (!Number.isFinite(updatedAt)) return false;
  return Date.now() - updatedAt >= delayMs;
}

function formatCurrency(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

function renderItemList(items: AbandonedCartItem[]): string {
  return items
    .slice(0, 3)
    .map((item) => `- ${item.title} x${item.quantity}`)
    .join('\n');
}

function emailTemplate(record: AbandonedCartRecord, step: 1 | 2 | 3): { subject: string; text: string; html: string } {
  const firstItem = record.items[0];
  const subtotalText = formatCurrency(record.subtotal || 0, record.currency || 'USD');
  const perk = envTrim('ABANDONED_CART_FINAL_PERK') || 'Free shipping';
  const faqLink = `${envTrim('SHOP_PUBLIC_URL') || 'https://courtlane.us'}/faq`;

  if (step === 1) {
    return {
      subject: 'Still thinking it over?',
      text: `You left something in your cart.\n\nItems:\n${renderItemList(record.items)}\n\nReturn to your cart: ${record.cartUrl}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
          <h2 style="margin:0 0 12px;">Still thinking it over?</h2>
          <p style="margin:0 0 12px;">Your picks are waiting in your cart.</p>
          ${firstItem?.image ? `<img src="${firstItem.image}" alt="${firstItem.title}" style="max-width:180px;border-radius:6px;display:block;margin-bottom:12px;" />` : ''}
          <p style="margin:0 0 12px;"><strong>${firstItem?.title || 'Your selected items'}</strong></p>
          <p style="margin:0 0 16px;">Cart subtotal: <strong>${subtotalText}</strong></p>
          <a href="${record.cartUrl}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:10px 16px;border-radius:4px;">Return to cart</a>
        </div>
      `,
    };
  }

  if (step === 2) {
    return {
      subject: 'Quick answers before you checkout',
      text: `Need help deciding?\n\n- Trusted by everyday players\n- Secure checkout\n- 30-day money-back guarantee\n\nFAQ: ${faqLink}\nReturn to cart: ${record.cartUrl}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
          <h2 style="margin:0 0 12px;">Need a quick second opinion?</h2>
          <p style="margin:0 0 10px;">A few reasons shoppers complete this order:</p>
          <ul style="margin:0 0 14px;padding-left:18px;">
            <li>Simple, clear product listings</li>
            <li>Secure encrypted checkout</li>
            <li>30-day money-back guarantee</li>
          </ul>
          <p style="margin:0 0 12px;">Questions? Our FAQ can help fast.</p>
          <p style="margin:0 0 16px;"><a href="${faqLink}">View FAQ</a></p>
          <a href="${record.cartUrl}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:10px 16px;border-radius:4px;">Take me back to cart</a>
        </div>
      `,
    };
  }

  return {
    subject: 'We are holding your cart a little longer',
    text: `Your cart is still saved for a little while longer.\n\nIf you want to finish today, here is a small perk: ${perk}.\n\nReturn to cart: ${record.cartUrl}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
        <h2 style="margin:0 0 12px;">We are holding your cart for a few more hours</h2>
        <p style="margin:0 0 12px;">If now is a good time to finish checkout, we can add a small perk: <strong>${perk}</strong>.</p>
        <p style="margin:0 0 16px;">Your subtotal is currently <strong>${subtotalText}</strong>.</p>
        <a href="${record.cartUrl}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:10px 16px;border-radius:4px;">Complete your order</a>
      </div>
    `,
  };
}

async function getTransporter() {
  const smtpHost = envTrim('COUPON_SMTP_HOST');
  const smtpPort = Number(envTrim('COUPON_SMTP_PORT') || '465');
  const smtpUser = envTrim('COUPON_SMTP_USER');
  const smtpPass = envTrim('COUPON_SMTP_PASS');
  const fromEmail = envTrim('COUPON_FROM_EMAIL') || smtpUser;
  const fromName = envTrim('COUPON_FROM_NAME') || 'Courtlane';
  const supportEmail = envTrim('COUPON_SUPPORT_EMAIL') || fromEmail;

  if (!smtpHost || !smtpUser || !smtpPass || !fromEmail) {
    throw new Error('SMTP env vars are missing for abandonment emails');
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  return { transporter, fromEmail, fromName, supportEmail };
}

async function sendStepEmail(record: AbandonedCartRecord, step: 1 | 2 | 3) {
  const { transporter, fromEmail, fromName, supportEmail } = await getTransporter();
  const tpl = emailTemplate(record, step);
  await transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to: record.email,
    replyTo: supportEmail || undefined,
    subject: tpl.subject,
    text: tpl.text,
    html: tpl.html,
  });
}

export async function runAbandonmentCron() {
  const keysRaw = await redisCommand(['SMEMBERS', CART_INDEX_KEY]);
  const keys = Array.isArray(keysRaw) ? (keysRaw.filter((k): k is string => typeof k === 'string')) : [];
  if (keys.length === 0) return { scanned: 0, sent: 0 };

  let sent = 0;
  for (const key of keys) {
    const record = safeParseRecord(await redisCommand(['GET', key]));
    if (!record) {
      await redisCommand(['SREM', CART_INDEX_KEY, key]);
      continue;
    }

    if (shouldSuppress(record) || !record.items.length) continue;

    const seq = record.sequence || {};
    let stepToSend: 1 | 2 | 3 | null = null;
    if (!seq.email1SentAt && isDue(record.updatedAt, EMAIL1_DELAY_MS)) {
      stepToSend = 1;
    } else if (seq.email1SentAt && !seq.email2SentAt && isDue(record.updatedAt, EMAIL2_DELAY_MS)) {
      stepToSend = 2;
    } else if (seq.email2SentAt && !seq.email3SentAt && isDue(record.updatedAt, EMAIL3_DELAY_MS)) {
      stepToSend = 3;
    }

    if (!stepToSend) continue;

    try {
      await sendStepEmail(record, stepToSend);
      const nowIso = new Date().toISOString();
      if (stepToSend === 1) record.sequence.email1SentAt = nowIso;
      if (stepToSend === 2) record.sequence.email2SentAt = nowIso;
      if (stepToSend === 3) record.sequence.email3SentAt = nowIso;
      await redisCommand(['SET', key, JSON.stringify(record), 'EX', String(60 * 60 * 24 * 30)]);
      sent += 1;
    } catch (error) {
      console.error(`Failed abandoned cart step ${stepToSend} for ${record.email}:`, error);
    }
  }

  return { scanned: keys.length, sent };
}

