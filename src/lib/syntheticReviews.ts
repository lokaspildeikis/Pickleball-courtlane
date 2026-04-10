export interface SyntheticReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  text: string;
  photoUrl?: string;
  source: "synthetic";
}

export type ProductReviewType =
  | "balls"
  | "paddles"
  | "paddle-covers"
  | "bags"
  | "towels-accessories"
  | "bundles"
  | "generic";

type ReviewTemplate = {
  title: string;
  text: string;
  rating: number;
};

const FIRST_NAMES = [
  "Liam", "Noah", "Mason", "Ethan", "Lucas", "Ava", "Emma", "Mia", "Sofia", "Harper",
  "Elena", "Julia", "Nora", "Leah", "Owen", "Caleb", "Ryan", "Dylan", "Zoe", "Chloe",
];

const LAST_INITIALS = ["A.", "B.", "C.", "D.", "E.", "F.", "G.", "H.", "J.", "K.", "L.", "M."];

/**
 * Central review data source:
 * - byProduct[handle] for exact-product reviews
 * - byType[type] for category fallback
 * - safeFallback for neutral store-level reviews
 */
const REVIEW_DATA: {
  byProduct: Record<string, ReviewTemplate[]>;
  byType: Record<ProductReviewType, ReviewTemplate[]>;
  safeFallback: ReviewTemplate[];
} = {
  byProduct: {
    "high-quality-spot-price-chloroprene-rubber-pickle-ball-bag-sports-protective-bag": [
      { title: "Fits my paddle well", text: "Sleeve fits snug without being hard to take off. Good for keeping the face protected in my bag.", rating: 4.6 },
      { title: "Simple cover", text: "Nothing fancy, but it keeps scratches off during travel to the courts.", rating: 4.4 },
      { title: "Useful add-on", text: "Material feels decent and the paddle slides in easily.", rating: 4.3 },
    ],
    "arronax-high-quality-custom-beach-tennis-bag-with-padel-racquet-backpack-pocket-tennis-sport-pickleball-paddle-backpack": [
      { title: "Good daily bag", text: "Pockets are laid out well and it is easy to pack before practice.", rating: 4.7 },
      { title: "Comfortable enough", text: "Straps feel fine for short walks to the court and the main compartment is roomy.", rating: 4.5 },
      { title: "Does the job", text: "Works for paddle, towel, and balls without overstuffing.", rating: 4.4 },
    ],
  },
  byType: {
    balls: [
      { title: "Good for rec games", text: "Bounce feels consistent enough for practice and casual matches.", rating: 4.5 },
      { title: "Solid value", text: "We used these for drills all week and they held up fine.", rating: 4.4 },
      { title: "Simple and reliable", text: "Not premium-level hype, just usable balls for normal court sessions.", rating: 4.3 },
      { title: "Works for weekly play", text: "Pack is convenient when you play a few times a week.", rating: 4.4 },
      { title: "Happy with them", text: "Flight and bounce are good enough for everyday outdoor games.", rating: 4.5 },
    ],
    paddles: [
      { title: "Comfortable paddle", text: "Grip feels good and I can play longer sessions without hand fatigue.", rating: 4.6 },
      { title: "Nice control", text: "Touch shots feel predictable and the paddle is easy to handle.", rating: 4.5 },
      { title: "Good for casual play", text: "Works well for rec games and practice without overthinking specs.", rating: 4.4 },
      { title: "Feels balanced", text: "Weight distribution feels natural for both dinks and drives.", rating: 4.5 },
      { title: "No complaints", text: "Straightforward paddle that does what I need for weekly sessions.", rating: 4.4 },
    ],
    "paddle-covers": [
      { title: "Keeps paddle protected", text: "Fits my paddle nicely and gives extra protection in my backpack.", rating: 4.6 },
      { title: "Good sleeve", text: "Easy to put on and remove, and it helps avoid small scuffs.", rating: 4.4 },
      { title: "Practical cover", text: "Neoprene feels decent and the paddle stays protected between games.", rating: 4.5 },
      { title: "Worth adding", text: "Simple item, but useful if you carry your paddle often.", rating: 4.3 },
      { title: "Does what it should", text: "No issues so far, and it keeps the paddle face cleaner.", rating: 4.4 },
    ],
    bags: [
      { title: "Useful storage", text: "Good for keeping court gear organized with enough room for essentials.", rating: 4.6 },
      { title: "Nice compartment layout", text: "Pockets make it easy to separate shoes, towel, and accessories.", rating: 4.5 },
      { title: "Good for court days", text: "Carry is comfortable enough and setup stays organized.", rating: 4.4 },
      { title: "Simple and practical", text: "Backpack feels sturdy and works for regular sessions.", rating: 4.5 },
      { title: "Matches what I needed", text: "Storage and carry are the main reason I bought it, and it delivers.", rating: 4.4 },
    ],
    "towels-accessories": [
      { title: "Useful between points", text: "Helps with sweat during longer sessions and dries fairly quickly.", rating: 4.5 },
      { title: "Comfortable to use", text: "Material feels soft enough and works well for practice days.", rating: 4.4 },
      { title: "Simple accessory", text: "Does the job and is easy to keep in my bag.", rating: 4.3 },
      { title: "Good everyday item", text: "Not flashy, just practical for rec play and training.", rating: 4.4 },
      { title: "Works as expected", text: "Helps keep me comfortable during warm sessions.", rating: 4.4 },
    ],
    bundles: [
      { title: "Good starter set", text: "Useful mix of gear for getting on court without buying items one by one.", rating: 4.6 },
      { title: "Convenient bundle", text: "Everything included was relevant for casual games and practice.", rating: 4.5 },
      { title: "Nice value", text: "Solid option if you want a simple kit for regular play.", rating: 4.4 },
      { title: "Easy choice", text: "I liked having the essentials together in one order.", rating: 4.5 },
      { title: "Practical setup", text: "Good for beginners or anyone refreshing their basic gear.", rating: 4.4 },
    ],
    generic: [],
  },
  safeFallback: [
    { title: "Smooth order", text: "Checkout was simple and shipping updates were clear.", rating: 4.3 },
    { title: "No issues", text: "Everything arrived as described and packed well.", rating: 4.4 },
    { title: "Would order again", text: "Store communication was fine and the process felt straightforward.", rating: 4.4 },
  ],
};

const TYPE_KEYWORDS: Record<ProductReviewType, string[]> = {
  balls: ["ball", "balls", "bounce", "indoor", "outdoor", "holes", "pack"],
  paddles: ["paddle", "face", "grip", "control", "spin", "handle"],
  "paddle-covers": ["cover", "sleeve", "neoprene", "protection", "zipper", "paddle cover"],
  bags: ["bag", "backpack", "pockets", "storage", "carry", "compartment"],
  "towels-accessories": ["towel", "sweat", "sweatband", "headband", "absorbent", "dry"],
  bundles: ["bundle", "kit", "set", "starter", "included"],
  generic: [],
};

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** FNV-1a over handle + title + purpose — avoids Math.sin collisions that made many PDPs pick the same review lines. */
function stableIndex(handle: string, title: string, purpose: string, modulo: number): number {
  if (modulo <= 1) return 0;
  const combined = `${handle}\n${title}\n${purpose}`;
  let h = 2166136261;
  for (let i = 0; i < combined.length; i += 1) {
    h ^= combined.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0) % modulo;
}

function seededFloat(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function formatDateFromSeed(seed: number): string {
  const now = new Date();
  const daysAgo = 7 + Math.floor(seededFloat(seed + 51) * 180);
  const d = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" });
}

function detectProductType(handle: string, title: string): ProductReviewType {
  const text = `${handle} ${title}`.toLowerCase();
  if (text.includes("bundle") || text.includes("starter") || text.includes("kit") || text.includes("set")) return "bundles";
  if (text.includes("cover") || text.includes("sleeve")) return "paddle-covers";
  if (text.includes("bag") || text.includes("backpack")) return "bags";
  if (text.includes("towel") || text.includes("sweatband") || text.includes("headband") || text.includes("wristband")) return "towels-accessories";
  if (text.includes("paddle") || text.includes("racket") || text.includes("grip") || text.includes("overgrip")) return "paddles";
  if (/\bballs?\b/.test(text)) return "balls";
  return "generic";
}

function keywordHits(text: string, words: string[]): number {
  const normalized = text.toLowerCase();
  return words.reduce((count, word) => (normalized.includes(word.toLowerCase()) ? count + 1 : count), 0);
}

function isReviewRelevantForType(reviewText: string, type: ProductReviewType): boolean {
  const currentHits = keywordHits(reviewText, TYPE_KEYWORDS[type]);
  let highestOtherHits = 0;

  for (const [candidateType, words] of Object.entries(TYPE_KEYWORDS)) {
    if (candidateType === type || candidateType === "generic") continue;
    highestOtherHits = Math.max(highestOtherHits, keywordHits(reviewText, words));
  }

  // Neutral reviews with no strong product words are allowed as safe fallback.
  if (currentHits === 0 && highestOtherHits === 0) return true;
  // Exclude mismatched copy where another type dominates.
  return currentHits >= highestOtherHits;
}

function pickDeterministicTemplates(
  templates: ReviewTemplate[],
  handle: string,
  title: string,
  limit: number,
): ReviewTemplate[] {
  if (!templates.length) return [];
  const indexed = templates.map((template, idx) => ({
    template,
    score: stableIndex(handle, title, `review-template:${idx}`, 1_000_000),
  }));
  indexed.sort((a, b) => a.score - b.score);
  return indexed.slice(0, Math.min(limit, indexed.length)).map((entry) => entry.template);
}

function getAssignedReviewTemplates(handle: string, productTitle: string): { type: ProductReviewType; templates: ReviewTemplate[] } {
  const type = detectProductType(handle, productTitle);
  const exact = REVIEW_DATA.byProduct[handle] || [];
  const typed = REVIEW_DATA.byType[type] || [];
  const safe = REVIEW_DATA.safeFallback;

  const exactRelevant = exact.filter((review) => isReviewRelevantForType(`${review.title} ${review.text}`, type));
  if (exactRelevant.length) return { type, templates: exactRelevant };

  const typedRelevant = typed.filter((review) => isReviewRelevantForType(`${review.title} ${review.text}`, type));
  if (typedRelevant.length) return { type, templates: typedRelevant };

  const safeRelevant = safe.filter((review) => isReviewRelevantForType(`${review.title} ${review.text}`, type));
  return { type, templates: safeRelevant };
}

export function getSyntheticReviewSummary(handle: string) {
  const seed = hashString(handle);
  const rating = Number((3.9 + seededFloat(seed + 1) * 1.1).toFixed(1));
  const reviewCount = 30 + Math.floor(seededFloat(seed + 2) * 61); // 30-90
  return { rating: Math.min(5, rating), reviewCount, source: "synthetic" as const };
}

export function getSyntheticReviews(handle: string, productTitle: string): SyntheticReview[] {
  const seed = hashString(`${handle}-${productTitle}`);
  const { templates } = getAssignedReviewTemplates(handle, productTitle);
  const selected = pickDeterministicTemplates(templates, handle, productTitle, 3);

  return selected.map((template, idx) => {
    const fn = stableIndex(handle, productTitle, `review:author-fn:${idx}`, FIRST_NAMES.length);
    const li = stableIndex(handle, productTitle, `review:author-li:${idx}`, LAST_INITIALS.length);
    const author = `${FIRST_NAMES[fn]} ${LAST_INITIALS[li]}`;
    const ratingJitter = (seededFloat(seed + idx * 11) - 0.5) * 0.2;
    const rating = Number(Math.max(3.9, Math.min(5, template.rating + ratingJitter)).toFixed(1));

    return {
      id: `${handle}-${idx}`,
      author,
      rating,
      date: formatDateFromSeed(seed + idx * 19),
      title: template.title,
      text: template.text,
      source: "synthetic",
    };
  });
}
