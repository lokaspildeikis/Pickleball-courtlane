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
    return json(res, 405, { error: 'Method not allowed', method });
  }

  let body: any = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } catch {
    return json(res, 400, { error: 'Invalid JSON body' });
  }

  try {
    const { trackCartEvent } = await import('../src/lib/cartAbandonmentServer');
    const result = await trackCartEvent(body);
    return json(res, 200, { ok: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return json(res, 500, { error: 'Could not track cart event', detail: message, step: 'module-or-track' });
  }
}

