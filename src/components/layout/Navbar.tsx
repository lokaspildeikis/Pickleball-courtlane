import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useState } from 'react';

export function Navbar() {
  const { openCart, cartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100">
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
