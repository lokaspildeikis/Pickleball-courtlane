import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/Button';
import { useEffect, useMemo, useState } from 'react';
import { POLICY_SNIPPETS, SUPPORT_EMAIL } from '../../lib/trustContent';
import { Link } from 'react-router-dom';
import { CheckoutConfidence } from '../CheckoutConfidence';
import { CheckoutPaymentMethods } from '../payments/CheckoutPaymentMethods';

const URGENCY_TIMER_KEY = 'courtlane_urgency_offer_ends_at';
const HEADLINE_VARIANT_KEY = 'pb_cart_urgency_headline_variant';
const HEADLINE_STATS_KEY = 'pb_cart_urgency_headline_stats';

type HeadlineVariant = 'stacked' | 'deadline';

function formatMs(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
}

export function CartDrawer() {
  const { isCartOpen, closeCart, items, updateQuantity, removeFromCart, cartTotal, createCheckout, isCheckingOut } = useCart();
  const [cutoffEndsAt, setCutoffEndsAt] = useState(0);
  const [cutoffRemainingMs, setCutoffRemainingMs] = useState(0);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = Number(window.localStorage.getItem(URGENCY_TIMER_KEY) || '0');
    const base = stored > Date.now() ? stored : Date.now() + 2 * 60 * 60 * 1000;
    setCutoffEndsAt(base);
    setCutoffRemainingMs(Math.max(0, base - Date.now()));
  }, []);

  useEffect(() => {
    if (!cutoffEndsAt) return;
    const interval = window.setInterval(() => {
      const diff = cutoffEndsAt - Date.now();
      if (diff <= 0) {
        const next = Date.now() + 2 * 60 * 60 * 1000;
        window.localStorage.setItem(URGENCY_TIMER_KEY, String(next));
        setCutoffEndsAt(next);
        setCutoffRemainingMs(next - Date.now());
        return;
      }
      setCutoffRemainingMs(diff);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [cutoffEndsAt]);

  const headlineVariant: HeadlineVariant = useMemo(() => {
    if (typeof window === 'undefined') return 'stacked';
    const existing = window.localStorage.getItem(HEADLINE_VARIANT_KEY) as HeadlineVariant | null;
    if (existing === 'stacked' || existing === 'deadline') return existing;

    const statsRaw = window.localStorage.getItem(HEADLINE_STATS_KEY);
    if (statsRaw) {
      try {
        const stats = JSON.parse(statsRaw) as Record<string, { views: number; clicks: number }>;
        const stackedRate = (stats.stacked?.clicks || 0) / Math.max(1, stats.stacked?.views || 0);
        const deadlineRate = (stats.deadline?.clicks || 0) / Math.max(1, stats.deadline?.views || 0);
        const winner: HeadlineVariant = deadlineRate > stackedRate ? 'deadline' : 'stacked';
        window.localStorage.setItem(HEADLINE_VARIANT_KEY, winner);
        return winner;
      } catch {
        // Ignore and randomize below.
      }
    }

    const assigned: HeadlineVariant = Math.random() < 0.5 ? 'stacked' : 'deadline';
    window.localStorage.setItem(HEADLINE_VARIANT_KEY, assigned);
    return assigned;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const statsRaw = window.localStorage.getItem(HEADLINE_STATS_KEY);
    let stats: Record<string, { views: number; clicks: number }> = {
      stacked: { views: 0, clicks: 0 },
      deadline: { views: 0, clicks: 0 },
    };
    if (statsRaw) {
      try {
        stats = { ...stats, ...JSON.parse(statsRaw) };
      } catch {
        // Keep defaults.
      }
    }
    stats[headlineVariant].views += 1;
    window.localStorage.setItem(HEADLINE_STATS_KEY, JSON.stringify(stats));
  }, [headlineVariant]);

  const handleCheckout = async () => {
    if (typeof window !== 'undefined') {
      const statsRaw = window.localStorage.getItem(HEADLINE_STATS_KEY);
      let stats: Record<string, { views: number; clicks: number }> = {
        stacked: { views: 0, clicks: 0 },
        deadline: { views: 0, clicks: 0 },
      };
      if (statsRaw) {
        try {
          stats = { ...stats, ...JSON.parse(statsRaw) };
        } catch {
          // Keep defaults.
        }
      }
      stats[headlineVariant].clicks += 1;
      window.localStorage.setItem(HEADLINE_STATS_KEY, JSON.stringify(stats));
    }
    await createCheckout();
  };

  const urgencyHeadline = headlineVariant === 'deadline'
    ? 'Last call: keep your stacked savings'
    : 'Maximize your savings before checkout';

  const urgencyBody = headlineVariant === 'deadline'
    ? `Checkout before ${formatMs(cutoffRemainingMs)} to keep up to 30% total off.`
    : 'Use eligible offers at checkout for up to 30% total discounts.';

  const faqItems = [
    {
      id: 'shipping',
      question: 'When will my order ship?',
      answer: (
        <>
          Orders are usually processed in <b>1-3 business days</b>. After dispatch, delivery is typically{' '}
          <b>10-14 business days</b> depending on your location.
        </>
      ),
      href: '/shipping',
    },
    {
      id: 'returns',
      question: 'Can I return if I change my mind?',
      answer: (
        <>
          Yes. You can request a return within <b>30 days</b> for eligible unused items in original packaging.
        </>
      ),
      href: '/returns',
    },
    {
      id: 'support',
      question: 'Do you have real support?',
      answer: (
        <>
          We handle support by email. Contact us at <b>{SUPPORT_EMAIL}</b>.
        </>
      ),
      href: `mailto:${SUPPORT_EMAIL}`,
    },
  ] as const;

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold uppercase tracking-wide text-gray-900">Your Cart</h2>
          <button 
            onClick={closeCart}
            className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 pb-28 md:pb-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                <ShoppingBag size={32} />
              </div>
              <div>
                <p className="text-gray-900 font-medium">Your cart is empty</p>
                <p className="text-gray-500 text-sm mt-1">Looks like you haven't added anything yet.</p>
              </div>
              <Button variant="outline" onClick={closeCart} className="mt-4">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-sm overflow-hidden flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between">
                        <h3 className="text-sm font-bold text-gray-900 leading-tight">{item.title}</h3>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      {item.variantTitle &&
                        item.variantTitle !== 'Default Title' &&
                        item.variantTitle !== 'One size' && (
                        <p className="text-xs text-gray-500 mt-1">{item.variantTitle}</p>
                      )}
                      <p className="text-sm font-medium text-gray-900 mt-1">${item.price.toFixed(2)}</p>
                    </div>
                    
                    <div className="flex items-center border border-gray-200 rounded-sm w-fit mt-2">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-6 pb-24 md:pb-6 bg-gray-50">
            <CheckoutConfidence className="mb-4" />
            <div className="mb-4 rounded-sm border border-amber-300/70 bg-amber-50 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-amber-900">
                {urgencyHeadline}
              </p>
              <p className="mt-1 text-xs text-amber-900">
                {urgencyBody}
              </p>
            </div>

            {/* Bottom-funnel reassurance near checkout */}
            <div className="mb-4 rounded-sm border border-gray-200 bg-white p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-900">Why buy now</p>
              <div className="mt-2 space-y-1.5 text-xs text-gray-700">
                <p>• <b>Limited-time express shipping</b></p>
                <p>• <b>30-day guarantee</b></p>
                <p>• <b>Email support</b> when you have questions</p>
              </div>
            </div>

            <CheckoutPaymentMethods />

            <div className="mt-3 mb-4 rounded-sm border border-gray-200 bg-white p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-900">Quick answers</p>
              <div className="mt-2 space-y-2">
                {faqItems.map((item) => {
                  const isOpen = openFaqId === item.id;
                  return (
                    <div key={item.id} className="border border-gray-100 rounded-sm">
                      <button
                        type="button"
                        className="w-full px-3 py-2 flex items-center justify-between gap-3 text-left"
                        onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                        aria-expanded={isOpen}
                      >
                        <span className="text-sm font-semibold text-gray-900">{item.question}</span>
                        <span className="text-gray-400 shrink-0">{isOpen ? '—' : '+'}</span>
                      </button>
                      {isOpen && (
                        <div className="px-3 pb-2 text-sm text-gray-700">
                          <div className="leading-relaxed">{item.answer}</div>
                          <div className="mt-1 text-xs">
                            <Link to={item.href} className="text-teal-700 font-semibold hover:underline">
                              Learn more
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between text-base font-bold text-gray-900 mb-2">
              <p>Subtotal</p>
              <p>${cartTotal.toFixed(2)}</p>
            </div>
            <p className="text-xs text-gray-500 mb-4">Shipping and taxes calculated at checkout.</p>
            <p className="text-xs font-semibold text-teal-800 mb-3">
              Order cutoff timer: <span className="tabular-nums">{formatMs(cutoffRemainingMs)}</span>
            </p>
            <Button size="full" onClick={handleCheckout} disabled={isCheckingOut} className="hidden md:flex">
              {isCheckingOut ? 'Redirecting...' : 'Checkout'}
            </Button>
            <p className="text-xs text-gray-600 mt-3">
              You&apos;ll be redirected to our secure Shopify checkout to complete payment.
            </p>
            <p className="text-[11px] text-gray-600 mt-2">
              Trusted by customers • encrypted checkout • 30-day guarantee.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-600">
              {POLICY_SNIPPETS.cart.map((snippet) =>
                snippet.href ? (
                  <Link key={snippet.id} to={snippet.href} className="hover:text-teal-700">
                    {snippet.title}
                  </Link>
                ) : null,
              )}
            </div>
          </div>
        )}
        {items.length > 0 && (
          <div className="absolute inset-x-0 bottom-0 border-t border-gray-200 bg-white p-3 md:hidden">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">Quick checkout</p>
              <p className="text-sm font-bold text-gray-900">${cartTotal.toFixed(2)}</p>
            </div>
            <Button size="full" onClick={handleCheckout} disabled={isCheckingOut}>
              {isCheckingOut ? 'Redirecting...' : 'Checkout now'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
