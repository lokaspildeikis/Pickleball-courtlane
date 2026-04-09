import type { Product } from './shopify';

export type ProductType =
  | 'balls'
  | 'paddle'
  | 'bag'
  | 'bundle'
  | 'towel'
  | 'sweat-accessory'
  | 'grip'
  | 'cover'
  | 'accessory';

export interface StructuredProductDescription {
  intro: string;
  features: string[];
  useCase: string;
  note?: string;
}

const SUPPLIER_NOISE_PATTERNS: RegExp[] = [
  /mainkey\d*\s*:/i,
  /brand name\s*:/i,
  /choice\s*:/i,
  /high-concerned chemical\s*:/i,
  /^cn\s*:/i,
];

function stripHtml(input: string): string {
  return input
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanText(input: string): string {
  const text = stripHtml(input)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !SUPPLIER_NOISE_PATTERNS.some((pattern) => pattern.test(line)))
    .join(' ');

  return text
    .replace(/\b(high quality|premium quality|perfect gift)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function extractListItems(html: string): string[] {
  const items = Array.from(html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)).map((match) =>
    cleanText(match[1] || ''),
  );

  return items.filter(Boolean).slice(0, 6);
}

function detectProductType(product: Product): ProductType {
  const haystack = `${product.title} ${product.tags.join(' ')} ${product.description}`.toLowerCase();
  if (haystack.includes('ball')) return 'balls';
  if (haystack.includes('paddle')) return 'paddle';
  if (haystack.includes('bag') || haystack.includes('backpack')) return 'bag';
  if (haystack.includes('bundle') || haystack.includes('kit') || haystack.includes('starter')) return 'bundle';
  if (haystack.includes('towel')) return 'towel';
  if (haystack.includes('sweatband') || haystack.includes('headband') || haystack.includes('wristband'))
    return 'sweat-accessory';
  if (haystack.includes('grip')) return 'grip';
  if (haystack.includes('cover')) return 'cover';
  return 'accessory';
}

function detectPackCount(product: Product): string | null {
  const haystack = `${product.title} ${product.description}`.toLowerCase();
  const match = haystack.match(/(\d+)\s*[- ]?(pack|pcs|pieces|balls?)/i);
  if (!match) return null;
  return `${match[1]} ${match[2].toLowerCase()}`;
}

function buildFallbackFeatures(product: Product, type: ProductType): string[] {
  const packCount = detectPackCount(product);
  const variantCount = product.variants.edges.length;

  const common = [
    `Product type: ${type === 'sweat-accessory' ? 'sweat accessory' : type}`,
    `Price starts at ${product.priceRange.minVariantPrice.amount} ${product.priceRange.minVariantPrice.currencyCode}`,
  ];

  if (variantCount > 1) {
    common.push(`${variantCount} variant options`);
  }
  if (packCount) {
    common.push(`Pack size: ${packCount}`);
  }

  if (type === 'bundle') {
    return ['All-in-one pickleball essentials setup', 'Built for a simpler first purchase', ...common].slice(0, 5);
  }
  if (type === 'bag') {
    return ['Organized storage for everyday court sessions', 'Designed for easy carry between home and court', ...common].slice(0, 5);
  }
  if (type === 'balls') {
    return ['Useful for drills, rec games, and repeat practice sessions', ...common].slice(0, 5);
  }
  if (type === 'paddle') {
    return ['Balanced for everyday rec play and beginner progression', ...common].slice(0, 5);
  }

  return ['Made for regular pickleball court use', ...common].slice(0, 5);
}

function buildIntro(product: Product, type: ProductType, cleanedDescription: string): string {
  const shortDescription = cleanedDescription.split('.').slice(0, 2).join('.').trim();
  if (shortDescription.length > 40) {
    return shortDescription.endsWith('.') ? shortDescription : `${shortDescription}.`;
  }

  if (type === 'bundle') {
    return `${product.title} is a simple all-in-one setup for players who want to start quickly with matching pickleball essentials. It helps reduce guesswork by grouping core items in one purchase.`;
  }
  if (type === 'bag') {
    return `${product.title} is built for carrying your everyday pickleball essentials in one organized setup. It helps keep gear accessible for practice, rec games, and travel to the court.`;
  }
  if (type === 'paddle') {
    return `${product.title} is a reliable paddle option for beginners and everyday players who want a straightforward setup. It is designed to support comfortable rec play without overcomplicated specs.`;
  }
  if (type === 'balls') {
    return `${product.title} is made for repeat pickleball sessions, from warm-ups to rec matches. It is a practical choice for players who want simple, dependable court balls.`;
  }

  return `${product.title} is a practical pickleball essential for day-to-day court sessions. It is built for players who want reliable gear and easy use.`;
}

function buildUseCase(type: ProductType): string {
  if (type === 'bundle') return 'Best for beginners, gifting, or anyone who wants a ready-to-play setup in one order.';
  if (type === 'bag') return 'Best for players who carry multiple items and want quicker organization before and after games.';
  if (type === 'balls') return 'Best for beginners, drills, and everyday rec play where durable repeat-use balls matter.';
  if (type === 'paddle') return 'Best for beginners and casual players looking for a dependable paddle for regular rec sessions.';
  if (type === 'towel' || type === 'sweat-accessory')
    return 'Best for players who want simple sweat control and comfort during longer court sessions.';
  if (type === 'grip' || type === 'cover')
    return 'Best for players who want a cleaner, more comfortable day-to-day paddle setup.';
  return 'Best for casual and rec players who value simple, reliable gear for everyday court use.';
}

function buildNote(product: Product): string | undefined {
  if (product.variants.edges.length > 1) {
    return 'Variant colors and availability can vary by current stock.';
  }
  return undefined;
}

export function formatProductDescription(product: Product): StructuredProductDescription {
  const type = detectProductType(product);
  const cleanedDescription = cleanText(product.descriptionHtml || product.description || '');
  const intro = buildIntro(product, type, cleanedDescription);
  const extractedFeatures = extractListItems(product.descriptionHtml || '');
  const features = (extractedFeatures.length ? extractedFeatures : buildFallbackFeatures(product, type))
    .map((item) => cleanText(item))
    .filter(Boolean)
    .slice(0, 6);

  return {
    intro,
    features,
    useCase: buildUseCase(type),
    note: buildNote(product),
  };
}

