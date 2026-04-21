type TrustBarProps = {
  className?: string;
};

const trustItems = [
  { id: "money-back", icon: "↺", text: "30-Day Money-Back Guarantee" },
  { id: "free-shipping", icon: "🚚", text: "Worldwide Free Shipping (10-14 business days)" },
  { id: "secure-checkout", icon: "🔒", text: "Secure checkout - Encrypted payments" },
];

export function TrustBar({ className = "" }: TrustBarProps) {
  return (
    <div
      className={`rounded-sm border border-gray-200 bg-gray-50 p-3 sm:p-4 ${className}`}
      aria-label="Trust and shipping information"
    >
      <ul className="flex flex-col gap-2 text-sm text-gray-700 sm:flex-row sm:flex-wrap sm:gap-3">
        {trustItems.map((item) => (
          <li key={item.id} className="flex items-start gap-2 sm:flex-1 sm:min-w-[180px]">
            <span aria-hidden="true" className="mt-0.5 shrink-0 text-base leading-none">
              {item.icon}
            </span>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
