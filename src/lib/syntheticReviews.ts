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

type ReviewIntent = {
  id: string;
  titleOptions: string[];
  lineAOptions: string[];
  lineBOptions: string[];
  baseRating: number;
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
      { title: "Good quality overall", text: "Feels well made and matches what I expected from the listing.", rating: 4.6 },
      { title: "Straightforward and useful", text: "Simple product that does the job without any issues so far.", rating: 4.4 },
      { title: "Happy with this order", text: "Arrived in good condition and has worked well in regular use.", rating: 4.3 },
    ],
    "arronax-high-quality-custom-beach-tennis-bag-with-padel-racquet-backpack-pocket-tennis-sport-pickleball-paddle-backpack": [
      { title: "Works as expected", text: "Everything feels practical and easy to use for everyday sessions.", rating: 4.7 },
      { title: "Solid purchase", text: "Good value for the price and the quality has been consistent.", rating: 4.5 },
      { title: "Would buy again", text: "No complaints so far and it has been reliable since it arrived.", rating: 4.4 },
    ],
  },
  byType: {
    balls: [
      { title: "Good for everyday use", text: "Easy to use and consistent in normal day-to-day sessions.", rating: 4.5 },
      { title: "Solid value", text: "Quality feels fair for the price and performance is reliable.", rating: 4.4 },
      { title: "Simple and reliable", text: "Nothing complicated, just a dependable product overall.", rating: 4.3 },
      { title: "Works well weekly", text: "Has held up nicely with regular use throughout the week.", rating: 4.4 },
      { title: "Happy with the purchase", text: "Everything has worked as expected and setup was easy.", rating: 4.5 },
    ],
    paddles: [
      { title: "Comfortable to use", text: "Feels good during longer sessions and does what I need.", rating: 4.6 },
      { title: "Nice overall performance", text: "Consistent results and easy to get used to quickly.", rating: 4.5 },
      { title: "Great for casual play", text: "Works well for regular games and practice sessions.", rating: 4.4 },
      { title: "Feels balanced", text: "Comfort and performance both feel solid in normal use.", rating: 4.5 },
      { title: "No complaints", text: "Straightforward product with dependable quality so far.", rating: 4.4 },
    ],
    "paddle-covers": [
      { title: "Great quality", text: "Feels durable and has been reliable with regular use.", rating: 4.6 },
      { title: "Good item", text: "Simple to use and works exactly as expected.", rating: 4.4 },
      { title: "Practical choice", text: "Useful addition and easy to keep in rotation each week.", rating: 4.5 },
      { title: "Worth adding", text: "A straightforward option that has done the job well.", rating: 4.3 },
      { title: "Does what it should", text: "No issues so far and quality has held up nicely.", rating: 4.4 },
    ],
    bags: [
      { title: "Useful and practical", text: "Easy to use and fits well into everyday routines.", rating: 4.6 },
      { title: "Nice overall design", text: "Thoughtful setup and comfortable enough for regular use.", rating: 4.5 },
      { title: "Good for busy days", text: "Keeps things simple and organized when heading out.", rating: 4.4 },
      { title: "Simple and reliable", text: "Feels sturdy and has worked well in weekly use.", rating: 4.5 },
      { title: "Matches what I needed", text: "Meets expectations and feels like a solid value.", rating: 4.4 },
    ],
    "towels-accessories": [
      { title: "Useful every session", text: "Convenient and practical for regular day-to-day use.", rating: 4.5 },
      { title: "Comfortable to use", text: "Feels good and performs consistently over time.", rating: 4.4 },
      { title: "Simple accessory", text: "No fuss setup and works well for what it is.", rating: 4.3 },
      { title: "Good everyday item", text: "Practical choice for routine use and easy to maintain.", rating: 4.4 },
      { title: "Works as expected", text: "Reliable so far and does exactly what I hoped.", rating: 4.4 },
    ],
    bundles: [
      { title: "Good starter set", text: "Everything feels cohesive and convenient in one package.", rating: 4.6 },
      { title: "Convenient choice", text: "Saved time and made setup simple from the start.", rating: 4.5 },
      { title: "Nice value", text: "Good quality-to-price balance for a complete option.", rating: 4.4 },
      { title: "Easy choice", text: "Straightforward purchase and everything arrived as expected.", rating: 4.5 },
      { title: "Practical setup", text: "Well suited for regular use without overcomplicating things.", rating: 4.4 },
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

const BLOCKED_KEYWORDS_BY_TYPE: Record<ProductReviewType, string[]> = {
  balls: ["paddle cover", "sleeve", "neoprene", "backpack compartment", "shoulder strap"],
  paddles: ["pack of", "hole count", "bounce", "indoor ball", "outdoor ball"],
  "paddle-covers": ["pack of", "hole count", "bounce", "indoor ball", "outdoor ball", "headband", "sweatband"],
  bags: ["hole count", "bounce", "indoor ball", "outdoor ball", "paddle face", "spin control"],
  "towels-accessories": ["hole count", "bounce", "indoor ball", "outdoor ball", "paddle face shape"],
  bundles: [],
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
  const normalized = reviewText.toLowerCase();
  const blocked = BLOCKED_KEYWORDS_BY_TYPE[type];
  if (blocked.some((word) => normalized.includes(word.toLowerCase()))) {
    return false;
  }

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

const REVIEW_INTENTS: ReviewIntent[] = [
  {
    id: "quality",
    titleOptions: ["better then expected", "solid quality tbh", "feels prety decent", "quality is nice"],
    lineAOptions: [
      "didnt expect much but it actually feels well made.",
      "used it a few times now and it still looks good.",
      "first impression was good and it stayed that way so far.",
    ],
    lineBOptions: [
      "nothing crazy, just proper quality for normal use.",
      "for this price i cant really complain.",
      "overall yeah, im happy with it.",
    ],
    baseRating: 4.6,
  },
  {
    id: "value",
    titleOptions: ["worth the price", "good value imo", "price to quality is good", "decent buy"],
    lineAOptions: [
      "i compared a couple options and this one made most sense.",
      "for what i paid, this is honestly a good deal.",
      "not the cheapest maybe, but value feels fair.",
    ],
    lineBOptions: [
      "does what i needed without extra fuss.",
      "would probly buy again.",
      "money well spent in my case.",
    ],
    baseRating: 4.5,
  },
  {
    id: "ease",
    titleOptions: ["super easy to use", "no setup headache", "easy from day one", "quick to get going"],
    lineAOptions: [
      "out of the box it was pretty straight forward.",
      "didnt need to figure out much, just started using it.",
      "simple product, no weird learning curve.",
    ],
    lineBOptions: [
      "thats kinda what i wanted tbh.",
      "saved me some time for sure.",
      "works fine even if youre not technical.",
    ],
    baseRating: 4.4,
  },
  {
    id: "consistency",
    titleOptions: ["still good after weeks", "been consistent so far", "holding up nice", "reliable till now"],
    lineAOptions: [
      "been using it weekly and performance stayed stable.",
      "after several sessions still feels the same in a good way.",
      "thought it might wear out quick but nope.",
    ],
    lineBOptions: [
      "so yeah, reliability seems legit.",
      "im still satisfied after regular use.",
      "no random issues till now.",
    ],
    baseRating: 4.5,
  },
  {
    id: "expectation",
    titleOptions: ["exactly what i expected", "matches the listing", "pretty much as shown", "no bad surprises"],
    lineAOptions: [
      "arrived like in photos and description was accurate.",
      "what i got is basically what they promised.",
      "the listing looked clear and product matched it.",
    ],
    lineBOptions: [
      "that already puts it above many stores honestly.",
      "smooth experience overall.",
      "im good with this purchase.",
    ],
    baseRating: 4.4,
  },
  {
    id: "shipping",
    titleOptions: ["arrived in good shape", "package was fine", "delivery went ok", "came as expected"],
    lineAOptions: [
      "package got here in good condition, nothing damaged.",
      "shipping took a bit but updates were clear enough.",
      "delivery was normal and item arrived clean.",
    ],
    lineBOptions: [
      "overall process felt smooth.",
      "no issues on my end.",
      "would order from here again.",
    ],
    baseRating: 4.3,
  },
  {
    id: "repeat",
    titleOptions: ["would order again", "id buy again", "happy i picked this", "good repeat purchase"],
    lineAOptions: [
      "this is one of those products you can just reorder confidently.",
      "after trying it once i know what to expect now.",
      "ended up being a better pick than i thought.",
    ],
    lineBOptions: [
      "next time id probably get another one.",
      "im sticking with this for now.",
      "easy yes from me.",
    ],
    baseRating: 4.6,
  },
  {
    id: "simple",
    titleOptions: ["simple but good", "no overhype", "just works for me", "clean and practical"],
    lineAOptions: [
      "nothing flashy here, just a practical item.",
      "i like that it keeps things simple.",
      "doesnt try too hard and still performs well.",
    ],
    lineBOptions: [
      "for everyday use this is enough for me.",
      "thats exactly the vibe i wanted.",
      "good pick if you like straightforward stuff.",
    ],
    baseRating: 4.4,
  },
];

function buildHumanReviewTemplates(handle: string, productTitle: string, limit: number): ReviewTemplate[] {
  const scoredIntents = REVIEW_INTENTS.map((intent) => ({
    intent,
    score: stableIndex(handle, productTitle, `intent:${intent.id}`, 1_000_000),
  })).sort((a, b) => a.score - b.score);

  return scoredIntents.slice(0, Math.min(limit, scoredIntents.length)).map(({ intent }, idx) => {
    const title = intent.titleOptions[
      stableIndex(handle, productTitle, `intent-title:${intent.id}:${idx}`, intent.titleOptions.length)
    ];
    const lineA = intent.lineAOptions[
      stableIndex(handle, productTitle, `intent-lineA:${intent.id}:${idx}`, intent.lineAOptions.length)
    ];
    const lineB = intent.lineBOptions[
      stableIndex(handle, productTitle, `intent-lineB:${intent.id}:${idx}`, intent.lineBOptions.length)
    ];
    const ratingJitter = (seededFloat(hashString(`${handle}:${intent.id}:${idx}`)) - 0.5) * 0.18;

    return {
      title,
      text: `${lineA} ${lineB}`,
      rating: Number(Math.max(4.1, Math.min(4.8, intent.baseRating + ratingJitter)).toFixed(1)),
    };
  });
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
  const selected = buildHumanReviewTemplates(handle, productTitle, 3);

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
