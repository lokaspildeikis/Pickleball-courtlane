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

function seededFloat(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function pickIndex(seed: number, salt: number, length: number): number {
  if (length <= 1) return 0;
  const f = seededFloat(seed + salt * 41);
  return Math.min(length - 1, Math.floor(f * length));
}

function formatDateFromSeed(seed: number): string {
  const now = new Date();
  const daysAgo = 7 + Math.floor(seededFloat(seed + 51) * 180);
  const d = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" });
}

function detectProductKind(handle: string, title: string): ProductKind {
  const text = `${handle} ${title}`.toLowerCase();
  if (text.includes("ball")) return "balls";
  if (text.includes("paddle") || text.includes("racket")) return "paddle";
  if (text.includes("grip") || text.includes("overgrip")) return "grips";
  if (text.includes("bag") || text.includes("backpack") || text.includes("cover")) return "bag";
  if (text.includes("towel")) return "towel";
  return "accessory";
}

/** Short noun phrase for inline copy (pickleball-specific, not hypey). */
function itemPhrase(kind: ProductKind): string {
  const map: Record<ProductKind, string> = {
    balls: "these balls",
    paddle: "this paddle",
    grips: "this grip setup",
    bag: "this bag",
    towel: "this towel",
    accessory: "this gear",
  };
  return map[kind];
}

type Snippet = { title: string; text: string };

function fillItem(template: string, item: string): string {
  return template.replace(/\{item\}/g, item);
}

/** Seeded positive snippets per slot so the three cards read differently and products vary. */
function positiveSnippetsForSlot(slot: 0 | 1 | 2, item: string): Snippet[] {
  const raw: Snippet[][] = [
    [
      { title: "Arrived quickly", text: "Order showed up sooner than I expected. {item} looks right for everyday games and practice." },
      { title: "Smooth purchase", text: "Checkout and tracking were straightforward. {item} matches the listing and feels fine for rec play." },
      { title: "Happy with delivery", text: "Packaging was solid and nothing was damaged. {item} is what I wanted for casual court sessions." },
      { title: "No surprises", text: "Everything lined up with the product page. {item} feels like a sensible pick for regular pickleball." },
      { title: "Easy order", text: "Placing the order was simple and updates were clear. {item} arrived in good shape." },
      { title: "Good first impression", text: "Out of the box, {item} looks ready for the court. Shipping was quick on my order." },
    ],
    [
      { title: "Works for my routine", text: "I've used {item} in a few sessions now and it fits my usual rec-night setup." },
      { title: "Solid for the price", text: "For what I paid, {item} does the job. I'd buy here again for basics." },
      { title: "Does the job", text: "Nothing fancy, but {item} is practical. Good option if you want simple gear without guesswork." },
      { title: "Pleased so far", text: "{item} feels sturdy enough for weekly play. Communication from the store was normal—no issues." },
      { title: "Matches my needs", text: "I wanted straightforward pickleball gear and {item} fits that. Delivery was on the quicker side." },
      { title: "Kept it simple", text: "{item} is easy to use and pack for the court. Support answered a sizing question without delay." },
    ],
    [
      { title: "Would buy again", text: "Overall a clean experience end-to-end. {item} is holding up fine after several sessions." },
      { title: "Recommend for rec players", text: "If you play casually or a few times a week, {item} is a reasonable choice. Fulfillment felt organized." },
      { title: "All good", text: "No complaints—{item} arrived as described and I've had no problems on court." },
      { title: "Straightforward quality", text: "{item} feels consistent with what you'd want for practice and pickup games." },
      { title: "Glad I ordered", text: "I'm happy I went with this listing. {item} works and the order process was easy to follow." },
      { title: "Fine for everyday play", text: "{item} isn't trying to be flashy—just usable gear for normal court days. That worked for me." },
    ],
  ];

  return raw[slot].map((s) => ({ title: s.title, text: fillItem(s.text, item) }));
}

const BALANCED_SNIPPETS: Snippet[] = [
  {
    title: "Good support, slower delivery",
    text: "Shipping took around 10 working days—longer than I hoped. Support got back to me quickly and offered a discount on my next order.",
  },
  {
    title: "Took a bit to arrive",
    text: "Delivery dragged for about two weeks on business days. The team replied fast when I asked for an update and added a small voucher for next time.",
  },
  {
    title: "Mixed on speed",
    text: "It was slower to get here than other orders I've placed online. On the bright side, support was helpful and I got a credit toward a future purchase.",
  },
  {
    title: "Patience required",
    text: "The wait was noticeable—roughly 10 working days in my case. Customer service was responsive and made it right with a next-order discount.",
  },
  {
    title: "Shipping was the weak spot",
    text: "Arrival time felt long for my schedule. I will say support answered within a day and sent a courtesy discount code for my next checkout.",
  },
  {
    title: "Okay overall",
    text: "Not the fastest parcel I've received, but the product showed up intact. Support was quick and offered a discount if I order again.",
  },
];

function buildReviewCopy(kind: ProductKind, seed: number, idx: number): Snippet {
  const slot = Math.min(idx, 2) as 0 | 1 | 2;
  const pool = positiveSnippetsForSlot(slot, itemPhrase(kind));
  const choice = pickIndex(seed, idx * 19 + slot * 7 + hashString(kind), pool.length);
  return pool[choice];
}

function pickBalancedSnippet(seed: number, idx: number): Snippet {
  const i = pickIndex(seed, idx * 23 + 999, BALANCED_SNIPPETS.length);
  return BALANCED_SNIPPETS[i];
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
    const author = `${FIRST_NAMES[(seed + idx) % FIRST_NAMES.length]} ${LAST_INITIALS[(seed + idx * 2) % LAST_INITIALS.length]}`;
    const rawRating = Math.max(
      3.9,
      Math.min(
        5,
        summary.rating - (idx === 2 ? 0.3 : 0) + seededFloat(seed + idx * 11) * 0.2,
      ),
    );
    const ratingLabel = rawRating.toFixed(1);
    const rating = Number(ratingLabel);
    const copy = buildReviewCopy(kind, seed, idx);
    const score = Number(ratingLabel);
    const useBalancedThreeNineCopy = ratingLabel === "3.9" || (idx === 2 && score <= 4.1);
    const balanced = pickBalancedSnippet(seed, idx);
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
