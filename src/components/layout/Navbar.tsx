import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useEffect, useState } from 'react';

const URGENCY_TIMER_KEY = 'courtlane_urgency_offer_ends_at';
const URGENCY_DURATION_MS = 2 * 60 * 60 * 1000;

function getOfferEndTime(): number {
  if (typeof window === 'undefined') return Date.now() + URGENCY_DURATION_MS;

  const stored = window.localStorage.getItem(URGENCY_TIMER_KEY);
  const parsed = stored ? Number.parseInt(stored, 10) : NaN;

  if (Number.isFinite(parsed) && parsed > Date.now()) {
    return parsed;
  }

  const nextEnd = Date.now() + URGENCY_DURATION_MS;
  window.localStorage.setItem(URGENCY_TIMER_KEY, String(nextEnd));
  return nextEnd;
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
}

export function Navbar() {
  const { openCart, cartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [offerEndsAt, setOfferEndsAt] = useState(() => getOfferEndTime());
  const [remainingMs, setRemainingMs] = useState(() => Math.max(0, offerEndsAt - Date.now()));

  useEffect(() => {
    const interval = window.setInterval(() => {
      const diff = offerEndsAt - Date.now();
      if (diff <= 0) {
        const nextEnd = Date.now() + URGENCY_DURATION_MS;
        window.localStorage.setItem(URGENCY_TIMER_KEY, String(nextEnd));
        setOfferEndsAt(nextEnd);
        setRemainingMs(URGENCY_DURATION_MS);
        return;
      }
      setRemainingMs(diff);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [offerEndsAt]);

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100">
      <div className="bg-teal-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wide">
            Save 15% + free express shipping - ends in{' '}
            <span className="text-amber-300 tabular-nums">{formatRemaining(remainingMs)}</span>
          </p>
          <Link
            to="/shop"
            className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-amber-200 hover:text-amber-100 transition-colors whitespace-nowrap"
          >
            Shop now
          </Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-900 p-2 -ml-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center md:justify-start flex-1 md:flex-none">
            <Link to="/" className="flex items-center" aria-label="Go to homepage">
              <img
                src="/logo-courtlane.svg"
                alt="Courtlane"
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/shop" className="text-gray-900 hover:text-teal-700 font-medium text-sm tracking-wide uppercase">Shop All</Link>
            <Link to="/shop?intent=best-seller" className="text-gray-900 hover:text-teal-700 font-medium text-sm tracking-wide uppercase">Best Sellers</Link>
            <Link to="/shop?filter=essentials" className="text-gray-900 hover:text-teal-700 font-medium text-sm tracking-wide uppercase">Essentials</Link>
            <Link to="/shop?filter=backpacks" className="text-gray-900 hover:text-teal-700 font-medium text-sm tracking-wide uppercase">Backpacks</Link>
            <Link to="/shop?filter=bundles" className="text-gray-900 hover:text-teal-700 font-medium text-sm tracking-wide uppercase">Bundles</Link>
            <Link to="/about" className="text-gray-900 hover:text-teal-700 font-medium text-sm tracking-wide uppercase">Our Story</Link>
          </nav>

          {/* Cart Icon */}
          <div className="flex items-center">
            <button 
              onClick={openCart}
              className="relative p-2 text-gray-900 hover:text-teal-700 transition-colors"
              aria-label="Open cart"
            >
              <ShoppingBag size={24} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-teal-800 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 absolute w-full">
          <div className="px-4 pt-2 pb-6 space-y-1">
            <Link 
              to="/shop" 
              className="block px-3 py-4 text-base font-medium text-gray-900 border-b border-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Shop All
            </Link>
            <Link 
              to="/shop?intent=best-seller" 
              className="block px-3 py-4 text-base font-medium text-gray-900 border-b border-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Best Sellers
            </Link>
            <Link 
              to="/shop?filter=essentials" 
              className="block px-3 py-4 text-base font-medium text-gray-900 border-b border-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Essentials
            </Link>
            <Link 
              to="/shop?filter=backpacks" 
              className="block px-3 py-4 text-base font-medium text-gray-900 border-b border-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Backpacks
            </Link>
            <Link 
              to="/shop?filter=bundles" 
              className="block px-3 py-4 text-base font-medium text-gray-900 border-b border-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Bundles
            </Link>
            <Link 
              to="/about" 
              className="block px-3 py-4 text-base font-medium text-gray-900"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Our Story
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
