function json(res: any, status: number, body: Record<string, unknown>) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
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
    const { runAbandonmentCron } = await import('../src/lib/cartAbandonmentServer');
    const result = await runAbandonmentCron();
    return json(res, 200, { ok: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return json(res, 500, { error: 'Cron run failed', detail: message, step: 'module-or-run' });
  }
}

