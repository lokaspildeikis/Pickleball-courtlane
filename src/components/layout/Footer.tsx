import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SUPPORT_EMAIL } from '../../lib/trustContent';
import { FOOTER_BRAND_BLURB } from '../../lib/brandContent';
import { isValidEmail, resolveCouponCode, submitCouponSignup } from '../../lib/couponSignup';

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const couponCode = useMemo(() => resolveCouponCode(), []);

  const handleJoinSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess(false);

    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitCouponSignup({
        email: normalizedEmail,
        source: 'footer-newsletter',
      });
      setSuccess(true);
      setEmail('');
    } catch (submitError) {
      const message =
        submitError instanceof Error && submitError.message
          ? submitError.message
          : 'Signup failed. Please try again.';
      setError(message.length > 160 ? `${message.slice(0, 160)}...` : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-gray-950 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="inline-flex items-center mb-4" aria-label="Go to homepage">
              <img
                src="/logo-courtlane.svg"
                alt="Courtlane"
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              {FOOTER_BRAND_BLURB}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-200">Shop</h3>
            <ul className="space-y-3">
              <li><Link to="/shop" className="text-gray-400 hover:text-white text-sm transition-colors">All Products</Link></li>
              <li><Link to="/shop?filter=grips" className="text-gray-400 hover:text-white text-sm transition-colors">Overgrips</Link></li>
              <li><Link to="/shop?filter=protection" className="text-gray-400 hover:text-white text-sm transition-colors">Paddle Covers</Link></li>
              <li><Link to="/shop?filter=bundles" className="text-gray-400 hover:text-white text-sm transition-colors">Starter Bundles</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-200">Support</h3>
            <ul className="space-y-3">
              <li><Link to="/shipping" className="text-gray-400 hover:text-white text-sm transition-colors">Shipping Policy</Link></li>
              <li><Link to="/returns" className="text-gray-400 hover:text-white text-sm transition-colors">Returns Policy</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white text-sm transition-colors">FAQ</Link></li>
              <li><a href={`mailto:${SUPPORT_EMAIL}`} className="text-gray-400 hover:text-white text-sm transition-colors">Contact Us</a></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white text-sm transition-colors">About Courtlane</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-200">Join the Club</h3>
            <p className="text-gray-400 text-sm mb-4">Get early access to new drops and receive your first-order coupon.</p>
            <form className="flex" onSubmit={handleJoinSubmit}>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address" 
                required
                className="bg-gray-900 border border-gray-800 text-white px-4 py-2 w-full text-sm focus:outline-none focus:border-teal-500 rounded-l-sm"
              />
              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-teal-700 hover:bg-teal-600 px-4 py-2 text-sm font-medium transition-colors rounded-r-sm disabled:opacity-60"
              >
                {isSubmitting ? 'Sending...' : 'Join'}
              </button>
            </form>
            {success && (
              <p className="mt-2 text-xs text-emerald-400">
                You&apos;re in. Check your inbox for code <span className="font-semibold">{couponCode}</span>.
              </p>
            )}
            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
            <ul className="space-y-3 mt-6">
              <li><Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-500 text-xs">
              Secure checkout, straightforward returns, and support when you need it.
            </p>
          </div>
          <p className="text-gray-500 text-xs mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Courtlane Pickleball. All rights reserved.
          </p>
          <div className="flex space-x-6">
            {/* Social icons would go here */}
            <span className="text-gray-500 text-xs">Instagram</span>
            <span className="text-gray-500 text-xs">TikTok</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
