import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

function envTrim(key: string): string | undefined {
  const raw = process.env[key];
  if (raw == null) return undefined;
  const value = String(raw).trim();
  if (!value || value === 'YOUR_SECRET_VALUE_GOES_HERE') return undefined;
  return value;
}

function argValue(name: string): string | undefined {
  const idx = process.argv.findIndex((a) => a === `--${name}`);
  if (idx === -1) return undefined;
  const value = process.argv[idx + 1];
  if (!value || value.startsWith('--')) return undefined;
  return value;
}

function formatCurrency(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

type CartItem = {
  title: string;
  quantity: number;
};

function renderItemsHtml(items: CartItem[]) {
  const rows = (items || []).map(
    (i) => `
      <tr>
        <td style="padding:8px 0;color:#111827;font-size:13px;">${i.title}</td>
        <td style="padding:8px 0;color:#374151;font-size:13px;" align="right">x${i.quantity}</td>
      </tr>
    `,
  );
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      ${rows.join('')}
    </table>
  `;
}

function buildEmailHtml(params: {
  name: string;
  cartUrl: string;
  subtotalText: string;
  items: CartItem[];
  supportEmail: string;
}) {
  return `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7fb;padding:24px;font-family:Arial,Helvetica,sans-serif;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
          <tr>
            <td style="padding:28px 28px 8px 28px;">
              <h1 style="margin:0;font-size:22px;line-height:1.3;color:#111827;">${params.name}, you left something in your cart</h1>
              <p style="margin:12px 0 0 0;font-size:14px;line-height:1.6;color:#374151;">
                You were close to completing your order—your cart is still saved.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 28px 6px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e5e7eb;border-radius:10px;">
                <tr>
                  <td style="padding:14px 14px 10px 14px;">
                    <p style="margin:0 0 10px 0;font-size:13px;color:#111827;"><strong>In your cart</strong></p>
                    ${renderItemsHtml(params.items)}
                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:12px 0;" />
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:13px;color:#374151;">
                      <tr>
                        <td>Subtotal</td>
                        <td align="right">${params.subtotalText}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 28px 10px 28px;">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td bgcolor="#111827" style="border-radius:10px;">
                    <a href="${params.cartUrl}" style="display:inline-block;padding:14px 18px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;">
                      Complete checkout
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:12px 0 0 0;font-size:12px;line-height:1.6;color:#6b7280;">
                Need help? Reply to this email or contact <a href="mailto:${params.supportEmail}" style="color:#111827;">${params.supportEmail}</a>.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:14px 28px 26px 28px;font-size:11px;line-height:1.6;color:#9ca3af;">
              If you already completed your purchase, you can ignore this email.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  `;
}

async function main() {
  const smtpHost = envTrim('COUPON_SMTP_HOST') || 'smtp.hostinger.com';
  const smtpPort = Number(envTrim('COUPON_SMTP_PORT') || '465');
  const smtpUser = envTrim('COUPON_SMTP_USER');
  const smtpPass = envTrim('COUPON_SMTP_PASS');
  const fromEmail = envTrim('COUPON_FROM_EMAIL') || smtpUser;
  const fromName = envTrim('COUPON_FROM_NAME') || 'Courtlane';
  const supportEmail = envTrim('COUPON_SUPPORT_EMAIL') || fromEmail || 'hello@courtlane.us';

  if (!smtpUser || !smtpPass || !fromEmail) {
    throw new Error(
      'Missing SMTP env vars. Set COUPON_SMTP_USER, COUPON_SMTP_PASS, and COUPON_FROM_EMAIL (or COUPON_SMTP_USER) in your .env',
    );
  }

  const to = (argValue('to') || 'ducadrie09@gmail.com').trim().toLowerCase();
  const name = argValue('name') || 'Ryan';
  const cartUrl = argValue('cartUrl') || argValue('checkoutUrl');
  if (!cartUrl) {
    throw new Error('Missing --cartUrl. Paste the “Copy checkout URL” value from your checkout screen.');
  }

  const subtotal = Number(argValue('subtotal') || '409.99');
  const currency = argValue('currency') || 'USD';
  const subtotalText = formatCurrency(subtotal, currency);

  const items: CartItem[] = [
    { title: 'Arronax Elite Pro Court Backpack — Carbon Fiber PU Performance Bag (Black)', quantity: 1 },
    { title: 'Super Soft Absorbent Quick Drying Microfiber Sports Towel (Dark Grey)', quantity: 1 },
    { title: 'Kirinforce Elite Outdoor Pickleballs — 12‑Pack Competition Series (Orange)', quantity: 1 },
  ];

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const subject = 'You left something in your cart — complete your order';
  const text = `Hi ${name},\n\nYou were checking out but didn’t get a chance to finish your order. Your cart is still saved.\n\nComplete checkout: ${cartUrl}\n\nSubtotal: ${subtotalText}\n\nNeed help? Reply to this email.\n`;
  const html = buildEmailHtml({ name, cartUrl, subtotalText, items, supportEmail });

  const info = await transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to,
    replyTo: supportEmail || undefined,
    subject,
    text,
    html,
  });

  console.log(`Sent abandoned cart email to ${to}. Message ID: ${info.messageId}`);
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});

