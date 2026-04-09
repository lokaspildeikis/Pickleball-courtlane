import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, Product } from '../lib/shopify';
import { ProductCard } from '../components/product/ProductCard';
import { Button } from '../components/ui/Button';
import { WhyBuyCourtlane } from '../components/home/WhyBuyCourtlane';
import { ShieldCheck, Zap, RefreshCcw, Truck } from 'lucide-react';

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
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
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

      <WhyBuyCourtlane />

      {/* Trust Bar */}
      <section className="bg-teal-900 text-teal-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-teal-800">
            <div className="flex items-center justify-center gap-3 pt-4 md:pt-0">
              <Zap size={20} className="text-teal-400" />
              <span className="text-sm font-medium uppercase tracking-wide">Pro-Level Performance</span>
            </div>
            <div className="flex items-center justify-center gap-3 pt-4 md:pt-0">
              <ShieldCheck size={20} className="text-teal-400" />
              <span className="text-sm font-medium uppercase tracking-wide">Premium Materials</span>
            </div>
            <div className="flex items-center justify-center gap-3 pt-4 md:pt-0">
              <Truck size={20} className="text-teal-400" />
              <span className="text-sm font-medium uppercase tracking-wide">Free Shipping</span>
            </div>
            <div className="flex items-center justify-center gap-3 pt-4 md:pt-0">
              <RefreshCcw size={20} className="text-teal-400" />
              <span className="text-sm font-medium uppercase tracking-wide">30-Day Returns</span>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-black tracking-tight uppercase italic text-gray-900">Best Sellers</h2>
            <p className="text-gray-500 mt-2">The gear our community loves most.</p>
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
              <span className="text-teal-700 font-bold text-sm uppercase tracking-widest mb-2 block">Save 15%</span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase italic text-gray-900 mb-4">
                The Starter Bundle
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                Everything you need to start strong on day one. Includes pickleball balls, a paddle, and performance grips in one ready-to-play kit.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-3"></div>
                  Pickleball Balls
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-3"></div>
                  Pickleball Paddle
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-3"></div>
                  Performance Grips
                </li>
              </ul>
              <Link to="/shop?filter=bundles">
                <Button size="lg">Shop Bundle - $45</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
