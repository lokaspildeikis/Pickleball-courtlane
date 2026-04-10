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

const FIRST_NAMES = [
  "Liam", "Noah", "Mason", "Ethan", "Lucas", "Ava", "Emma", "Mia", "Sofia", "Harper",
  "Elena", "Julia", "Nora", "Leah", "Owen", "Caleb", "Ryan", "Dylan", "Zoe", "Chloe",
];

const LAST_INITIALS = ["A.", "B.", "C.", "D.", "E.", "F.", "G.", "H.", "J.", "K.", "L.", "M."];

type ProductKind = "balls" | "paddle" | "grips" | "bag" | "towel" | "accessory";

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

function detectProductKind(handle: string, title: string): ProductKind {
  const text = `${handle} ${title}`.toLowerCase();
  if (/\bballs?\b/.test(text)) return "balls";
  if (text.includes("paddle") || text.includes("racket")) return "paddle";
  if (text.includes("grip") || text.includes("overgrip")) return "grips";
  if (text.includes("bag") || text.includes("backpack") || text.includes("cover")) return "bag";
  if (text.includes("towel")) return "towel";
  return "accessory";
}

/** Short noun phrase for inline copy (pickleball-specific, not hypey). */
function itemPhrase(kind: ProductKind): string {
  const map: Record<ProductKind, string> = {
    balls: "these pickleballs",
    paddle: "this paddle",
    grips: "this grip setup",
    bag: "this bag",
    towel: "this towel",
    accessory: "this product",
  };
  return map[kind];
}

/** Short use-case phrase so reviews feel product-specific. */
function focusPhrase(kind: ProductKind): string {
  const map: Record<ProductKind, string> = {
    balls: "drills and rec matches",
    paddle: "control and touch shots",
    grips: "grip comfort during longer sessions",
    bag: "court-day packing and carry",
    towel: "sweat control between points",
    accessory: "everyday court sessions",
  };
  return map[kind];
}

type Snippet = { title: string; text: string };

function fillTemplate(template: string, item: string, focus: string): string {
  return template.replace(/\{item\}/g, item).replace(/\{focus\}/g, focus);
}

/** Seeded positive snippets per slot so the three cards read differently and products vary. */
function positiveSnippetsForSlot(slot: 0 | 1 | 2, item: string, focus: string): Snippet[] {
  const raw: Snippet[][] = [
    [
      { title: "Arrived quickly", text: "Order showed up sooner than I expected. {item} looks right for {focus}." },
      { title: "Smooth purchase", text: "Checkout and tracking were straightforward. {item} matches the listing and feels fine for {focus}." },
      { title: "Happy with delivery", text: "Packaging was solid and nothing was damaged. {item} is what I wanted for {focus}." },
      { title: "No surprises", text: "Everything lined up with the product page. {item} feels like a sensible pick for {focus}." },
      { title: "Easy order", text: "Placing the order was simple and updates were clear. {item} arrived in good shape." },
      { title: "Good first impression", text: "Out of the box, {item} looks ready for the court and for {focus}. Shipping was quick on my order." },
    ],
    [
      { title: "Works for my routine", text: "I've used {item} in a few sessions now and it fits my usual setup for {focus}." },
      { title: "Solid for the price", text: "For what I paid, {item} does the job. I'd buy here again for practical gear and {focus}." },
      { title: "Does the job", text: "Nothing fancy, but {item} works well in practice. Good option if you want simple gear for {focus}." },
      { title: "Pleased so far", text: "{item} feels sturdy enough for weekly play. Communication from the store was normal—no issues." },
      { title: "Matches my needs", text: "I wanted straightforward pickleball gear and {item} fits that, especially for {focus}. Delivery was on the quicker side." },
      { title: "Kept it simple", text: "{item} is easy to use and pack for the court. It works well for {focus}." },
    ],
    [
      { title: "Would buy again", text: "Overall a clean experience end-to-end. {item} is holding up fine after several sessions." },
      { title: "Recommend for rec players", text: "If you play casually or a few times a week, {item} is a reasonable choice for {focus}. Fulfillment felt organized." },
      { title: "All good", text: "No complaints—{item} arrived as described and I've had no problems on court." },
      { title: "Straightforward quality", text: "{item} feels consistent with what you'd want for regular sessions and {focus}." },
      { title: "Glad I ordered", text: "I'm happy I went with this listing. {item} works and the order process was easy to follow." },
      { title: "Fine for everyday play", text: "{item} isn't trying to be flashy—just usable gear for normal court days and {focus}. That worked for me." },
    ],
  ];

  return raw[slot].map((s) => ({ title: s.title, text: fillTemplate(s.text, item, focus) }));
}

/** Composed “mixed” reviews: independent pools × each other → unique wording per product, still deterministic. */
const BALANCED_OPENERS = [
  "It took a little over a week of business days before the package landed—longer than I'm used to.",
  "Delivery was on the slow side for me, roughly nine or ten working days door to door.",
  "Tracking stayed quiet for a while and the box needed almost two weeks on business days.",
  "Shipping wasn't fast; I'd guess about twelve working days from order to doorstep.",
  "The parcel felt slower than my last few online orders—closer to two weeks on weekdays.",
  "I wasn't in a rush, but the wait still wound up longer than the estimate I had in mind.",
  "The label sat in transit longer than expected—I'm thinking nine or eleven business days total.",
  "Arrival dragged enough that I checked in once; it was not next-day speed by any means.",
  "From checkout to delivery it was a stretch—I'd call it a slow-but-steady shipment.",
  "If you need gear tomorrow, budget extra time. Mine needed the better part of two work weeks.",
];

const BALANCED_MIDDLES = [
  "When I reached out, someone replied quickly and didn't leave me guessing.",
  "Support answered my email the same day and was clear about what was going on.",
  "I used the contact form and got a human response fast—no boilerplate runaround.",
  "Customer service was on it: short wait, straight answers, and a polite tone.",
  "The team got back within a day and actually read my note instead of auto-replying.",
  "I had one question about the shipment; they responded sooner than I expected.",
  "No drama talking to support—they were prompt and normal to deal with.",
  "They acknowledged the delay without excuses and kept the message simple.",
  "Support felt small-shop helpful, not robotic, which I appreciated.",
  "Quick reply from their side once I nudged them—professional enough for me.",
];

const BALANCED_CLOSERS = [
  "They offered a modest discount on a future order, which felt like a fair make-good.",
  "They sent a code I can use next checkout—small gesture, but it helped.",
  "Got a store credit note toward my next buy; not huge, but it squared things for me.",
  "They added a courtesy percentage off my next purchase without me having to push.",
  "There was a voucher-style credit for round two; made the wait easier to swallow.",
  "They matched the situation with a next-order discount—reasonable fix on their end.",
  "A small savings on my follow-up order was enough for me to try buying here again.",
  "They didn't leave it at 'sorry'—there was a concrete perk for ordering again.",
  "I got a one-time code for my next cart; simple and I’ll use it.",
  "They pointed me to a loyalty-style discount for the next go—fine by me.",
];

const BALANCED_TITLES = [
  "Good support, slower delivery",
  "Took longer than expected",
  "Shipping lagged, help didn't",
  "Mixed experience",
  "Slow parcel, fast replies",
  "Patience helps on shipping",
  "Okay once it arrived",
  "Support made up for the wait",
  "Not the speediest order",
  "Worth noting the timeline",
];

function composeBalancedSnippet(handle: string, productTitle: string, idx: number): Snippet {
  const o = stableIndex(handle, productTitle, `review:balanced:${idx}:opener:v2`, BALANCED_OPENERS.length);
  const m = stableIndex(handle, productTitle, `review:balanced:${idx}:middle:v2`, BALANCED_MIDDLES.length);
  const c = stableIndex(handle, productTitle, `review:balanced:${idx}:closer:v2`, BALANCED_CLOSERS.length);
  const t = stableIndex(handle, productTitle, `review:balanced:${idx}:title:v2`, BALANCED_TITLES.length);
  const text = `${BALANCED_OPENERS[o]} ${BALANCED_MIDDLES[m]} ${BALANCED_CLOSERS[c]}`;
  return { title: BALANCED_TITLES[t], text };
}

function buildReviewCopy(kind: ProductKind, handle: string, productTitle: string, idx: number): Snippet {
  const slot = Math.min(idx, 2) as 0 | 1 | 2;
  const pool = positiveSnippetsForSlot(slot, itemPhrase(kind), focusPhrase(kind));
  const choice = stableIndex(handle, productTitle, `review:positive:slot${slot}:idx${idx}:kind${kind}:v2`, pool.length);
  return pool[choice];
}

export function getSyntheticReviewSummary(handle: string) {
  const seed = hashString(handle);
  const rating = Number((3.9 + seededFloat(seed + 1) * 1.1).toFixed(1));
  const reviewCount = 30 + Math.floor(seededFloat(seed + 2) * 61); // 30-90
  return { rating: Math.min(5, rating), reviewCount, source: "synthetic" as const };
}

export function getSyntheticReviews(handle: string, productTitle: string): SyntheticReview[] {
  const seed = hashString(`${handle}-${productTitle}`);
  const summary = getSyntheticReviewSummary(handle);
  const kind = detectProductKind(handle, productTitle);

  return [0, 1, 2].map((idx) => {
    const fn = stableIndex(handle, productTitle, `review:author-fn:${idx}`, FIRST_NAMES.length);
    const li = stableIndex(handle, productTitle, `review:author-li:${idx}`, LAST_INITIALS.length);
    const author = `${FIRST_NAMES[fn]} ${LAST_INITIALS[li]}`;
    const rawRating = Math.max(
      3.9,
      Math.min(
        5,
        summary.rating - (idx === 2 ? 0.3 : 0) + seededFloat(seed + idx * 11) * 0.2,
      ),
    );
    const ratingLabel = rawRating.toFixed(1);
    const rating = Number(ratingLabel);
    const copy = buildReviewCopy(kind, handle, productTitle, idx);
    const score = Number(ratingLabel);
    const useBalancedThreeNineCopy = ratingLabel === "3.9" || (idx === 2 && score <= 4.1);
    const balanced = composeBalancedSnippet(handle, productTitle, idx);
    return {
      id: `${handle}-${idx}`,
      author,
      rating,
      date: formatDateFromSeed(seed + idx * 19),
      title: useBalancedThreeNineCopy ? balanced.title : copy.title,
      text: useBalancedThreeNineCopy ? balanced.text : copy.text,
      source: "synthetic",
    };
  });
}
