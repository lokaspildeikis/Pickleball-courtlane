const META_PIXEL_ID = '4195644437414374';

function json(res: any, status: number, body: Record<string, unknown>) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
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
    return json(res, 405, { error: 'Method not allowed' });
  }

  const token = process.env.META_ACCESS_TOKEN?.trim();
  if (!token) {
    return json(res, 500, { error: 'META_ACCESS_TOKEN not configured' });
  }

  let body: any = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } catch {
    return json(res, 400, { error: 'Invalid JSON body' });
  }

  const { eventName, eventId, sourceUrl, customData, fbp, fbc } = body;

  if (!eventName || typeof eventName !== 'string') {
    return json(res, 400, { error: 'eventName is required' });
  }

  const ipRaw = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || '';
  const clientIp = typeof ipRaw === 'string' ? ipRaw.split(',')[0].trim() || undefined : undefined;
  const userAgent: string | undefined = req.headers['user-agent'] || undefined;

  const userData: Record<string, string> = {};
  if (clientIp) userData['client_ip_address'] = clientIp;
  if (userAgent) userData['client_user_agent'] = userAgent;
  if (fbp && typeof fbp === 'string') userData['fbp'] = fbp;
  if (fbc && typeof fbc === 'string') userData['fbc'] = fbc;

  const eventData: Record<string, unknown> = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    user_data: userData,
  };

  if (eventId && typeof eventId === 'string') eventData['event_id'] = eventId;
  if (sourceUrl && typeof sourceUrl === 'string') eventData['event_source_url'] = sourceUrl;
  if (customData && typeof customData === 'object') eventData['custom_data'] = customData;

  try {
    const metaRes = await fetch(
      `https://graph.facebook.com/v19.0/${META_PIXEL_ID}/events`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [eventData], access_token: token }),
      }
    );

    if (!metaRes.ok) {
      const text = await metaRes.text();
      console.error('Meta CAPI error:', metaRes.status, text);
      return json(res, 502, { error: 'Meta CAPI returned an error' });
    }

    return json(res, 200, { ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Meta CAPI request failed:', message);
    return json(res, 500, { error: 'CAPI request failed', detail: message });
  }
}
