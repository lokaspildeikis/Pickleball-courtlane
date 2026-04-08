import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct, Product } from '../lib/shopify';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/Button';
import { Minus, Plus, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { getSyntheticReviewSummary, getSyntheticReviews } from '../lib/syntheticReviews';

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
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>('');

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
  const hasMultipleVariants = product.variants.edges.length > 1 && product.variants.edges[0].node.title !== 'Default Title';
  const reviewSummary = getSyntheticReviewSummary(product.handle);
  const reviews = getSyntheticReviews(product.handle, product.title);

  const handleAddToCart = () => {
    addToCart({
      variantId: selectedVariant.id,
      productId: product.id,
      title: product.title,
      variantTitle: selectedVariant.title,
      price: parseFloat(selectedVariant.price.amount),
      image: activeImage || product.images.edges[0]?.node.url,
      quantity: quantity
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
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

          {/* Variants */}
          {hasMultipleVariants && (
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 mb-3">
                Option: <span className="text-gray-500 font-normal">{selectedVariant.title}</span>
              </h3>
              <div className="flex flex-wrap gap-3">
                {product.variants.edges.map((v) => {
                  const variant = v.node;
                  const isSelected = selectedVariant.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={!variant.availableForSale}
                      className={`px-4 py-2 text-sm font-medium rounded-sm border transition-colors ${
                        isSelected 
                          ? 'border-teal-800 bg-teal-50 text-teal-900' 
                          : !variant.availableForSale 
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
                            : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                      }`}
                    >
                      {variant.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="mb-8">
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
                disabled={!selectedVariant.availableForSale}
              >
                {selectedVariant.availableForSale ? 'Add to Cart' : 'Sold Out'}
              </Button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-y border-gray-200 mb-8">
            <div className="flex items-center gap-3">
              <Truck size={20} className="text-teal-700" />
              <span className="text-sm font-medium text-gray-700">Fast Shipping</span>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw size={20} className="text-teal-700" />
              <span className="text-sm font-medium text-gray-700">30-Day Returns</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-teal-700" />
              <span className="text-sm font-medium text-gray-700">Secure Checkout</span>
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-sm md:prose-base prose-teal max-w-none text-gray-600">
            <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
          </div>

          {/* Simulated Reviews (Research) */}
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
              <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 font-medium">
                Simulated (Research)
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {reviewSummary.rating.toFixed(1)} / 5 • {reviewSummary.reviewCount} reviews
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
          </div>

        </div>
      </div>
    </div>
  );
}
