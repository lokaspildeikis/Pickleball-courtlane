import { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';

const DISMISS_KEY = 'pb_exit_offer_dismissed_at';
const CLAIM_KEY = 'pb_exit_offer_claimed';
const DEADLINE_KEY = 'pb_exit_offer_deadline';
const DISMISS_COOLDOWN_MS = 6 * 60 * 60 * 1000;
const OFFER_DURATION_MS = 10 * 60 * 1000;

export function ExitIntentOfferPopup() {
  const { items, openCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [deadline, setDeadline] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined' || items.length === 0) return;

    const onMouseLeave = (event: MouseEvent) => {
      if (event.clientY > 16) return;

      const claimed = window.localStorage.getItem(CLAIM_KEY) === '1';
      const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) || '0');
      const recentlyDismissed = dismissedAt > 0 && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS;
      if (claimed || recentlyDismissed || isOpen) return;

      const existingDeadline = Number(window.localStorage.getItem(DEADLINE_KEY) || '0');
      const nextDeadline = existingDeadline > Date.now() ? existingDeadline : Date.now() + OFFER_DURATION_MS;
      window.localStorage.setItem(DEADLINE_KEY, String(nextDeadline));
      setDeadline(nextDeadline);
      setRemainingMs(nextDeadline - Date.now());
      setIsOpen(true);
    };

    document.addEventListener('mouseleave', onMouseLeave);
    return () => document.removeEventListener('mouseleave', onMouseLeave);
  }, [isOpen, items.length]);

  useEffect(() => {
    if (!isOpen || !deadline) return;
    const interval = window.setInterval(() => {
      setRemainingMs(Math.max(0, deadline - Date.now()));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [deadline, isOpen]);

  const closePopup = () => {
    setIsOpen(false);
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  const claimOffer = () => {
    window.localStorage.setItem(CLAIM_KEY, '1');
    setIsOpen(false);
    openCart();
  };

  if (!isOpen || items.length === 0) return null;

  const minutes = String(Math.floor(remainingMs / 60000)).padStart(2, '0');
  const seconds = String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-[76] flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-md rounded-sm bg-white p-5 shadow-2xl sm:p-6">
        <button
          type="button"
          onClick={closePopup}
          aria-label="Close exit offer popup"
          className="ml-auto block text-gray-500 hover:text-gray-900"
        >
          ✕
        </button>
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Wait - before you go</p>
        <h3 className="mt-1 text-2xl font-bold text-gray-900">Keep your stacked offer</h3>
        <p className="mt-2 text-sm text-gray-700">
          Finish checkout in the next <span className="font-bold tabular-nums">{minutes}:{seconds}</span> to keep up to
          30% total savings.
        </p>
        <button
          type="button"
          onClick={claimOffer}
          className="mt-4 w-full rounded-sm bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900"
        >
          Return to cart and checkout
        </button>
      </div>
    </div>
  );
}
