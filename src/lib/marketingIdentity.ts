const MARKETING_EMAIL_KEY = 'pb_marketing_email_v1';

export function setMarketingEmail(email: string): void {
  if (typeof window === 'undefined') return;
  const normalized = email.trim().toLowerCase();
  if (!/\S+@\S+\.\S+/.test(normalized)) return;
  try {
    window.localStorage.setItem(MARKETING_EMAIL_KEY, normalized);
  } catch {
    // Ignore storage errors in private mode or strict browsers.
  }
}

export function getMarketingEmail(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(MARKETING_EMAIL_KEY);
    if (!value) return null;
    const normalized = value.trim().toLowerCase();
    return /\S+@\S+\.\S+/.test(normalized) ? normalized : null;
  } catch {
    return null;
  }
}

