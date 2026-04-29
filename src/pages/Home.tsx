import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, Product } from '../lib/shopify';
import { ProductCard } from '../components/product/ProductCard';
import { Button } from '../components/ui/Button';
import { WhyBuyCourtlane } from '../components/home/WhyBuyCourtlane';
import { HomeBrandStory } from '../components/home/HomeBrandStory';
import { PageMeta } from '../components/seo/PageMeta';
import { SUPPORT_EMAIL, TRUST_POINTS } from '../lib/trustContent';
import { TrustPointsRow } from '../components/trust/TrustPointsRow';

const FEATURED_BUNDLE_IMAGE = '/images/featured-bundle-sale.png';
const STARTER_KIT_IMAGE = '/images/offer-starter-kit.png';

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
  const starterBundleShopifyImage = starterBundleProduct?.images.edges[0]?.node.url || FEATURED_BUNDLE_IMAGE;
  const findOfferProduct = (keywords: string[]) => products.find((product) => {
    const haystack = `${product.handle} ${product.title} ${product.tags.join(' ')}`.toLowerCase();
    return keywords.every((keyword) => haystack.includes(keyword));
  });
  const findDifferentOfferProduct = (keywords: string[], excludedId?: string) => products.find((product) => {
    if (excludedId && product.id === excludedId) return false;
    const haystack = `${product.handle} ${product.title} ${product.tags.join(' ')}`.toLowerCase();
    return keywords.every((keyword) => haystack.includes(keyword));
  });
  const starterKitProduct = findOfferProduct(['raw', 'carbon', 'fiber'])
    || findOfferProduct(['usapa', 'graphite', 'paddle']);
  const starterBundleNo2Product = findDifferentOfferProduct(['starter', 'bundle'], starterKitProduct?.id)
    || findDifferentOfferProduct(['bundle'], starterKitProduct?.id)
    || (starterBundleProduct?.id === starterKitProduct?.id ? undefined : starterBundleProduct);
  const heroOffers = [
    {
      label: 'Starter Kit',
      fallbackHref: '/shop?filter=bundles',
      fallbackImage: STARTER_KIT_IMAGE,
      product: starterKitProduct,
    },
    {
      label: 'Starter Bundle No2',
      fallbackHref: starterBundleHref,
      fallbackImage: FEATURED_BUNDLE_IMAGE,
      product: starterBundleNo2Product,
    },
    {
      label: 'Gift Bundle',
      fallbackHref: '/shop?filter=bundles',
      fallbackImage: FEATURED_BUNDLE_IMAGE,
      product: findOfferProduct(['gift', 'bundle']),
    },
  ];

  return (
    <div>
      <PageMeta
        title="Courtlane — Low-impact pickleball for active adults"
        description="Pickleball is a low-impact sport that is easy to learn and gentle on joints. Discover beginner-friendly gear and bundles for adults who want a safe, simple way to stay active."
        canonicalPath="/"
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
            {/* Hero copy for ad traffic focused on low-impact activity for adults 45+. */}
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-4 leading-tight">
              Pickleball Starter Kits &amp; Bundles for <span className="text-teal-400 md:text-teal-500">Active Adults.</span>
            </h1>
            <p className="text-base md:text-xl text-gray-300 mb-8 max-w-lg">
              Pickleball is a low-impact game that is easy to learn, fun to play, and a safe way for adults 45+ to keep moving.
            </p>
            <a
              href="https://usapickleball.org/docs/rules/USAP-Official-Rulebook.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-semibold uppercase tracking-wide text-teal-300 hover:text-teal-200 transition-colors mb-6"
            >
              Download official pickleball rules (PDF)
            </a>
            <div className="mb-6">
              <a
                href="https://www.youtube.com/watch?v=fTvPYdKZqO0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-semibold uppercase tracking-wide text-teal-300 hover:text-teal-200 transition-colors"
              >
                Watch how to play pickleball (YouTube)
              </a>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={starterBundleHref}>
                <Button size="lg" className="w-full sm:w-auto">Get Started With Pickleball</Button>
              </Link>
              {/* Keep one primary action while offering a lower-emphasis path for bundle shoppers. */}
              <Link to="/shop?filter=bundles">
                <span className="inline-flex items-center h-full text-sm font-semibold uppercase tracking-wide text-gray-200 hover:text-white transition-colors">
                  Compare all bundles
                </span>
              </Link>
            </div>
            <p className="mt-3 text-xs uppercase tracking-wide text-gray-300">
              Beginner-friendly, low-impact, and easy to start
            </p>
            <div className="mt-6 lg:hidden">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {heroOffers.map((offer) => {
                  const href = offer.product ? `/product/${offer.product.handle}` : offer.fallbackHref;
                  const image = offer.product?.images.edges[0]?.node.url || offer.fallbackImage;
                  const rawPrice = offer.product
                    ? offer.product.variants.edges[0]?.node.price.amount
                      ?? offer.product.priceRange.minVariantPrice.amount
                    : null;
                  const price = rawPrice ? `$${Number.parseFloat(rawPrice).toFixed(2)}` : null;

                  return (
                    <Link
                      key={`mobile-${offer.label}`}
                      to={href}
                      className="group min-w-[220px] flex-1 rounded-sm border border-white/15 bg-white/5 p-3 hover:bg-white/10 transition-colors"
                      aria-label={`Open ${offer.label} product`}
                    >
                      <img
                        src={image}
                        alt={offer.product?.title || offer.label}
                        className="h-28 w-full rounded-sm object-cover opacity-95"
                      />
                      <div className="min-w-0 mt-2">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-teal-200/90">On sale</p>
                        <h3 className="text-sm font-semibold text-white truncate">
                          {offer.product?.title || offer.label}
                        </h3>
                      </div>
                      <span className="mt-1 block text-sm font-bold text-white whitespace-nowrap">
                        {price || 'View'}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
            </div>

            <div className="hidden lg:flex lg:col-span-5 justify-end">
              <div className="w-full max-w-[560px]">
                <div className="grid grid-cols-3 gap-3">
                {heroOffers.map((offer) => {
                  const href = offer.product ? `/product/${offer.product.handle}` : offer.fallbackHref;
                  const image = offer.product?.images.edges[0]?.node.url || offer.fallbackImage;
                  const rawPrice = offer.product
                    ? offer.product.variants.edges[0]?.node.price.amount
                      ?? offer.product.priceRange.minVariantPrice.amount
                    : null;
                  const price = rawPrice ? `$${Number.parseFloat(rawPrice).toFixed(2)}` : null;

                  return (
                    <Link
                      key={offer.label}
                      to={href}
                      className="group rounded-sm border border-white/15 bg-white/5 p-3 hover:bg-white/10 transition-colors"
                      aria-label={`Open ${offer.label} product`}
                    >
                      <img
                        src={image}
                        alt={offer.product?.title || offer.label}
                        className="h-28 w-full rounded-sm object-cover opacity-95"
                      />
                      <div className="min-w-0 mt-2">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-teal-200/90">On sale</p>
                        <h3 className="text-sm font-semibold text-white truncate">
                          {offer.product?.title || offer.label}
                        </h3>
                      </div>
                      <span className="mt-1 block text-sm font-bold text-white whitespace-nowrap">
                        {price || 'View'}
                      </span>
                    </Link>
                  );
                })}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 md:pb-10">
          <p className="inline-flex items-center rounded-sm border border-amber-300/40 bg-amber-300/15 px-3 py-1.5 text-xs md:text-sm font-bold uppercase tracking-wide text-amber-200">
            Limited-time free express shipping on all orders
          </p>
        </div>
      </section>

      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <TrustPointsRow points={TRUST_POINTS.homeTop} className="sm:grid-cols-2 lg:grid-cols-3" />
        </div>
      </section>

      <section className="bg-white py-12 md:py-16 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase italic text-gray-900 mb-4">
                What is pickleball?
              </h2>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                Pickleball is a paddle game that mixes parts of tennis, badminton, and ping-pong.
                It is played on a smaller court, so there is less running and less impact on knees, hips, and back.
              </p>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase italic text-gray-900 mb-4">
                Why adults 45+ love it
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-3" />
                  Easy to learn, even if you have not played sports in years
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-3" />
                  Gentle on joints compared to high-impact workouts
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-3" />
                  A safe, social way to stay active at your own pace
                </li>
              </ul>
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
              <span className="text-sm font-medium uppercase tracking-wide">Limited-time express shipping</span>
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-100 mb-1">On sale now</p>
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
                src={starterBundleShopifyImage}
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

      <section className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Shop with confidence</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-black tracking-tight uppercase italic text-gray-900">
              Real support and clear policies before you checkout
            </h2>
            <p className="mt-3 text-gray-600">
              No marketplace mystery sellers. Every order goes through secure checkout with clear shipping and return pages you can read before placing an order.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-sm border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-900">Shipping expectations</p>
              <p className="mt-2 text-sm text-gray-700">Orders are usually processed in 1-3 business days, with timelines explained in full before checkout.</p>
              <Link to="/shipping" className="mt-3 inline-block text-xs font-semibold uppercase tracking-wide text-teal-700 hover:underline">
                View shipping policy
              </Link>
            </div>
            <div className="rounded-sm border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-900">Returns and guarantee</p>
              <p className="mt-2 text-sm text-gray-700">Not satisfied? Eligible unused items are covered by our 30-day money-back guarantee.</p>
              <Link to="/returns" className="mt-3 inline-block text-xs font-semibold uppercase tracking-wide text-teal-700 hover:underline">
                View returns policy
              </Link>
            </div>
            <div className="rounded-sm border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-900">Need product help first?</p>
              <p className="mt-2 text-sm text-gray-700">Questions about fit, bundles, or what to buy first? Reach out before placing your order.</p>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-3 inline-block text-xs font-semibold uppercase tracking-wide text-teal-700 hover:underline">
                Email {SUPPORT_EMAIL}
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
