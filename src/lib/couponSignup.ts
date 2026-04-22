export type CouponSignupSource = 'new-customer-popup' | 'footer-newsletter';

export type CouponSignupInput = {
  email: string;
  source: CouponSignupSource;
  endpoint?: string;
  couponCode?: string;
};

export function resolveCouponSignupEndpoint(): string {
  return (import.meta.env.VITE_COUPON_SIGNUP_ENDPOINT as string | undefined)?.trim() || '/api/coupon-signup';
}

export function resolveCouponCode(): string {
  return (import.meta.env.VITE_NEW_CUSTOMER_COUPON_CODE as string | undefined)?.trim() || 'WELCOME5';
}

export function isValidEmail(value: string): boolean {
  return /\S+@\S+\.\S+/.test(value);
}

export async function submitCouponSignup({
  email,
  source,
  endpoint = resolveCouponSignupEndpoint(),
  couponCode = resolveCouponCode(),
}: CouponSignupInput): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    throw new Error('Please enter a valid email address.');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: normalizedEmail,
      couponCode,
      source,
    }),
  });

  if (!response.ok) {
    let serverMessage = '';
    try {
      const data = (await response.json()) as { error?: string; detail?: string };
      serverMessage = [data.error, data.detail].filter(Boolean).join(': ');
    } catch {
      serverMessage = response.statusText || `HTTP ${response.status}`;
    }
    throw new Error(serverMessage || 'Signup endpoint rejected request.');
  }
}
