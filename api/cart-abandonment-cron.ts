import nodemailer from 'nodemailer';

function json(res: any, status: number, body: Record<string, unknown>) {
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

function getDelayMs(envKey: string, fallbackMinutes: number): number {
  const raw = envTrim(envKey);
  if (!raw) return fallbackMinutes * 60 * 1000;
  const minutes = Number(raw);
  if (!Number.isFinite(minutes) || minutes < 0) {
    return fallbackMinutes * 60 * 1000;
  }
  // Hard cap to avoid accidental huge delays from bad input.
  return Math.min(minutes, 60 * 24 * 30) * 60 * 1000;
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

function isDue(updatedAtIso: string, delayMs: number): boolean {
  const updatedAt = new Date(updatedAtIso).getTime();
  if (!Number.isFinite(updatedAt)) return false;
  return Date.now() - updatedAt >= delayMs;
}

function shouldSuppress(record: any): boolean {
  return Boolean(record?.completedAt || record?.checkoutStartedAt);
}

function formatCurrency(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

function renderItemList(items: any[]): string {
  return (items || []).slice(0, 3).map((item) => `- ${item.title} x${item.quantity}`).join('\n');
}

function emailTemplate(record: any, step: 1 | 2 | 3): { subject: string; text: string; html: string } {
  const firstItem = record.items?.[0];
  const subtotalText = formatCurrency(Number(record.subtotal || 0), String(record.currency || 'USD'));
  const perk = envTrim('ABANDONED_CART_FINAL_PERK') || 'Free shipping';
  const faqLink = `${envTrim('SHOP_PUBLIC_URL') || 'https://courtlane.us'}/faq`;

  if (step === 1) {
    return {
      subject: 'Still thinking it over?',
      text: `You left something in your cart.\n\nItems:\n${renderItemList(record.items || [])}\n\nReturn to your cart: ${record.cartUrl}`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827"><h2 style="margin:0 0 12px;">Still thinking it over?</h2><p style="margin:0 0 12px;">Your picks are waiting in your cart.</p>${firstItem?.image ? `<img src="${firstItem.image}" alt="${firstItem.title}" style="max-width:180px;border-radius:6px;display:block;margin-bottom:12px;" />` : ''}<p style="margin:0 0 12px;"><strong>${firstItem?.title || 'Your selected items'}</strong></p><p style="margin:0 0 16px;">Cart subtotal: <strong>${subtotalText}</strong></p><a href="${record.cartUrl}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:10px 16px;border-radius:4px;">Return to cart</a></div>`,
    };
  }

  if (step === 2) {
    return {
      subject: 'Quick answers before you checkout',
      text: `Need help deciding?\n\n- Trusted by everyday players\n- Secure checkout\n- 30-day money-back guarantee\n\nFAQ: ${faqLink}\nReturn to cart: ${record.cartUrl}`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827"><h2 style="margin:0 0 12px;">Need a quick second opinion?</h2><p style="margin:0 0 10px;">A few reasons shoppers complete this order:</p><ul style="margin:0 0 14px;padding-left:18px;"><li>Simple, clear product listings</li><li>Secure encrypted checkout</li><li>30-day money-back guarantee</li></ul><p style="margin:0 0 12px;">Questions? Our FAQ can help fast.</p><p style="margin:0 0 16px;"><a href="${faqLink}">View FAQ</a></p><a href="${record.cartUrl}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:10px 16px;border-radius:4px;">Take me back to cart</a></div>`,
    };
  }

  return {
    subject: 'We are holding your cart a little longer',
    text: `Your cart is still saved for a little while longer.\n\nIf you want to finish today, here is a small perk: ${perk}.\n\nReturn to cart: ${record.cartUrl}`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827"><h2 style="margin:0 0 12px;">We are holding your cart for a few more hours</h2><p style="margin:0 0 12px;">If now is a good time to finish checkout, we can add a small perk: <strong>${perk}</strong>.</p><p style="margin:0 0 16px;">Your subtotal is currently <strong>${subtotalText}</strong>.</p><a href="${record.cartUrl}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:10px 16px;border-radius:4px;">Complete your order</a></div>`,
  };
}

async function sendStepEmail(record: any, step: 1 | 2 | 3) {
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

async function runAbandonmentCron() {
  const email1DelayMs = getDelayMs('ABANDONED_CART_EMAIL1_DELAY_MINUTES', 30);
  const email2DelayMs = getDelayMs('ABANDONED_CART_EMAIL2_DELAY_MINUTES', 240);
  const email3DelayMs = getDelayMs('ABANDONED_CART_EMAIL3_DELAY_MINUTES', 22 * 60);

  const keysRaw = await redisCommand(['SMEMBERS', CART_INDEX_KEY]);
  const keys = Array.isArray(keysRaw) ? keysRaw.filter((k): k is string => typeof k === 'string') : [];
  if (keys.length === 0) return { scanned: 0, sent: 0 };

  let sent = 0;
  for (const key of keys) {
    const record = safeParseRecord(await redisCommand(['GET', key]));
    if (!record) {
      await redisCommand(['SREM', CART_INDEX_KEY, key]);
      continue;
    }
    if (shouldSuppress(record) || !Array.isArray(record.items) || record.items.length === 0) continue;

    const seq = record.sequence || {};
    let stepToSend: 1 | 2 | 3 | null = null;
    if (!seq.email1SentAt && isDue(record.updatedAt, email1DelayMs)) stepToSend = 1;
    else if (seq.email1SentAt && !seq.email2SentAt && isDue(record.updatedAt, email2DelayMs)) stepToSend = 2;
    else if (seq.email2SentAt && !seq.email3SentAt && isDue(record.updatedAt, email3DelayMs)) stepToSend = 3;

    if (!stepToSend) continue;
    try {
      await sendStepEmail(record, stepToSend);
      const nowIso = new Date().toISOString();
      record.sequence = record.sequence || {};
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

export default async function handler(req: any, res: any) {
  const method = String(req.method || '').toUpperCase();
  if (method !== 'GET' && method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed', method });
  }

  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = String(req.headers?.authorization || '');
    const expected = `Bearer ${secret}`;
    if (authHeader !== expected) {
      return json(res, 401, { error: 'Unauthorized' });
    }
  }

  try {
    const result = await runAbandonmentCron();
    return json(res, 200, { ok: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return json(res, 500, { error: 'Cron run failed', detail: message, step: 'cron' });
  }
}

