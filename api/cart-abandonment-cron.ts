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

function buildTrustHtml(supportEmail: string, shippingLink: string, returnsLink: string): string {
  return `
    <div style="margin:16px 0 0;padding:14px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#111827;">Checkout confidence</p>
      <ul style="margin:0;padding-left:18px;color:#374151;font-size:13px;line-height:1.5;">
        <li>Orders usually process in 1-3 business days</li>
        <li>30-day money-back guarantee on eligible unused items</li>
        <li>Secure encrypted checkout</li>
        <li>Shipping policy: <a href="${shippingLink}" style="color:#0f766e;">view details</a></li>
        <li>Returns policy: <a href="${returnsLink}" style="color:#0f766e;">view details</a></li>
      </ul>
      <p style="margin:10px 0 0;font-size:12px;color:#4b5563;">Need help? Email us at <a href="mailto:${supportEmail}" style="color:#0f766e;">${supportEmail}</a>.</p>
    </div>
  `;
}

function emailTemplate(record: any, step: 1 | 2 | 3): { subject: string; text: string; html: string } {
  const firstItem = record.items?.[0];
  const subtotalText = formatCurrency(Number(record.subtotal || 0), String(record.currency || 'USD'));
  const perk = envTrim('ABANDONED_CART_FINAL_PERK') || 'Free shipping';
  const baseUrl = envTrim('SHOP_PUBLIC_URL') || 'https://courtlane.us';
  const faqLink = `${baseUrl}/faq`;
  const shippingLink = `${baseUrl}/shipping`;
  const returnsLink = `${baseUrl}/returns`;
  const supportEmail = envTrim('COUPON_SUPPORT_EMAIL') || envTrim('COUPON_FROM_EMAIL') || 'hello@courtlane.us';
  const trustHtml = buildTrustHtml(supportEmail, shippingLink, returnsLink);
  const cardStart = `<div style="font-family:Arial,sans-serif;line-height:1.55;color:#111827;background:#f3f4f6;padding:18px;"><div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;padding:18px;">`;
  const cardEnd = `</div></div>`;

  if (step === 1) {
    return {
      subject: 'Still thinking it over?',
      text: `Still thinking it over?\n\nYour picks are waiting in your cart.\n\nItems:\n${renderItemList(record.items || [])}\n\nCart subtotal: ${subtotalText}\n\nSafety signals:\n- 1-3 business day processing\n- 30-day money-back guarantee\n- Secure encrypted checkout\n- Shipping policy: ${shippingLink}\n- Returns policy: ${returnsLink}\n- Support: ${supportEmail}\n\nReturn to your cart: ${record.cartUrl}`,
      html: `${cardStart}
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.06em;color:#0f766e;text-transform:uppercase;">Your cart is saved</p>
        <h2 style="margin:0 0 12px;font-size:28px;line-height:1.2;">Still thinking it over?</h2>
        <p style="margin:0 0 14px;color:#374151;">Your picks are waiting in your cart.</p>
        ${firstItem?.image ? `<img src="${firstItem.image}" alt="${firstItem.title}" style="max-width:220px;border-radius:8px;display:block;margin:0 0 12px;" />` : ''}
        <p style="margin:0 0 10px;"><strong>${firstItem?.title || 'Your selected items'}</strong></p>
        <p style="margin:0 0 16px;color:#374151;">Cart subtotal: <strong>${subtotalText}</strong></p>
        <a href="${record.cartUrl}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:11px 16px;border-radius:6px;font-weight:700;">Return to cart</a>
        ${trustHtml}
      ${cardEnd}`,
    };
  }

  if (step === 2) {
    return {
      subject: 'Quick answers before you checkout',
      text: `Quick answers before checkout\n\nWhy customers complete this order:\n- Clear product details and practical picks\n- 1-3 business day processing\n- 30-day money-back guarantee\n- Secure encrypted checkout\n\nFAQ: ${faqLink}\nShipping: ${shippingLink}\nReturns: ${returnsLink}\nSupport: ${supportEmail}\n\nReturn to cart: ${record.cartUrl}`,
      html: `${cardStart}
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.06em;color:#0f766e;text-transform:uppercase;">Need a quick check?</p>
        <h2 style="margin:0 0 12px;font-size:26px;line-height:1.25;">Quick answers before you checkout</h2>
        <p style="margin:0 0 10px;color:#374151;">A few reasons shoppers complete this order:</p>
        <ul style="margin:0 0 14px;padding-left:18px;color:#374151;">
          <li>Simple, clear product listings</li>
          <li>1-3 business day order processing</li>
          <li>30-day money-back guarantee</li>
          <li>Secure encrypted checkout</li>
        </ul>
        <p style="margin:0 0 16px;color:#374151;">Questions? Our FAQ can help fast: <a href="${faqLink}" style="color:#0f766e;">View FAQ</a></p>
        <a href="${record.cartUrl}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:11px 16px;border-radius:6px;font-weight:700;">Take me back to cart</a>
        ${trustHtml}
      ${cardEnd}`,
    };
  }

  return {
    subject: 'We are holding your cart a little longer',
    text: `We are holding your cart for a little longer.\n\nIf you want to finish today, here is a small perk: ${perk}.\nCart subtotal: ${subtotalText}\n\nSafety signals:\n- 1-3 business day processing\n- 30-day money-back guarantee\n- Secure encrypted checkout\n- Shipping policy: ${shippingLink}\n- Returns policy: ${returnsLink}\n- Support: ${supportEmail}\n\nComplete your order: ${record.cartUrl}`,
    html: `${cardStart}
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.06em;color:#0f766e;text-transform:uppercase;">Last reminder</p>
      <h2 style="margin:0 0 12px;font-size:26px;line-height:1.25;">We are holding your cart a little longer</h2>
      <p style="margin:0 0 12px;color:#374151;">If now is a good time to finish checkout, here is a small perk: <strong>${perk}</strong>.</p>
      <p style="margin:0 0 16px;color:#374151;">Your subtotal is currently <strong>${subtotalText}</strong>.</p>
      <a href="${record.cartUrl}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:11px 16px;border-radius:6px;font-weight:700;">Complete your order</a>
      ${trustHtml}
    ${cardEnd}`,
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

