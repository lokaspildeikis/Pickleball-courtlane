import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/Button';
import { useEffect, useState } from 'react';
import { POLICY_SNIPPETS, SUPPORT_EMAIL } from '../../lib/trustContent';
import { Link } from 'react-router-dom';
import { CheckoutConfidence } from '../CheckoutConfidence';
import { CheckoutPaymentMethods } from '../payments/CheckoutPaymentMethods';
import { getSyntheticReviewSummary } from '../../lib/syntheticReviews';
import { getEstimatedDeliveryRange } from '../../lib/deliveryEstimate';


function renderStars(rating: number) {
  const fullStars = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, idx) => (
        <span key={idx} className={idx < fullStars ? 'text-amber-500' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </div>
  );
}

export function CartDrawer() {
  const { isCartOpen, closeCart, items, updateQuantity, removeFromCart, cartTotal, createCheckout, isCheckingOut } = useCart();
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const estimatedDeliveryRange = getEstimatedDeliveryRange();

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

  const handleCheckout = async () => {
    await createCheckout();
  };
  const compareTotal = items.reduce((sum, item) => {
    const compareAt = typeof item.compareAtPrice === 'number' ? item.compareAtPrice : 0;
    return sum + compareAt * item.quantity;
  }, 0);
  const savingsAmount = compareTotal - cartTotal;
  const showSavings = compareTotal > cartTotal;

  const faqItems = [
    {
      id: 'shipping',
      question: 'When will my order ship?',
      answer: (
        <>
          Estimated arrival for most orders: <b>{estimatedDeliveryRange}</b>.
        </>
      ),
      href: '/shipping',
    },
    {
      id: 'returns',
      question: 'Not happy in 30 days?',
      answer: (
        <>
          You are covered by our <b>money-back guarantee</b> within <b>30 days</b> for eligible unused items.
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
      <div className="relative h-full w-full bg-white shadow-2xl animate-in slide-in-from-right duration-300 sm:w-[85vw] lg:w-[70vw] xl:w-[60vw] max-w-[1200px] flex flex-col">
        
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
                  {(() => {
                    const reviewSummary = item.productHandle
                      ? getSyntheticReviewSummary(item.productHandle)
                      : null;
                    return (
                      <>
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
                      {reviewSummary && (
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-600">
                          {renderStars(reviewSummary.rating)}
                          <span>
                            {reviewSummary.rating.toFixed(1)} ({reviewSummary.reviewCount})
                          </span>
                        </div>
                      )}
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
                      </>
                    );
                  })()}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-6 pb-24 md:pb-6 bg-gray-50">
            <CheckoutConfidence className="mb-3" />

            {/* Bottom-funnel reassurance near checkout */}
            <div className="mb-4 rounded-sm border border-gray-200 bg-white p-3 hidden">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-900">Why buy now</p>
              <div className="mt-2 space-y-1.5 text-xs text-gray-700">
                <p>• <b>Free shipping on every order</b></p>
                <p>• <b>Not happy in 30 days? Money-back guarantee</b></p>
                <p>• <b>Email support</b> when you have questions</p>
              </div>
            </div>

            <CheckoutPaymentMethods />

            <div className="mt-3 mb-4 rounded-sm border border-gray-200 bg-white p-3 hidden">
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
              <div className="text-right">
                {showSavings && (
                  <p
                    className="text-sm leading-tight"
                    style={{ color: '#9ca3af', textDecoration: 'line-through' }}
                  >
                    ${compareTotal.toFixed(2)}
                  </p>
                )}
                <p className="font-bold text-gray-900">${cartTotal.toFixed(2)}</p>
              </div>
            </div>
            {showSavings && (
              <p className="mb-2 text-right text-[13px] font-semibold" style={{ color: '#1a7a4a' }}>
                You save ${savingsAmount.toFixed(2)}!
              </p>
            )}
            <p className="mb-3 inline-flex items-center rounded-sm border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-extrabold uppercase tracking-wide text-emerald-800">
              Over 500+ fulfilled orders
            </p>
            <p className="text-xs text-gray-500 mb-4">Shipping and taxes calculated at checkout.</p>
            <p className="text-xs font-semibold text-teal-800 mb-3">Estimated delivery: {estimatedDeliveryRange}</p>
            <Button size="full" onClick={handleCheckout} disabled={isCheckingOut} className="hidden md:flex">
              {isCheckingOut ? 'Redirecting...' : 'Checkout'}
            </Button>
            <p className="text-xs text-gray-600 mt-2">
              You&apos;ll be redirected to our secure Shopify checkout to complete payment.
            </p>
            <p className="text-[11px] text-gray-600 mt-1.5">
              Trusted by customers • encrypted checkout • 30-day money-back guarantee.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-600 hidden">
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
