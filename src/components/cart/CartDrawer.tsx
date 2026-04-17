import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/Button';
import { useEffect } from 'react';
import { TrustPointsRow } from '../trust/TrustPointsRow';
import { POLICY_SNIPPETS, TRUST_POINTS } from '../../lib/trustContent';
import { Link } from 'react-router-dom';

export function CartDrawer() {
  const { isCartOpen, closeCart, items, updateQuantity, removeFromCart, cartTotal, createCheckout, isCheckingOut } = useCart();

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
        <div className="flex-1 overflow-y-auto p-6">
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
          <div className="border-t border-gray-100 p-6 bg-gray-50">
            <div className="rounded-sm border border-gray-200 bg-white p-3 mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">Checkout confidence</p>
              <TrustPointsRow points={TRUST_POINTS.cartCheckout} />
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 mb-2">
              <p>Subtotal</p>
              <p>${cartTotal.toFixed(2)}</p>
            </div>
            <p className="text-xs text-gray-500 mb-4">Shipping and taxes calculated at checkout.</p>
            <Button size="full" onClick={createCheckout} disabled={isCheckingOut}>
              {isCheckingOut ? 'Redirecting...' : 'Checkout'}
            </Button>
            <p className="text-xs text-emerald-700 mt-3">Secure checkout on Shopify.</p>
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
      </div>
    </div>
  );
}
