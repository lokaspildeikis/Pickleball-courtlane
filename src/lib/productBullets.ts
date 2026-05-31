/**
 * Product-specific bullet point highlights shown on the product detail page.
 * Key = Shopify product handle.
 * Each bullet has an icon name (lucide-react) and a short label.
 */

export type BulletIcon =
  | 'Zap'
  | 'Shield'
  | 'Star'
  | 'CheckCircle'
  | 'Package'
  | 'Wind'
  | 'Award'
  | 'Layers'
  | 'Grip'
  | 'Clock'
  | 'Repeat'
  | 'Droplets'
  | 'Thermometer'
  | 'Tag'
  | 'Users';

export interface ProductBullet {
  icon: BulletIcon;
  label: string;
}

const bullets: Record<string, ProductBullet[]> = {
  'starter-bundle': [
    { icon: 'Package',     label: 'Everything to play in one order' },
    { icon: 'CheckCircle', label: 'No research required' },
    { icon: 'Shield',      label: '30-day money-back guarantee' },
  ],
  'pro-tour-overgrip-3-pack': [
    { icon: 'Grip',        label: 'Non-slip tacky grip surface' },
    { icon: 'Droplets',    label: 'Sweat-absorbent material' },
    { icon: 'Repeat',      label: '3-pack — replace after every few sessions' },
  ],
  'aero-paddle-cover': [
    { icon: 'Shield',      label: 'Full neoprene paddle protection' },
    { icon: 'Zap',         label: 'Slip-on in seconds' },
    { icon: 'Layers',      label: 'Fits standard & oversized paddles' },
  ],
  'cooling-performance-towel': [
    { icon: 'Thermometer', label: 'Instant cooling when wet' },
    { icon: 'Wind',        label: 'Dries fast between points' },
    { icon: 'Repeat',      label: 'Machine washable & reusable' },
  ],
  'court-pro-backpack': [
    { icon: 'Layers',      label: 'Holds 2 paddles + balls + gear' },
    { icon: 'Zap',         label: 'Padded back panel for all-day comfort' },
    { icon: 'Package',     label: 'Dedicated water bottle pocket' },
  ],
};

/** Fallback bullets used when no handle-specific entry exists. */
const fallbackBullets: ProductBullet[] = [
  { icon: 'CheckCircle', label: 'Built for everyday play' },
  { icon: 'Shield',      label: '30-day money-back guarantee' },
  { icon: 'Zap',         label: 'Ships within 1–2 business days' },
];

export function getProductBullets(handle: string): ProductBullet[] {
  return bullets[handle] ?? fallbackBullets;
}
