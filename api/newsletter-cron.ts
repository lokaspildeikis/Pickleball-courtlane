import nodemailer from 'nodemailer';

function json(res: any, status: number, body: Record<string, unknown>) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

const SUBSCRIBERS_KEY = 'newsletter:subscribers';
const QUEUE_KEY = 'newsletter:queue';
const LAST_COMPLETED_KEY = 'newsletter:lastCompletedIso';

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

async function redisPipeline(commands: string[][]): Promise<Array<{ result?: unknown; error?: string }>> {
  const { url, token } = requireRedisEnv();
  const response = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Redis pipeline failed: ${response.status} ${text}`);
  }
  return (await response.json()) as Array<{ result?: unknown; error?: string }>;
}

async function redisCommand(args: string[]): Promise<unknown> {
  const results = await redisPipeline([args]);
  const first = results?.[0];
  if (!first) return null;
  if (first.error) throw new Error(first.error);
  return first.result ?? null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getPositiveInt(envKey: string, fallback: number): number {
  const raw = envTrim(envKey);
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.floor(n);
}

function getDelayMs(envKey: string, fallbackMs: number): number {
  const raw = envTrim(envKey);
  if (!raw) return fallbackMs;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return fallbackMs;
  return Math.min(Math.floor(n), 120_000);
}

function getIntervalDays(): number {
  const raw = envTrim('NEWSLETTER_INTERVAL_DAYS');
  if (!raw) return 7;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 7;
  return Math.min(n, 365);
}

function isNewsletterEnabled(): boolean {
  return envTrim('NEWSLETTER_ENABLED') === 'true';
}

function hoursSince(iso: string): number {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return Infinity;
  return (Date.now() - t) / (1000 * 60 * 60);
}

async function queueLength(): Promise<number> {
  const raw = await redisCommand(['LLEN', QUEUE_KEY]);
  return typeof raw === 'number' ? raw : Number(raw) || 0;
}

async function popRecipients(max: number): Promise<string[]> {
  const out: string[] = [];
  for (let i = 0; i < max; i++) {
    const raw = await redisCommand(['LPOP', QUEUE_KEY]);
    if (raw == null || raw === false) break;
    const email = typeof raw === 'string' ? raw : String(raw);
    if (email) out.push(email);
  }
  return out;
}

async function requeueRecipients(emails: string[]): Promise<void> {
  if (emails.length === 0) return;
  const chunkSize = 400;
  for (let i = 0; i < emails.length; i += chunkSize) {
    const chunk = emails.slice(i, i + chunkSize);
    const cmds = chunk.map((email) => ['RPUSH', QUEUE_KEY, email] as string[]);
    await redisPipeline(cmds);
  }
}

async function seedQueueFromSubscribers(): Promise<number> {
  const membersRaw = await redisCommand(['SMEMBERS', SUBSCRIBERS_KEY]);
  const members = Array.isArray(membersRaw)
    ? membersRaw.filter((m): m is string => typeof m === 'string')
    : [];
  if (members.length === 0) return 0;

  const chunkSize = 400;
  for (let i = 0; i < members.length; i += chunkSize) {
    const chunk = members.slice(i, i + chunkSize);
    const cmds = chunk.map((email) => ['RPUSH', QUEUE_KEY, email] as string[]);
    await redisPipeline(cmds);
  }
  return members.length;
}

type NewsletterProduct = {
  handle: string;
  title: string;
  imageUrl: string;
  priceLabel: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatMoney(amount: string, currencyCode: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD',
    }).format(Number(amount));
  } catch {
    return `$${amount}`;
  }
}

function shuffleInPlace<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandomProducts(pool: NewsletterProduct[], count: number): NewsletterProduct[] {
  if (pool.length === 0) return [];
  return shuffleInPlace(pool).slice(0, Math.min(count, pool.length));
}

/** Demo pool when Storefront credentials are missing or the API fails (handles align with dev mock catalog). */
function fallbackNewsletterProductPool(_baseUrl: string): NewsletterProduct[] {
  return [
    {
      handle: 'pro-tour-overgrip-3-pack',
      title: 'Pro Tour Overgrip (3-Pack)',
      imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&q=80&w=600',
      priceLabel: '$12.00',
    },
    {
      handle: 'aero-paddle-cover',
      title: 'Aero Paddle Cover',
      imageUrl: 'https://images.unsplash.com/photo-1599580636388-9f96e5862953?auto=format&fit=crop&q=80&w=600',
      priceLabel: '$24.00',
    },
    {
      handle: 'cooling-performance-towel',
      title: 'Cooling Performance Towel',
      imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c62306601b7?auto=format&fit=crop&q=80&w=600',
      priceLabel: '$18.00',
    },
    {
      handle: 'starter-bundle',
      title: 'Starter Bundle',
      imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80&w=600',
      priceLabel: '$45.00',
    },
    {
      handle: 'court-pro-backpack',
      title: 'Court Pro Backpack',
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600',
      priceLabel: '$85.00',
    },
  ];
}

async function fetchNewsletterProductPool(baseUrl: string): Promise<NewsletterProduct[]> {
  const domain = envTrim('VITE_SHOPIFY_STORE_DOMAIN') || envTrim('SHOPIFY_STORE_DOMAIN');
  const token =
    envTrim('VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN') || envTrim('SHOPIFY_STOREFRONT_ACCESS_TOKEN');

  if (!domain || !token) {
    return fallbackNewsletterProductPool(baseUrl);
  }

  const query = `
    query NewsletterProducts @inContext(country: US) {
      products(first: 250) {
        edges {
          node {
            handle
            title
            availableForSale
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

  try {
    const endpoint = `https://${domain}/api/2024-01/graphql.json`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({ query }),
    });
    if (!response.ok) {
      console.error('Newsletter Shopify fetch HTTP error:', response.status);
      return fallbackNewsletterProductPool(baseUrl);
    }
    const data = (await response.json()) as {
      data?: { products?: { edges?: Array<{ node?: Record<string, unknown> }> } };
      errors?: unknown;
    };
    if (data.errors) {
      console.error('Newsletter Shopify GraphQL errors:', data.errors);
    }
    const edges = data?.data?.products?.edges || [];
    const out: NewsletterProduct[] = [];
    for (const edge of edges) {
      const node = edge?.node as Record<string, unknown> | undefined;
      if (!node?.handle || typeof node.handle !== 'string') continue;
      if (node.availableForSale === false) continue;
      const title = typeof node.title === 'string' ? node.title : node.handle;
      const imgEdge = node.images as { edges?: Array<{ node?: { url?: string } }> } | undefined;
      const url = imgEdge?.edges?.[0]?.node?.url;
      const imageUrl =
        typeof url === 'string' && url.length > 0
          ? url
          : 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&q=80&w=600';
      const pr = node.priceRange as
        | { minVariantPrice?: { amount?: string; currencyCode?: string } }
        | undefined;
      const amount = pr?.minVariantPrice?.amount || '0';
      const currencyCode = pr?.minVariantPrice?.currencyCode || 'USD';
      out.push({
        handle: node.handle,
        title,
        imageUrl,
        priceLabel: formatMoney(amount, currencyCode),
      });
    }
    if (out.length === 0) {
      return fallbackNewsletterProductPool(baseUrl);
    }
    return out;
  } catch (e) {
    console.error('Newsletter Shopify fetch failed:', e);
    return fallbackNewsletterProductPool(baseUrl);
  }
}

function buildNewsletterCopy(
  baseUrl: string,
  picks: NewsletterProduct[],
  couponCode: string,
): { subject: string; text: string; html: string } {
  const shopLink = baseUrl.replace(/\/$/, '');
  const codeUpper = couponCode.trim().toUpperCase();
  const subject =
    envTrim('NEWSLETTER_SUBJECT') ||
    `Courtlane: 15% off + extra 5% with ${codeUpper}`;
  const headline = envTrim('NEWSLETTER_HEADLINE') || 'Hand-picked highlights';

  const discountHtml = `
    <div style="margin:0 0 18px;padding:14px;border:1px solid #ccfbf1;border-radius:8px;background:#f0fdfa;">
      <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#0f766e;">Your savings this send</p>
      <p style="margin:0;color:#374151;font-size:14px;line-height:1.55;">
        Enjoy <strong>15% off</strong> storewide, plus an <strong>additional 5% off</strong> when you use code
        <strong style="color:#0f766e;letter-spacing:0.04em;">${escapeHtml(codeUpper)}</strong> at checkout.
        <strong>Free shipping</strong> is included.
      </p>
    </div>
  `;

  const productBlocks = picks
    .map((p) => {
      const href = `${shopLink}/product/${encodeURIComponent(p.handle)}`;
      const title = escapeHtml(p.title);
      return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
        <tr>
          <td style="padding:0;width:140px;vertical-align:top;background:#f9fafb;">
            <a href="${href}" style="display:block;text-decoration:none;">
              <img src="${escapeHtml(p.imageUrl)}" alt="${title}" width="140" style="display:block;width:140px;max-width:100%;height:auto;border:0;" />
            </a>
          </td>
          <td style="padding:12px 14px;vertical-align:middle;">
            <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:#111827;">${title}</p>
            <p style="margin:0 0 10px;font-size:14px;color:#4b5563;">${escapeHtml(p.priceLabel)}</p>
            <a href="${href}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:8px 12px;border-radius:6px;font-size:13px;font-weight:700;">View product</a>
          </td>
        </tr>
      </table>`;
    })
    .join('');

  const productsSection =
    picks.length > 0
      ? `
        <p style="margin:0 0 10px;font-size:13px;font-weight:700;letter-spacing:.06em;color:#0f766e;text-transform:uppercase;">Highlighted picks</p>
        ${productBlocks}
      `
      : `
        <p style="margin:0 0 14px;color:#374151;">Browse the shop for our latest gear.</p>
      `;

  const card = `
    <div style="font-family:Arial,sans-serif;line-height:1.55;color:#111827;background:#f3f4f6;padding:18px;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;padding:18px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.06em;color:#0f766e;text-transform:uppercase;">Courtlane</p>
        <h2 style="margin:0 0 12px;font-size:24px;line-height:1.25;">${escapeHtml(headline)}</h2>
        ${discountHtml}
        ${productsSection}
        <p style="margin:16px 0 18px;">
          <a href="${shopLink}/shop" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:11px 16px;border-radius:6px;font-weight:700;">Shop all products</a>
        </p>
        <p style="margin:16px 0 0;color:#6b7280;font-size:12px;">
          You received this because you signed up on our site. To stop emails, reply with “unsubscribe” or contact support.
        </p>
      </div>
    </div>
  `;

  const discountText = `15% off storewide, plus an extra 5% off with code ${codeUpper} at checkout. Free shipping is included.`;
  const linesText = picks.map(
    (p) => `- ${p.title} (${p.priceLabel}) — ${shopLink}/product/${encodeURIComponent(p.handle)}`,
  );
  const text =
    envTrim('NEWSLETTER_TEXT') ||
    [
      `Courtlane — ${discountText}`,
      '',
      'Highlighted picks:',
      ...linesText,
      '',
      `Shop: ${shopLink}/shop`,
      '',
      'Reply “unsubscribe” to opt out.',
    ].join('\n');

  return { subject, text, html: card };
}

async function sendNewsletterEmails(recipients: string[]): Promise<{ sent: number; failed: number; failedRecipients: string[] }> {
  const smtpHost = envTrim('COUPON_SMTP_HOST');
  const smtpPort = Number(envTrim('COUPON_SMTP_PORT') || '465');
  const smtpUser = envTrim('COUPON_SMTP_USER');
  const smtpPass = envTrim('COUPON_SMTP_PASS');
  const fromEmail = envTrim('COUPON_FROM_EMAIL') || smtpUser;
  const fromName = envTrim('COUPON_FROM_NAME') || 'Courtlane';
  const supportEmail = envTrim('COUPON_SUPPORT_EMAIL') || fromEmail;
  if (!smtpHost || !smtpUser || !smtpPass || !fromEmail) {
    throw new Error('SMTP env vars are missing (reuse COUPON_SMTP_* / COUPON_FROM_EMAIL)');
  }

  const baseUrl = envTrim('SHOP_PUBLIC_URL') || 'https://courtlane.us';
  const couponCode = envTrim('NEW_CUSTOMER_COUPON_CODE') || 'WELCOME5';
  const pool = await fetchNewsletterProductPool(baseUrl);
  const listUnsub = supportEmail ? `<mailto:${supportEmail}?subject=unsubscribe>` : undefined;

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const delayMs = getDelayMs('NEWSLETTER_DELAY_MS_BETWEEN_SENDS', 2500);
  let sent = 0;
  let failed = 0;
  const failedRecipients: string[] = [];

  for (let i = 0; i < recipients.length; i++) {
    const to = recipients[i];
    try {
      const picks = pickRandomProducts(pool, 3);
      const copy = buildNewsletterCopy(baseUrl, picks, couponCode);
      await transporter.sendMail({
        from: `${fromName} <${fromEmail}>`,
        to,
        replyTo: supportEmail || undefined,
        subject: copy.subject,
        text: copy.text,
        html: copy.html,
        headers: listUnsub ? { 'List-Unsubscribe': listUnsub } : undefined,
      });
      sent += 1;
    } catch (err) {
      failed += 1;
      failedRecipients.push(to);
      console.error(`Newsletter send failed for ${to}:`, err);
    }
    if (i < recipients.length - 1 && delayMs > 0) {
      await sleep(delayMs);
    }
  }

  return { sent, failed, failedRecipients };
}

async function runNewsletterCron() {
  if (!isNewsletterEnabled()) {
    return { ok: true as const, skipped: true as const, reason: 'NEWSLETTER_ENABLED is not true' };
  }

  const maxPerRun = getPositiveInt('NEWSLETTER_MAX_SENDS_PER_RUN', 30);
  let pending = await queueLength();

  if (pending === 0) {
    let storedLast = '';
    try {
      storedLast = String((await redisCommand(['GET', LAST_COMPLETED_KEY])) || '');
    } catch {
      storedLast = '';
    }

    const intervalHours = getIntervalDays() * 24;
    if (storedLast && hoursSince(storedLast) < intervalHours) {
      const nextInHours = intervalHours - hoursSince(storedLast);
      return {
        ok: true as const,
        skipped: true as const,
        reason: 'interval_not_elapsed',
        nextInHoursApprox: Math.max(0, Math.round(nextInHours * 10) / 10),
      };
    }

    const seeded = await seedQueueFromSubscribers();
    if (seeded === 0) {
      return { ok: true as const, skipped: true as const, reason: 'no_subscribers' };
    }
    pending = await queueLength();
  }

  const batch = await popRecipients(maxPerRun);
  if (batch.length === 0) {
    await redisCommand(['SET', LAST_COMPLETED_KEY, new Date().toISOString()]);
    return { ok: true as const, skipped: true as const, reason: 'queue_empty_after_seed', sent: 0 };
  }

  const { sent, failed, failedRecipients } = await sendNewsletterEmails(batch);
  if (failedRecipients.length > 0) {
    await requeueRecipients(failedRecipients);
  }

  const remaining = await queueLength();
  if (remaining === 0) {
    await redisCommand(['SET', LAST_COMPLETED_KEY, new Date().toISOString()]);
  }

  return {
    ok: true as const,
    skipped: false as const,
    batchSize: batch.length,
    sent,
    failed,
    remainingInQueue: remaining,
  };
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
    const result = await runNewsletterCron();
    return json(res, 200, result as Record<string, unknown>);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Newsletter cron failed:', error);
    return json(res, 500, { error: 'Newsletter cron failed', detail: message });
  }
}
