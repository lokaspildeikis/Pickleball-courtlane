import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-950 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-12 mb-12">
          
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="inline-flex items-center mb-4" aria-label="Go to homepage">
              <img
                src="/logo-courtlane.svg"
                alt="Courtlane"
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Premium pickleball accessories designed for players who demand performance, durability, and style on the court.
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
              <li><Link to="/faq" className="text-gray-400 hover:text-white text-sm transition-colors">FAQ</Link></li>
              <li><a href="mailto:support@courtlane.example.com" className="text-gray-400 hover:text-white text-sm transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-200">Shipping</h3>
            <ul className="space-y-3">
              <li><Link to="/shipping" className="text-gray-400 hover:text-white text-sm transition-colors">Shipping Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-200">Returns</h3>
            <ul className="space-y-3">
              <li><Link to="/returns" className="text-gray-400 hover:text-white text-sm transition-colors">Returns Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-200">Join the Club</h3>
            <p className="text-gray-400 text-sm mb-4">Subscribe for early access to new drops and exclusive court tips.</p>
            <form className="flex" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-gray-900 border border-gray-800 text-white px-4 py-2 w-full text-sm focus:outline-none focus:border-teal-500 rounded-l-sm"
              />
              <button 
                type="submit"
                className="bg-teal-700 hover:bg-teal-600 px-4 py-2 text-sm font-medium transition-colors rounded-r-sm"
              >
                Join
              </button>
            </form>
          </div>

        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
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
