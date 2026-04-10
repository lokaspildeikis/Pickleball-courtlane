import { Lock } from "lucide-react";

/** Shopify-style icons (activemerchant/payment_icons, MIT). Self-host under /public/payment-icons/ if you prefer. */
const BASE =
  "https://raw.githubusercontent.com/activemerchant/payment_icons/master/app/assets/images/payment_icons";

const ICONS: { file: string; label: string }[] = [
  { file: "visa.svg", label: "Visa" },
  { file: "master.svg", label: "Mastercard" },
  { file: "american_express.svg", label: "American Express" },
  { file: "paypal.svg", label: "PayPal" },
  { file: "apple_pay.svg", label: "Apple Pay" },
  { file: "google_pay.svg", label: "Google Pay" },
  { file: "shopify_pay.svg", label: "Shop Pay" },
];

export function CheckoutPaymentMethods() {
  return (
    <div className="pt-3 mt-3 border-t border-gray-200">
      <p className="flex items-center gap-1.5 text-xs text-gray-600 mb-2.5">
        <Lock className="h-3.5 w-3.5 text-amber-600 shrink-0" strokeWidth={2} aria-hidden />
        <span>Secure checkout — cards &amp; popular wallets</span>
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2" aria-label="Payment methods">
        {ICONS.map(({ file, label }) => (
          <img
            key={file}
            src={`${BASE}/${file}`}
            alt={label}
            className="h-6 w-auto max-w-[3rem] object-contain opacity-90"
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
    </div>
  );
}
