import { FormEvent, useEffect, useMemo, useState } from 'react';
import { trackCustomEvent } from '../analytics/MetaPixel';
import { isValidEmail, resolveCouponCode, resolveCouponSignupEndpoint, submitCouponSignup } from '../../lib/couponSignup';
import { setMarketingEmail } from '../../lib/marketingIdentity';

const DISMISS_KEY = 'pb_coupon_popup_dismissed_v1';
const CLAIMED_KEY = 'pb_coupon_popup_claimed_v1';
const POPUP_DELAY_MS = 12000;
const DISMISS_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export function NewCustomerCouponPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const signupEndpoint = useMemo(() => resolveCouponSignupEndpoint(), []);
  const couponCode = useMemo(() => resolveCouponCode(), []);

  useEffect(() => {
    let timer: number | undefined;
    const forceOpen = typeof window !== 'undefined' && window.location.search.includes('couponPopup=1');

    try {
      const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) || '0');
      const hasClaimed = window.localStorage.getItem(CLAIMED_KEY) === '1';
      const isDismissedRecently = dismissedAt > 0 && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS;
      if (!forceOpen && (isDismissedRecently || hasClaimed)) return;
    } catch {
      // Continue and still show popup if storage is unavailable.
    }

    timer = window.setTimeout(() => {
      setIsOpen(true);
      trackCustomEvent('CouponPopupShown', {
        delay_seconds: forceOpen ? 0 : 12,
        force_open: forceOpen ? 1 : 0,
      });
    }, forceOpen ? 0 : POPUP_DELAY_MS);

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  const closePopup = () => {
    setIsOpen(false);
    try {
      // Dismiss only temporarily so returning visitors can see the offer again.
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // Ignore storage failures.
    }
    trackCustomEvent('CouponPopupClosed');
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitCouponSignup({
        email: normalizedEmail,
        source: 'new-customer-popup',
        endpoint: signupEndpoint,
        couponCode,
      });
      setMarketingEmail(normalizedEmail);

      try {
        window.localStorage.setItem(CLAIMED_KEY, '1');
      } catch {
        // Ignore storage failures.
      }

      trackCustomEvent('CouponPopupClaimed', { coupon_code: couponCode });
      setIsSuccess(true);
    } catch (submitError) {
      const msg =
        submitError instanceof Error && submitError.message
          ? submitError.message
          : 'Could not submit right now. Please try again in a moment.';
      setError(msg.length > 200 ? `${msg.slice(0, 200)}…` : msg);
      trackCustomEvent('CouponPopupSubmitFailed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-sm bg-white p-5 shadow-2xl sm:p-6">
        <button
          type="button"
          onClick={closePopup}
          aria-label="Close offer popup"
          className="ml-auto block text-gray-500 hover:text-gray-900"
        >
          ✕
        </button>

        {!isSuccess ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">New customer offer</p>
            <h3 className="mt-1 text-2xl font-bold text-gray-900">Get 5% off your first order</h3>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email and we&apos;ll send your 5% discount code right away.
            </p>

            <form className="mt-4 space-y-3" onSubmit={onSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-teal-700 focus:outline-none"
                required
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-sm bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900 disabled:opacity-60"
              >
                {isSubmitting ? 'Sending...' : 'Send my 5% code'}
              </button>
            </form>
          </>
        ) : (
          <div className="py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">You&apos;re all set</p>
            <h3 className="mt-1 text-xl font-bold text-gray-900">Check your email</h3>
            <p className="mt-2 text-sm text-gray-600">
              Your 5% code is on the way. If it doesn&apos;t appear in a minute, check spam/promotions.
            </p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-4 w-full rounded-sm border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              Continue shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
