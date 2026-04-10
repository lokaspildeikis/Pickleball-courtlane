import { ShieldCheck, RefreshCcw, Truck, Mail } from "lucide-react";
import { TrustPoint } from "../../lib/trustContent";

const ICON_BY_ID = {
  "secure-checkout": ShieldCheck,
  "returns-30": RefreshCcw,
  processing: Truck,
  "shipping-estimate": Truck,
  "email-support": Mail,
  "pickleball-focused": ShieldCheck,
} as const;

type TrustPointsRowProps = {
  points: TrustPoint[];
  className?: string;
};

export function TrustPointsRow({ points, className = "" }: TrustPointsRowProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 ${className}`}>
      {points.map((point) => {
        const Icon = ICON_BY_ID[point.id as keyof typeof ICON_BY_ID] ?? ShieldCheck;
        return (
          <div key={point.id} className="flex items-center gap-2 text-sm text-gray-700">
            <Icon size={16} className="text-teal-700 shrink-0" />
            <span>{point.label}</span>
          </div>
        );
      })}
    </div>
  );
}

