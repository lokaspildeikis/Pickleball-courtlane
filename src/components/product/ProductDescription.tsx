import { Link } from 'react-router-dom';
import type { Product } from '../../lib/shopify';
import { formatProductDescription } from '../../lib/productDescription';

interface ProductDescriptionProps {
  product: Product;
}

export function ProductDescription({ product }: ProductDescriptionProps) {
  const content = formatProductDescription(product);

  return (
    <section className="space-y-5 text-gray-700">
      <p className="text-base leading-relaxed">{content.intro}</p>

      {content.features.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 mb-2">Key Features & Specs</h3>
          <ul className="space-y-2 text-sm md:text-base">
            {content.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-teal-600 shrink-0" aria-hidden="true"></span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 mb-1">Who It's For</h3>
        <p className="text-sm md:text-base">{content.useCase}</p>
      </div>

      {content.note && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 mb-1">Note</h3>
          <p className="text-sm md:text-base">{content.note}</p>
        </div>
      )}

      <p className="text-sm text-gray-500 pt-2 border-t border-gray-100">
        Shipping, returns, and taxes: see our{' '}
        <Link to="/shipping" className="text-teal-700 hover:underline font-medium">
          shipping
        </Link>{' '}
        and{' '}
        <Link to="/returns" className="text-teal-700 hover:underline font-medium">
          returns
        </Link>{' '}
        pages for details.
      </p>
    </section>
  );
}

