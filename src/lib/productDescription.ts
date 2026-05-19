import type { Product } from './shopify';

/** Strips promo suffixes added by Shopify admin (e.g. " - Save 15% !!"). */
export function sanitizeProductTitle(title: string): string {
  return title.replace(/\s*-\s*Save\s+\d+%\s*!*/gi, '').trim();
}

/**
 * Extracts "What's Included" bullet items from Shopify product descriptionHtml.
 *
 * Handles two common Shopify rich-text formats:
 *   1. A heading containing "included" / "in the box" followed by a <ul>
 *   2. A <li> item starting with "Includes:" — value is split on commas into
 *      individual lines, and sibling items in that same list are also returned.
 *
 * Returns null when neither pattern is found so the caller can fall back.
 */
export function extractWhatsIncludedItems(html: string): string[] | null {
  if (!html) return null;

  // Pattern 1 — heading ("What's Included", "In the Box", "Package Includes", …) followed by <ul>
  const headingSectionRe =
    /<h[1-6][^>]*>[^<]*(?:what.?s\s+included?|in\s+the\s+box|package\s+includes?|box\s+contents?)[^<]*<\/h[1-6]>\s*<ul[^>]*>([\s\S]*?)<\/ul>/i;
  const headingMatch = html.match(headingSectionRe);
  if (headingMatch) {
    const items = extractListItems(`<ul>${headingMatch[1]}</ul>`);
    if (items.length) return items;
  }

  // Pattern 2 — a <li> starting with "Includes:" (common in flat Shopify lists)
  const allUlsRe = /<ul[^>]*>([\s\S]*?)<\/ul>/gi;
  for (const ulMatch of html.matchAll(allUlsRe)) {
    const items = extractListItems(`<ul>${ulMatch[1]}</ul>`);
    const includesIdx = items.findIndex((item) =>
      /^(?:includes?|what.?s\s+included?|package\s+contents?)\s*:/i.test(item),
    );
    if (includesIdx !== -1) {
      const prefix = items[includesIdx].replace(
        /^(?:includes?|what.?s\s+included?|package\s+contents?)\s*:\s*/i,
        '',
      );
      // If the includes value is comma-separated, expand into individual lines
      const expanded = prefix.includes(',')
        ? prefix.split(',').map((s) => s.trim()).filter(Boolean)
        : [prefix];
      // Also collect sibling items (skip the "Includes:" one itself)
      const siblings = items.filter((_, i) => i !== includesIdx);
      return [...expanded, ...siblings];
    }
  }

  return null;
}

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
  /choice\s*:\s*yes/i,
  /high-concerned chemical\s*:/i,
  /^cn\s*:/i,
  /applicable people\s*:/i,
  /origin\s*:\s*(mainland china|cn)/i,
  /item code|model no\.?|sku\s*:/i,
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
    .replace(
      /\b(high quality|premium quality|perfect gift|pro-level|tournament-level|factory direct|hot sale|buy now|best price|luxurious yet practical)\b/gi,
      '',
    )
    .replace(/\b(ultimate|unparalleled|world-class|must-have|best ever|risk-free forever)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function isSupplierLikeBullet(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  const lower = t.toLowerCase();
  if (SUPPLIER_NOISE_PATTERNS.some((p) => p.test(t))) return true;
  if (/^(product type|variant options|price starts at|pack size:)\s*:/i.test(t)) return true;
  if (/brand name\s*:|noenname|guangdong|aliexpress|amazon\s*seller/i.test(lower)) return true;
  if (/please allow|manual measurement|\d+\s*[-–]\s*\d+\s*cm\s*(error|difference)/i.test(lower)) return true;
  if (/^specifications?:/i.test(lower)) return true;
  return false;
}

function extractListItems(html: string): string[] {
  const items = Array.from(html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)).map((match) =>
    cleanText(match[1] || ''),
  );
  return items.filter(Boolean).filter((item) => !isSupplierLikeBullet(item)).slice(0, 6);
}

function detectProductType(product: Product): ProductType {
  const haystack = `${product.title} ${product.tags.join(' ')} ${product.description}`.toLowerCase();
  if (haystack.includes('bundle') || haystack.includes('starter kit') || /\bkit\b/.test(haystack)) return 'bundle';
  if (haystack.includes('cover') || haystack.includes('sleeve')) return 'cover';
  if (haystack.includes('bag') || haystack.includes('backpack')) return 'bag';
  if (haystack.includes('towel')) return 'towel';
  if (haystack.includes('sweatband') || haystack.includes('headband') || haystack.includes('wristband'))
    return 'sweat-accessory';
  if (haystack.includes('grip') || haystack.includes('overgrip')) return 'grip';
  if (haystack.includes('paddle') || haystack.includes('racket')) return 'paddle';
  if (/\bballs?\b/.test(haystack)) return 'balls';
  return 'accessory';
}

function detectPackCount(product: Product): string | null {
  const haystack = `${product.title} ${product.description}`.toLowerCase();
  const match = haystack.match(/(\d+)\s*[- ]?(pack|pcs|pieces|balls?)/i);
  if (!match) return null;
  return `${match[1]} ${match[2].toLowerCase()}`;
}

function meaningfulVariantCount(product: Product): number {
  return product.variants.edges.filter((v) => {
    const t = v.node.title.trim().toLowerCase();
    return t && t !== 'default title';
  }).length;
}

function buildFallbackFeatures(product: Product, type: ProductType): string[] {
  const packCount = detectPackCount(product);
  const variantCount = meaningfulVariantCount(product);
  const lines: string[] = [];

  if (type === 'bundle') {
    lines.push('Starter-friendly bundle: core items in one order.');
  } else if (type === 'bag') {
    lines.push('Carry and organize gear for practice and rec days.');
  } else if (type === 'balls') {
    lines.push('Made for drills, casual games, and repeat sessions.');
  } else if (type === 'paddle') {
    lines.push('Straightforward paddle for everyday rec play.');
  } else if (type === 'cover') {
    lines.push('Helps protect your paddle between sessions.');
  } else if (type === 'towel') {
    lines.push('Handy for wipe-downs between games and hot days.');
  } else if (type === 'grip') {
    lines.push('Refresh tack and comfort on your existing handle.');
  } else if (type === 'sweat-accessory') {
    lines.push('Simple comfort add-on for active court sessions.');
  } else {
    lines.push('Practical pickleball accessory for regular court use.');
  }

  if (packCount) lines.push(`Size / quantity: ${packCount}.`);
  if (variantCount > 1) lines.push(`${variantCount} color or style options.`);

  return lines.slice(0, 5);
}

function buildIntro(product: Product, type: ProductType, cleanedDescription: string): string {
  const shortDescription = cleanedDescription.split('.').slice(0, 2).join('.').trim();
  if (shortDescription.length > 40) {
    return shortDescription.endsWith('.') ? shortDescription : `${shortDescription}.`;
  }

  if (type === 'bundle') {
    return `${product.title} bundles the essentials so you can head to the court with less guesswork. Good when you want a performance, coordinated setup in one order.`;
  }
  if (type === 'bag') {
    return `${product.title} is for carrying paddles, layers, and small essentials between home and the court. It keeps your routine organized for practice and rec games.`;
  }
  if (type === 'paddle') {
    return `${product.title} is a no-fuss paddle option for recreational to competitive players who want dependable feel during rec sessions.`;
  }
  if (type === 'balls') {
    return `${product.title} is meant for regular pickleball play—warm-ups, drills, and casual games with friends.`;
  }
  if (type === 'cover') {
    return `${product.title} helps shield your paddle from bumps and scratches in your bag or between sessions.`;
  }
  if (type === 'grip') {
    return `${product.title} is a built-for-real-play way to refresh how your handle feels without swapping paddles.`;
  }
  if (type === 'towel') {
    return `${product.title} is a small comfort item for sweat and quick wipe-downs during longer sessions.`;
  }
  if (type === 'sweat-accessory') {
    return `${product.title} is an all-skill-level add-on for players who want a bit less distraction from heat and sweat on court.`;
  }

  return `${product.title} is part of Courtlane’s essentials lineup—gear picked for real rec play, not showroom filler.`;
}

function buildUseCase(product: Product, type: ProductType): string {
  const haystack = `${product.title} ${product.tags.join(' ')}`.toLowerCase();
  const price = Number(product.priceRange.minVariantPrice.amount || '0');
  const mentionsAdvanced =
    haystack.includes('advanced') ||
    haystack.includes('competition') ||
    haystack.includes('tournament');

  if (type === 'bag') {
    if (price >= 70 || mentionsAdvanced) {
      return 'Best if you usually carry more gear and want pockets that keep things sorted.';
    }
    return 'Best for recreational to competitive players who want an easier way to pack for the court.';
  }

  if (type === 'paddle') {
    if (mentionsAdvanced || price >= 90) {
      return 'Best if you play often and want a paddle that still feels approachable.';
    }
    return 'Best for all-level players and casual sessions where comfort and clarity matter more than chasing specs.';
  }

  if (type === 'balls') {
    return 'Best for practice, pickup games, and keeping a few extras in your bag.';
  }

  if (type === 'bundle') {
    const isCarbon = haystack.includes('carbon') || haystack.includes('graphite');
    if (isCarbon) {
      return 'Best for players ready to step up with USAPA-approved carbon fiber gear at an honest price — great for recreational and league play.';
    }
    return 'Best for first-time buyers who want everything they need in a single, no-research order.';
  }

  if (type === 'towel' || type === 'sweat-accessory') {
    return 'Best for longer sessions, warm weather, or anyone who likes a quick reset between games.';
  }

  if (type === 'grip' || type === 'cover') {
    return 'Best for players who want simple paddle care and a steadier feel on the handle.';
  }

  return 'Best for everyday pickleball players who prefer straightforward, usable gear.';
}

function buildNote(_product: Product): string | undefined {
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
    .filter((item) => !isSupplierLikeBullet(item))
    .slice(0, 6);

  return {
    intro,
    features,
    useCase: buildUseCase(product, type),
    note: buildNote(product),
  };
}
