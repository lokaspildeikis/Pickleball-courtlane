import nodemailer from 'nodemailer';

function json(res: any, status: number, body: Record<string, unknown>) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function getCouponCode() {
  return process.env.NEW_CUSTOMER_COUPON_CODE || 'WELCOME5';
}

function envTrim(key: string): string | undefined {
  const v = process.env[key];
  if (v == null) return undefined;
  const t = String(v).trim();
  if (!t || t === 'YOUR_SECRET_VALUE_GOES_HERE') return undefined;
  return t;
}

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  const smtpHost = envTrim('COUPON_SMTP_HOST');
  const smtpPortRaw = envTrim('COUPON_SMTP_PORT');
  const smtpPort = Number(smtpPortRaw || '465');
  const smtpUser = envTrim('COUPON_SMTP_USER');
  const smtpPass = envTrim('COUPON_SMTP_PASS');
  const fromEmailRaw = envTrim('COUPON_FROM_EMAIL');
  const fromEmail = fromEmailRaw || smtpUser;
  const fromName = envTrim('COUPON_FROM_NAME') || 'Courtlane';
  const supportEmail = envTrim('COUPON_SUPPORT_EMAIL') || fromEmail;

  const missing: string[] = [];
  if (!smtpHost) missing.push('COUPON_SMTP_HOST');
  if (!smtpUser) missing.push('COUPON_SMTP_USER');
  if (!smtpPass) missing.push('COUPON_SMTP_PASS');
  if (!fromEmail) missing.push('COUPON_FROM_EMAIL (or valid COUPON_SMTP_USER)');
  if (missing.length > 0) {
    return json(res, 500, {
      error: 'SMTP is not configured',
      detail: `Missing or placeholder: ${missing.join(', ')}. Fix in Vercel → Project → Settings → Environment Variables, then Redeploy.`,
    });
  }

  let body: any = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } catch {
    return json(res, 400, { error: 'Invalid JSON body' });
  }

  const email = String(body?.email || '').trim().toLowerCase();
  const emailIsValid = /\S+@\S+\.\S+/.test(email);
  if (!emailIsValid) {
    return json(res, 400, { error: 'Invalid email address' });
  }

  const couponCode = getCouponCode();
  const shopUrl = process.env.SHOP_PUBLIC_URL || 'https://courtlane.us';

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
      <h2 style="margin:0 0 12px;">Welcome to Courtlane</h2>
      <p style="margin:0 0 12px;">Thanks for joining. Here is your new customer discount code:</p>
      <p style="font-size:24px;font-weight:700;letter-spacing:1px;margin:0 0 12px;">${couponCode}</p>
      <p style="margin:0 0 16px;">Use it for <strong>5% off</strong> your next order.</p>
      <a href="${shopUrl}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:10px 16px;border-radius:4px;">Shop now</a>
      <p style="margin:16px 0 0;color:#4b5563;font-size:12px;">If you did not request this email, you can ignore it.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to: email,
      replyTo: supportEmail || undefined,
      subject: `Your 5% Courtlane code: ${couponCode}`,
      text: `Welcome to Courtlane! Your 5% discount code is ${couponCode}. Shop here: ${shopUrl}`,
      html,
    });

    return json(res, 200, { ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Coupon signup email send failed:', error);
    return json(res, 500, { error: 'Could not send email', detail: message });
  }
}
