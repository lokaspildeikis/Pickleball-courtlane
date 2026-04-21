type CheckoutConfidenceProps = {
  freeShipping?: boolean;
  className?: string;
};

export function CheckoutConfidence({ freeShipping = true, className = "" }: CheckoutConfidenceProps) {
  const bullets = [
    freeShipping ? "Free shipping on this order" : null,
    "Easy 30-day money-back guarantee",
    "Secure Shopify checkout - all payments encrypted",
  ].filter(Boolean) as string[];

  return (
    <section
      className={`rounded-sm border border-gray-200 bg-white p-3 ${className}`}
      aria-label="Checkout confidence details"
    >
      <h3 className="text-sm font-semibold text-gray-900">Checkout with confidence</h3>
      <ul className="mt-2 space-y-1.5 text-xs text-gray-700 sm:text-sm">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2">
            <span aria-hidden="true" className="mt-[2px] shrink-0 text-[10px] text-emerald-700">
              ●
            </span>
            <span className="min-w-0">{bullet}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
