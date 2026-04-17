import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, Product } from '../lib/shopify';
import { ProductCard } from '../components/product/ProductCard';
import { SlidersHorizontal } from 'lucide-react';
import { trackCustomEvent } from '../components/analytics/MetaPixel';

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const currentFilter = searchParams.get('filter') || 'all';
  const currentSort = searchParams.get('sort') || 'featured';
  const currentIntent = searchParams.get('intent') || 'all';

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  // Filter logic
  let filteredProducts = [...products];
  if (currentFilter !== 'all') {
    // Flexible tag matching (handles singular/plural and common typos)
    const filterTags = currentFilter === 'bundles' ? ['bundle', 'bundles'] :
                       currentFilter === 'rackets' ? ['racket', 'rackets'] :
                       currentFilter === 'grips' ? ['grip', 'grips'] :
                       currentFilter === 'backpacks' ? ['backpack', 'backpacks', 'backpakcs'] :
                       [currentFilter];
    
    filteredProducts = filteredProducts.filter(p => 
      p.tags.some(tag => filterTags.some(ft => tag.trim().toLowerCase() === ft.trim().toLowerCase()))
    );
  }

  // Intent filter logic (quick shopper paths)
  if (currentIntent !== 'all') {
    filteredProducts = filteredProducts.filter((p) => {
      const tags = p.tags.map((tag) => tag.trim().toLowerCase());
      const minPrice = parseFloat(p.priceRange.minVariantPrice.amount);

      if (currentIntent === 'best-seller') {
        return tags.includes('best-seller');
      }

      if (currentIntent === 'beginner') {
        return tags.some((tag) => ['beginner', 'starter', 'essentials', 'bundle'].includes(tag));
      }

      if (currentIntent === 'budget') {
        return minPrice <= 25;
      }

      return true;
    });
  }

  // Sort logic
  if (currentSort === 'price-low') {
    filteredProducts.sort((a, b) => parseFloat(a.priceRange.minVariantPrice.amount) - parseFloat(b.priceRange.minVariantPrice.amount));
  } else if (currentSort === 'price-high') {
    filteredProducts.sort((a, b) => parseFloat(b.priceRange.minVariantPrice.amount) - parseFloat(a.priceRange.minVariantPrice.amount));
  } else if (currentSort === 'newest') {
    // Mock sort for newest (assuming ID correlates to age for mock)
    filteredProducts.sort((a, b) => b.id.localeCompare(a.id));
  }

  const handleFilterChange = (filter: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (filter === 'all') next.delete('filter');
      else next.set('filter', filter);
      return next;
    });
    setIsFilterOpen(false);
    trackCustomEvent('ShopFilterChanged', { filter });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sort = e.target.value;
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('sort', sort);
      return next;
    });
    trackCustomEvent('ShopSortChanged', { sort });
  };

  const handleIntentChange = (intent: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (intent === 'all') next.delete('intent');
      else next.set('intent', intent);
      return next;
    });
    trackCustomEvent('ShopIntentSelected', { intent });
  };

  const handleClearFilters = () => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete('filter');
      next.delete('intent');
      next.delete('sort');
      return next;
    });
    setIsFilterOpen(false);
    trackCustomEvent('ShopFiltersCleared');
  };

  const hasActiveFilters = currentFilter !== 'all' || currentIntent !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tight uppercase italic text-gray-900 mb-4">
          {currentFilter === 'all' ? 'All Gear' : 
            currentFilter === 'bundles' ? 'Starter Bundles' :
           currentFilter === 'essentials' ? 'Court Essentials' :
           currentFilter === 'backpacks' ? 'Court Backpacks' :
           currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)}
        </h1>
        <p className="text-gray-500 max-w-2xl">
          Practical pickleball gear for everyday play—paddles, balls, bags, and small essentials without marketplace clutter.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-gray-200 gap-4">
        
        {/* Mobile Filter Toggle */}
        <button 
          className="sm:hidden flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-900"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>

        {/* Desktop Filters */}
        <div className={`flex-col sm:flex-row gap-6 ${isFilterOpen ? 'flex' : 'hidden sm:flex'} w-full sm:w-auto`}>
          <button 
            onClick={() => handleFilterChange('all')}
            className={`text-sm font-bold uppercase tracking-wide transition-colors ${currentFilter === 'all' ? 'text-teal-700 border-b-2 border-teal-700 pb-1' : 'text-gray-500 hover:text-gray-900'}`}
          >
            All
          </button>
          <button 
            onClick={() => handleFilterChange('essentials')}
            className={`text-sm font-bold uppercase tracking-wide transition-colors ${currentFilter === 'essentials' ? 'text-teal-700 border-b-2 border-teal-700 pb-1' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Essentials
          </button>
          <button 
            onClick={() => handleFilterChange('rackets')}
            className={`text-sm font-bold uppercase tracking-wide transition-colors ${currentFilter === 'rackets' ? 'text-teal-700 border-b-2 border-teal-700 pb-1' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Rackets
          </button>
          <button 
            onClick={() => handleFilterChange('grips')}
            className={`text-sm font-bold uppercase tracking-wide transition-colors ${currentFilter === 'grips' ? 'text-teal-700 border-b-2 border-teal-700 pb-1' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Grips
          </button>
          <button 
            onClick={() => handleFilterChange('protection')}
            className={`text-sm font-bold uppercase tracking-wide transition-colors ${currentFilter === 'protection' ? 'text-teal-700 border-b-2 border-teal-700 pb-1' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Protection
          </button>
          <button 
            onClick={() => handleFilterChange('bundles')}
            className={`text-sm font-bold uppercase tracking-wide transition-colors ${currentFilter === 'bundles' ? 'text-teal-700 border-b-2 border-teal-700 pb-1' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Bundles
          </button>
          <button 
            onClick={() => handleFilterChange('backpacks')}
            className={`text-sm font-bold uppercase tracking-wide transition-colors ${currentFilter === 'backpacks' ? 'text-teal-700 border-b-2 border-teal-700 pb-1' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Backpacks
          </button>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs sm:text-sm text-gray-500 mr-2">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
          </span>
          <label htmlFor="sort" className="text-sm text-gray-500 hidden sm:block">Sort by:</label>
          <select 
            id="sort"
            value={currentSort}
            onChange={handleSortChange}
            className="text-sm font-medium text-gray-900 border-none bg-transparent focus:ring-0 cursor-pointer py-1 pl-0 pr-8"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Quick picks:</span>
        <button
          onClick={() => handleIntentChange('beginner')}
          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
            currentIntent === 'beginner'
              ? 'border-teal-700 bg-teal-50 text-teal-800'
              : 'border-gray-300 text-gray-700 hover:border-gray-400'
          }`}
        >
          Beginner Friendly
        </button>
        <button
          onClick={() => handleIntentChange('best-seller')}
          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
            currentIntent === 'best-seller'
              ? 'border-teal-700 bg-teal-50 text-teal-800'
              : 'border-gray-300 text-gray-700 hover:border-gray-400'
          }`}
        >
          Best Seller
        </button>
        <button
          onClick={() => handleIntentChange('budget')}
          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
            currentIntent === 'budget'
              ? 'border-teal-700 bg-teal-50 text-teal-800'
              : 'border-gray-300 text-gray-700 hover:border-gray-400'
          }`}
        >
          Budget Picks
        </button>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="ml-1 text-xs font-semibold uppercase tracking-wide text-teal-700 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i}>
              <div className="bg-gray-200 aspect-[4/5] mb-4 rounded-sm"></div>
              <div className="h-4 bg-gray-200 w-3/4 mb-2 rounded-sm"></div>
              <div className="h-4 bg-gray-200 w-1/4 rounded-sm"></div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Try changing your filters to see more results.</p>
          <button 
            onClick={() => handleFilterChange('all')}
            className="mt-4 text-teal-700 font-bold uppercase tracking-wide text-sm hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
}
