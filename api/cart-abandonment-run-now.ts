function json(res: any, status: number, body: Record<string, unknown>) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function envTrim(key: string): string | undefined {
  const raw = process.env[key];
  if (raw == null) return undefined;
  const value = String(raw).trim();
  if (!value || value === 'YOUR_SECRET_VALUE_GOES_HERE') return undefined;
  return value;
}

function buildBaseUrl(req: any): string {
  const shopUrl = envTrim('SHOP_PUBLIC_URL');
  if (shopUrl) return shopUrl.replace(/\/+$/, '');
  const host = String(req.headers?.host || '').trim();
  if (host) return `https://${host}`;
  const vercelUrl = envTrim('VERCEL_URL');
  if (vercelUrl) return `https://${vercelUrl.replace(/^https?:\/\//, '')}`;
  return 'https://courtlane.us';
}

export default async function handler(req: any, res: any) {
  const method = String(req.method || '').toUpperCase();
  if (method !== 'GET' && method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed', method });
  }

  const debugToken = envTrim('ABANDONMENT_DEBUG_TOKEN');
  if (!debugToken) {
    return json(res, 500, { error: 'ABANDONMENT_DEBUG_TOKEN is not configured' });
  }

  const queryToken = String(req.query?.token || '');
  const headerToken = String(req.headers?.['x-debug-token'] || '');
  if (queryToken !== debugToken && headerToken !== debugToken) {
    return json(res, 401, { error: 'Unauthorized debug token' });
  }

  const cronSecret = envTrim('CRON_SECRET');
  if (!cronSecret) {
    return json(res, 500, { error: 'CRON_SECRET is not configured' });
  }

  try {
    const baseUrl = buildBaseUrl(req);
    const response = await fetch(`${baseUrl}/api/cart-abandonment-cron`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
    });
    const text = await response.text();
    let payload: unknown = text;
    try {
      payload = JSON.parse(text);
    } catch {
      // Keep raw text if response is not JSON.
    }

    return json(res, response.status, {
      ok: response.ok,
      forwarded_status: response.status,
      forwarded_payload: payload,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return json(res, 500, { error: 'Debug run failed', detail: message });
  }
}

