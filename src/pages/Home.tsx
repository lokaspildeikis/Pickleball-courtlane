import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, Product } from '../lib/shopify';
import { ProductCard } from '../components/product/ProductCard';
import { Button } from '../components/ui/Button';
import { WhyBuyCourtlane } from '../components/home/WhyBuyCourtlane';
import { HomeBrandStory } from '../components/home/HomeBrandStory';
import { PageMeta } from '../components/seo/PageMeta';
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
  const starterBundleProduct = products.find((product) => {
    const tags = product.tags.map((tag) => tag.toLowerCase());
    const haystack = `${product.handle} ${product.title}`.toLowerCase();
    return (
      tags.some((tag) => ['starter', 'bundle', 'best-seller'].includes(tag)) &&
      (haystack.includes('starter') || haystack.includes('bundle') || haystack.includes('essentials'))
    );
  });
  const starterBundleHref = starterBundleProduct ? `/product/${starterBundleProduct.handle}` : '/shop?filter=bundles';
  const starterBundleImage = starterBundleProduct?.images.edges[0]?.node.url
    || 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Pickleball_Pros.jpg';
  const starterBundleRawPrice = starterBundleProduct
    ? starterBundleProduct.variants.edges[0]?.node.price.amount
      ?? starterBundleProduct.priceRange.minVariantPrice.amount
    : null;
  const starterBundlePrice = starterBundleRawPrice
    ? Number.parseFloat(starterBundleRawPrice).toFixed(2)
    : null;

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
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10">
            <div className="lg:col-span-7 max-w-2xl">
            {/* Updated hero copy to immediately communicate product, audience, and support benefit. */}
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-4 leading-tight">
              Pickleball Essentials for <span className="text-teal-400 md:text-teal-500">Everyday Players.</span>
            </h1>
            <p className="text-base md:text-xl text-gray-300 mb-8 max-w-lg">
              Free shipping on every order, plus a 30-day money-back guarantee if you are not satisfied.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={starterBundleHref}>
                <Button size="lg" className="w-full sm:w-auto">Shop Starter Bundle</Button>
              </Link>
              {/* Keep one primary action while offering a lower-emphasis path for bundle shoppers. */}
              <Link to="/shop?filter=bundles">
                <span className="inline-flex items-center h-full text-sm font-semibold uppercase tracking-wide text-gray-200 hover:text-white transition-colors">
                  Compare all bundles
                </span>
              </Link>
            </div>
            <p className="mt-3 text-xs uppercase tracking-wide text-gray-300">
              Most popular with first-time players
            </p>
            </div>

            <div className="hidden lg:flex lg:col-span-5 justify-end">
              <Link
                to={starterBundleHref}
                className="group block w-full max-w-[320px] rounded-sm border border-white/15 bg-white/5 overflow-hidden hover:bg-white/10 transition-colors"
                aria-label="Open starter bundle product"
              >
                <div className="aspect-[5/4] overflow-hidden">
                  <img
                    src={starterBundleImage}
                    alt={starterBundleProduct?.title || 'Starter bundle'}
                    className="w-full h-full object-cover opacity-95 group-hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
                <div className="p-3.5">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-teal-200/90">Starter bundle</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white truncate">
                      {starterBundleProduct?.title || 'Starter Bundle'}
                    </h3>
                    <span className="text-sm font-bold text-white whitespace-nowrap">
                      {starterBundlePrice ? `$${starterBundlePrice}` : 'View'}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <TrustPointsRow points={TRUST_POINTS.homeTop} className="sm:grid-cols-2 lg:grid-cols-3" />
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
              <span className="text-sm font-medium uppercase tracking-wide">30-Day Money-Back Guarantee</span>
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

      <section className="bg-teal-700 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-100 mb-1">Starter pick</p>
            <h3 className="text-2xl md:text-3xl font-black uppercase italic">Skip the guesswork. Start with one bundle.</h3>
            <p className="text-teal-100 mt-2">Your fastest path from browsing to getting court-ready gear.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to={starterBundleHref}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-teal-600 hover:text-white">
                View starter bundle
              </Button>
            </Link>
            <Link to="/shop?filter=bundles">
              <Button size="lg" className="w-full sm:w-auto bg-teal-900 text-white hover:bg-teal-950">
                Browse bundles
              </Button>
            </Link>
          </div>
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
