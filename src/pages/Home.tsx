import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, Product } from '../lib/shopify';
import { ProductCard } from '../components/product/ProductCard';
import { Button } from '../components/ui/Button';
import { WhyBuyCourtlane } from '../components/home/WhyBuyCourtlane';
import { HomeBrandStory } from '../components/home/HomeBrandStory';
import { PageMeta } from '../components/seo/PageMeta';
import { Link2 } from 'lucide-react';
import { TRUST_POINTS } from '../lib/trustContent';
import { TrustPointsRow } from '../components/trust/TrustPointsRow';

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const bestSellers = products.filter(p => p.tags.includes('best-seller')).slice(0, 4);
  const bundles = products.filter(p => p.tags.includes('bundle')).slice(0, 4);

  // If we don't have enough tagged products, just use the first few
  const displayBestSellers = bestSellers.length > 0 ? bestSellers : products.slice(0, 4);
  const displayBundles = bundles.length > 0 ? bundles : products.slice(0, 4);

  return (
    <div>
      <PageMeta
        title="Courtlane — Pickleball essentials for everyday players"
        description="Pickleball accessories and essentials for beginners and recreational players. Simple gear, clear listings, secure checkout, and straightforward support."
      />
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        {/* TODO: replace with on-brand Courtlane photography (avoid stock that reads as generic template). */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/f/f7/Pickleball_Pros.jpg" 
            alt="Pickleball court" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 lg:py-40">
          <div className="max-w-2xl">
            {/* Updated hero copy to immediately communicate product, audience, and support benefit. */}
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-4 leading-tight">
              Pickleball Essentials for <span className="text-teal-400 md:text-teal-500">Everyday Players.</span>
            </h1>
            <p className="text-base md:text-xl text-gray-300 mb-8 max-w-lg">
              Reliable gear for beginners and rec players, backed by straightforward support so you can play with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/shop">
                <Button size="lg" className="w-full sm:w-auto">Shop Court Essentials</Button>
              </Link>
              {/* Keep one primary action while offering a lower-emphasis path for bundle shoppers. */}
              <Link to="/shop?filter=bundles">
                <span className="inline-flex items-center h-full text-sm font-semibold uppercase tracking-wide text-gray-200 hover:text-white transition-colors">
                  View Starter Bundles
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <TrustPointsRow points={TRUST_POINTS.homeTop} className="sm:grid-cols-3" />
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              <Link to="/shipping" className="inline-flex items-center gap-1 hover:text-teal-700">
                <Link2 size={14} />
                Shipping policy
              </Link>
              <Link to="/returns" className="hover:text-teal-700">Returns policy</Link>
              <Link to="/faq" className="hover:text-teal-700">Help & FAQ</Link>
            </div>
          </div>
        </div>
      </section>

      <HomeBrandStory />

      {/* Store confidence strip */}
      <section className="bg-teal-900 text-teal-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-teal-800">
            <div className="pt-4 md:pt-0">
              <span className="text-sm font-medium uppercase tracking-wide">Secure Checkout</span>
            </div>
            <div className="pt-4 md:pt-0">
              <span className="text-sm font-medium uppercase tracking-wide">Worldwide Shipping</span>
            </div>
            <div className="pt-4 md:pt-0">
              <span className="text-sm font-medium uppercase tracking-wide">30-Day Returns</span>
            </div>
            <div className="pt-4 md:pt-0">
              <span className="text-sm font-medium uppercase tracking-wide">Support by Email</span>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-black tracking-tight uppercase italic text-gray-900">Best Sellers</h2>
            <p className="text-gray-500 mt-2">Popular picks for everyday play and practice.</p>
          </div>
          <Link to="/shop" className="hidden md:block text-teal-700 font-bold text-sm uppercase tracking-wide hover:underline">
            Shop All &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i}>
                <div className="bg-gray-200 aspect-[4/5] mb-4 rounded-sm"></div>
                <div className="h-4 bg-gray-200 w-3/4 mb-2 rounded-sm"></div>
                <div className="h-4 bg-gray-200 w-1/4 rounded-sm"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
            {displayBestSellers.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center md:hidden">
          <Link to="/shop">
            <Button variant="outline" className="w-full">Shop All</Button>
          </Link>
        </div>
      </section>

      <WhyBuyCourtlane />

      {/* Bundle Feature */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="w-full md:w-1/2">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/f/f7/Pickleball_Pros.jpg" 
                alt="Pickleball gear bundle" 
                className="w-full h-auto rounded-sm shadow-xl"
              />
            </div>
            <div className="w-full md:w-1/2 md:pl-8">
              <span className="text-teal-700 font-bold text-sm uppercase tracking-widest mb-2 block">Bundles</span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase italic text-gray-900 mb-4">
                Starter kits &amp; bundles
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                One place to grab paddles, balls, grips, and other basics together—less scrolling, fewer separate orders.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-3"></div>
                  Geared toward beginners and rec players
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-3"></div>
                  Clear listings—no factory spec walls
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-3"></div>
                  Pricing shown on each product page
                </li>
              </ul>
              <Link to="/shop?filter=bundles">
                <Button size="lg">Shop bundles</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
