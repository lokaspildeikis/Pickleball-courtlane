import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../lib/shopify';
import { getSyntheticReviewSummary } from '../../lib/syntheticReviews';

interface ProductCardProps {
  key?: React.Key;
  product: Product;
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

function getRoundedComparePrice(currentPrice: number): number {
  const increased = currentPrice * 1.15;
  const base = Math.floor(increased);
  let rounded = base + 0.99;

  // Ensure we always round up to the next .99 when needed.
  if (rounded < increased) {
    rounded = base + 1 + 0.99;
  }

  return Number(rounded.toFixed(2));
}

export function ProductCard({ product }: ProductCardProps) {
  const firstImage = product.images.edges[0]?.node;
  const price = product.priceRange.minVariantPrice;
  const compareAtPrice = product.compareAtPriceRange?.minVariantPrice;
  const currentPriceValue = parseFloat(price.amount);
  const existingCompareAtValue = compareAtPrice ? parseFloat(compareAtPrice.amount) : 0;
  const generatedCompareAtValue = getRoundedComparePrice(currentPriceValue);
  const displayCompareAtValue = Math.max(existingCompareAtValue, generatedCompareAtValue);
  const isSale = displayCompareAtValue > currentPriceValue;
  const isNew = product.tags.includes('new');
  const isBestSeller = product.tags.includes('best-seller');
  const reviewSummary = getSyntheticReviewSummary(product.handle);

  return (
    <Link to={`/product/${product.handle}`} className="group block">
      <div className="relative bg-white aspect-[4/5] mb-4 overflow-hidden rounded-sm border border-gray-100 flex items-center justify-center p-8">
        {firstImage ? (
          <img 
            src={firstImage.url} 
            alt={firstImage.altText || product.title}
            className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isSale && (
            <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm">
              Sale
            </span>
          )}
          {isNew && !isSale && (
            <span className="bg-teal-800 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm">
              New
            </span>
          )}
          {isBestSeller && !isSale && !isNew && (
            <span className="bg-gray-900 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm">
              Best Seller
            </span>
          )}
        </div>
      </div>
      
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          {renderStars(reviewSummary.rating)}
          <span>{reviewSummary.rating.toFixed(1)} • {reviewSummary.reviewCount} reviews</span>
        </div>
        <h3 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-teal-700 transition-colors">
          {product.title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">
            ${currentPriceValue.toFixed(2)}
          </span>
          {isSale && (
            <span className="text-xs text-gray-500 line-through">
              ${displayCompareAtValue.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
