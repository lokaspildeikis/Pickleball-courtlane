import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct, Product } from '../lib/shopify';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/Button';
import { ProductDescription } from '../components/product/ProductDescription';
import { Minus, Plus } from 'lucide-react';
import { getSyntheticReviewSummary, getSyntheticReviews } from '../lib/syntheticReviews';
import { TRUST_POINTS, POLICY_SNIPPETS } from '../lib/trustContent';
import { TrustPointsRow } from '../components/trust/TrustPointsRow';
import { PolicySnippetGrid } from '../components/trust/PolicySnippetGrid';
import { CheckoutPaymentMethods } from '../components/payments/CheckoutPaymentMethods';
import { TrustBar } from '../components/TrustBar';

type VariantNode = Product['variants']['edges'][number]['node'];
type VariantOption = { name: string; value: string };

const FALLBACK_OPTION_NAMES = ['Ball color', 'Sweatband color', 'Towel color'];

function extractVariantOptions(variant: VariantNode): VariantOption[] {
  if (variant.selectedOptions?.length) {
    return variant.selectedOptions;
  }

  const titleParts = variant.title
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);

  return titleParts.slice(0, 3).map((value, index) => ({
    name: FALLBACK_OPTION_NAMES[index] || `Option ${index + 1}`,
    value,
  }));
}

function getRoundedComparePrice(currentPrice: number): number {
  const increased = currentPrice * 1.15;
  const base = Math.floor(increased);
  let rounded = base + 0.99;

  if (rounded < increased) {
    rounded = base + 1 + 0.99;
  }

  return Number(rounded.toFixed(2));
}

function renderStars(rating: number) {
  const fullStars = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, idx) => (
        <span key={idx} className={idx < fullStars ? 'text-amber-500' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </div>
  );
}

export function ProductDetail() {
  const { handle } = useParams<{ handle: string }>();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedOptionValues, setSelectedOptionValues] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>('');
  const primaryCtaRef = useRef<HTMLDivElement | null>(null);
  const [showStickyMobileAtc, setShowStickyMobileAtc] = useState(false);
  const hasTrackedStickyShown = useRef(false);

  useEffect(() => {
    async function fetchProduct() {
      if (!handle) return;
      setLoading(true);
      const data = await getProduct(handle);
      setProduct(data);
      
      if (data) {
        // Set initial variant
        const firstAvailable = data.variants.edges.find(v => v.node.availableForSale)?.node || data.variants.edges[0].node;
        setSelectedVariant(firstAvailable);
        
        // Set initial image
        if (data.images.edges.length > 0) {
          setActiveImage(data.images.edges[0].node.url);
        }
      }
      setLoading(false);
    }
    fetchProduct();
  }, [handle]);

  useEffect(() => {
    if (!selectedVariant) return;
    const options = extractVariantOptions(selectedVariant);
    setSelectedOptionValues((prev) => {
      const next: Record<string, string> = {};
      options.forEach((option) => {
        next[option.name] = option.value;
      });
      return next;
    });
  }, [selectedVariant]);

  useEffect(() => {
    if (!product || !selectedVariant) return;
    // Removed custom Meta ViewContent event.
    // Shopify native integration handles product view tracking.
  }, [product, selectedVariant]);

  useEffect(() => {
    const target = primaryCtaRef.current;
    if (!target || typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyMobileAtc(!entry.isIntersecting);
      },
      { threshold: 0.2 },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [product?.id, selectedVariant?.id]);

  useEffect(() => {
    hasTrackedStickyShown.current = false;
    setShowStickyMobileAtc(false);
  }, [product?.id]);

  useEffect(() => {
    if (!showStickyMobileAtc || hasTrackedStickyShown.current) return;
    hasTrackedStickyShown.current = true;
    // Removed custom Meta custom event: StickyAtcShown.
    // Keeping sticky CTA UI behavior unchanged.
  }, [showStickyMobileAtc, product?.handle, product?.id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/2 aspect-square bg-gray-200 rounded-sm"></div>
          <div className="w-full md:w-1/2 space-y-6 pt-6">
            <div className="h-8 bg-gray-200 w-3/4 rounded-sm"></div>
            <div className="h-6 bg-gray-200 w-1/4 rounded-sm"></div>
            <div className="h-24 bg-gray-200 w-full rounded-sm"></div>
            <div className="h-12 bg-gray-200 w-full rounded-sm mt-8"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product || !selectedVariant) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
        <Link to="/shop">
          <Button>Back to Shop</Button>
        </Link>
      </div>
    );
  }

  const currentPriceValue = parseFloat(selectedVariant.price.amount);
  const existingCompareAtValue = selectedVariant.compareAtPrice ? parseFloat(selectedVariant.compareAtPrice.amount) : 0;
  const generatedCompareAtValue = getRoundedComparePrice(currentPriceValue);
  const displayCompareAtValue = Math.max(existingCompareAtValue, generatedCompareAtValue);
  const isSale = displayCompareAtValue > currentPriceValue;
  const allVariants: VariantNode[] = product.variants.edges.map((edge) => edge.node);
  const optionNamesFromVariants = Array.from(
    new Set(
      allVariants
        .flatMap((variant) => extractVariantOptions(variant).map((option) => option.name))
        .filter(Boolean),
    ),
  ).slice(0, 3);
  const productLevelOptions = (product.options || [])
    .filter((option) => option.name.toLowerCase() !== 'title')
    .slice(0, 3);
  const displayOptionNames = productLevelOptions.length > 0
    ? productLevelOptions.map((option) => option.name)
    : optionNamesFromVariants;
  const hasVariantChoices = displayOptionNames.some((name) => {
    const productOption = productLevelOptions.find((option) => option.name === name);
    if (productOption?.values?.length) {
      return productOption.values.length > 1;
    }
    const values = new Set(
      allVariants
        .map((variant) => extractVariantOptions(variant).find((option) => option.name === name)?.value || '')
        .filter(Boolean),
    );
    return values.size > 1;
  }) || allVariants.length > 1 || productLevelOptions.some((option) => option.values.length > 1);
  const reviews = getSyntheticReviews(product.handle, product.title);
  const reviewSummary = getSyntheticReviewSummary(product.handle);
  const visibleReviewCount = reviews.length;
  const visibleAverageRating = visibleReviewCount
    ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / visibleReviewCount).toFixed(1))
    : 0;
  const productTags = product.tags.map((tag) => tag.toLowerCase());
  const whoItsFor = productTags.some((tag) => ['beginner', 'starter', 'bundle'].includes(tag))
    ? 'Beginners and rec players who want a simple setup.'
    : 'Everyday players who want reliable gear without overthinking specs.';
  const whatsIncluded = productTags.includes('bundle') || productTags.includes('bundles')
    ? 'Selected essentials bundled together for faster setup.'
    : 'Core product shown above, ready for regular practice and play.';

  const getVariantOptionValue = (variant: VariantNode, optionName: string): string => {
    const option = extractVariantOptions(variant).find((entry) => entry.name === optionName);
    return option?.value || '';
  };

  const matchesSelectedValues = (
    variant: VariantNode,
    values: Record<string, string>,
    ignoredOptionName?: string,
  ): boolean => {
    return displayOptionNames.every((name) => {
      if (name === ignoredOptionName) return true;
      const selectedValue = values[name];
      if (!selectedValue) return true;
      return getVariantOptionValue(variant, name) === selectedValue;
    });
  };

  const getOptionValues = (optionName: string): string[] => {
    const productOption = productLevelOptions.find((option) => option.name === optionName);
    if (productOption?.values?.length) {
      return productOption.values.filter(Boolean);
    }
    return Array.from(
      new Set(
        allVariants
          .map((variant) => getVariantOptionValue(variant, optionName))
          .filter(Boolean),
      ),
    );
  };

  const isOptionValueEnabled = (optionName: string, candidateValue: string): boolean => {
    return allVariants.some((variant) => {
      if (getVariantOptionValue(variant, optionName) !== candidateValue) return false;
      return matchesSelectedValues(variant, selectedOptionValues, optionName);
    });
  };

  const findMatchingVariant = (values: Record<string, string>): VariantNode | null => {
    const exact = allVariants.find((variant) =>
      displayOptionNames.every((name) => {
        const selectedValue = values[name];
        if (!selectedValue) return true;
        return getVariantOptionValue(variant, name) === selectedValue;
      }),
    );
    if (exact) return exact;

    const fallback = allVariants.find((variant) => matchesSelectedValues(variant, values));
    return fallback || null;
  };

  const handleOptionSelection = (optionName: string, optionValue: string) => {
    const nextValues = { ...selectedOptionValues, [optionName]: optionValue };
    setSelectedOptionValues(nextValues);
    const matchedVariant = findMatchingVariant(nextValues);
    if (matchedVariant) {
      setSelectedVariant(matchedVariant);
    }
  };

  const combinationUnavailable = !selectedVariant?.availableForSale;

  const handleAddToCart = () => {
    if (!selectedVariant?.availableForSale) return;
    addToCart({
      variantId: selectedVariant.id,
      productId: product.id,
      title: product.title,
      variantTitle: selectedVariant.title,
      price: currentPriceValue,
      image: activeImage || product.images.edges[0]?.node.url,
      quantity: quantity
    });
    // Removed custom Meta AddToCart event.
    // Shopify native integration handles cart events.
  };

  const handleStickyAddToCart = () => {
    // Removed custom Meta custom event: StickyAtcClicked.
    handleAddToCart();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-28 md:pb-12">
      
      {/* Breadcrumbs */}
      <nav className="flex text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-gray-900">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-gray-900">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{product.title}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-12 lg:gap-16">
        
        {/* Image Gallery */}
        <div className="w-full md:w-1/2">
          <div className="bg-white aspect-square rounded-sm overflow-hidden mb-4 relative flex items-center justify-center p-4 border border-gray-100">
            {isSale && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm z-10">
                Sale
              </span>
            )}
            <img 
              src={activeImage} 
              alt={product.title} 
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          {/* Thumbnails */}
          {product.images.edges.length > 1 && (
            <div className="grid grid-cols-5 gap-4">
              {product.images.edges.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(img.node.url)}
                  className={`aspect-square bg-gray-50 rounded-sm overflow-hidden border-2 transition-colors ${activeImage === img.node.url ? 'border-teal-800' : 'border-transparent hover:border-gray-300'}`}
                >
                  <img src={img.node.url} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="w-full md:w-1/2 flex flex-col">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase italic text-gray-900 mb-2">
            {product.title}
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            {renderStars(visibleAverageRating || reviewSummary.rating)}
            <span>
              {(visibleAverageRating || reviewSummary.rating).toFixed(1)} / 5
            </span>
            <span aria-hidden="true">•</span>
            <span>{Math.max(reviewSummary.reviewCount, visibleReviewCount)} reviews</span>
          </div>
          
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl font-bold text-gray-900">
              ${currentPriceValue.toFixed(2)}
            </span>
            {isSale && (
              <span className="text-lg text-gray-500 line-through">
                ${displayCompareAtValue.toFixed(2)}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 mb-3">
            Orders are usually processed in 1-3 business days.
          </p>
          <p className={`text-sm mb-6 ${selectedVariant.availableForSale ? 'text-emerald-700' : 'text-gray-500'}`}>
            {selectedVariant.availableForSale ? 'In stock and ready to process.' : 'Currently out of stock.'}
          </p>
          <TrustBar className="mb-6" />

          <div className="mb-6 rounded-sm border border-gray-200 bg-gray-50 p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-700">Who this is for</p>
            <p className="text-sm text-gray-700">{whoItsFor}</p>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-700 pt-1">What&apos;s included</p>
            <p className="text-sm text-gray-700">{whatsIncluded}</p>
          </div>

          {/* Variants */}
          {hasVariantChoices && (
            <div className="mb-6">
              <div className="space-y-4">
                {displayOptionNames.map((optionName) => (
                  <div key={optionName}>
                    <label htmlFor={`option-${optionName}`} className="block text-sm font-bold uppercase tracking-wide text-gray-900 mb-2">
                      {optionName}
                    </label>
                    <select
                      id={`option-${optionName}`}
                      value={selectedOptionValues[optionName] || ''}
                      onChange={(event) => handleOptionSelection(optionName, event.target.value)}
                      className="w-full rounded-sm border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 focus:border-teal-700 focus:outline-none"
                    >
                      {getOptionValues(optionName).map((optionValue) => (
                        <option
                          key={optionValue}
                          value={optionValue}
                          disabled={!isOptionValueEnabled(optionName, optionValue)}
                        >
                          {optionValue}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                {combinationUnavailable && (
                  <p className="text-sm text-red-700">This combination is unavailable.</p>
                )}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="mb-8" ref={primaryCtaRef}>
            <div className="flex gap-4">
              <div className="flex items-center border border-gray-300 rounded-sm h-14 w-32">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 h-full text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="flex-1 text-center font-medium">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 h-full text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <Button 
                size="lg" 
                className="flex-1"
                onClick={handleAddToCart}
                disabled={combinationUnavailable}
              >
                {combinationUnavailable ? 'Sold Out' : 'Add to Cart'}
              </Button>
            </div>
            <div className="mt-4 rounded-sm border border-gray-200 bg-gray-50 p-3 sm:p-4">
              <TrustPointsRow points={TRUST_POINTS.productCta} />
              <CheckoutPaymentMethods />
            </div>
          </div>

          {/* Description — trust row lives above near Add to cart; policy snippets below */}
          <div className="max-w-none">
            <ProductDescription product={product} />
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Shipping, returns, and support</h2>
            <PolicySnippetGrid snippets={POLICY_SNIPPETS.productDetail} />
          </div>

          {/* Simulated Reviews (Research) */}
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
              <span className="text-xs px-2 py-1 rounded bg-white text-white border border-white font-medium" aria-hidden="true"></span>
            </div>
            {visibleReviewCount > 0 ? (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  {visibleAverageRating.toFixed(1)} / 5 • {Math.max(reviewSummary.reviewCount, visibleReviewCount)} reviews
                </p>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-sm p-4 bg-white">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-900">{review.author}</p>
                        <p className="text-xs text-gray-500">{review.date}</p>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        {renderStars(review.rating)}
                        <p className="text-sm text-teal-700 font-semibold">{review.rating.toFixed(1)}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">{review.title}</p>
                      <p className="text-sm text-gray-600">{review.text}</p>
                      {review.photoUrl && (
                        <img src={review.photoUrl} alt="Review attachment" className="mt-3 w-24 h-24 object-cover rounded" />
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-600">No reviews yet for this product.</p>
            )}
          </div>

        </div>
      </div>

      {showStickyMobileAtc && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur md:hidden">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Ready to checkout</p>
              <p className="text-sm font-bold text-gray-900">${currentPriceValue.toFixed(2)}</p>
            </div>
            <div className="flex items-center border border-gray-300 rounded-sm h-10">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 h-full text-gray-500 hover:text-gray-900"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 h-full text-gray-500 hover:text-gray-900"
              >
                <Plus size={14} />
              </button>
            </div>
            <Button onClick={handleStickyAddToCart} disabled={combinationUnavailable}>
              {combinationUnavailable ? 'Sold Out' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
