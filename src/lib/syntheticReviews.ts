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
  "Elena", "Julia", "Nora", "Leah", "Owen", "Caleb", "Ryan", "Dylan", "Zoe", "Chloe"
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

function buildReviewCopy(kind: ProductKind, productTitle: string, idx: number) {
  const byKind = {
    balls: [
      { title: "Great experience overall", text: "Shipping was very fast and the quality is excellent. Everything arrived exactly as expected." },
      { title: "Very happy with this order", text: "Delivery was smooth and packaging was good. The product feels premium and worth the price." },
      { title: "Would order again", text: "Customer support was responsive and the item quality is solid. Happy with the full buying experience." },
    ],
    paddle: [
      { title: "Great experience overall", text: "Shipping was very fast and the quality is excellent. Everything arrived exactly as expected." },
      { title: "Very happy with this order", text: "Delivery was smooth and packaging was good. The product feels premium and worth the price." },
      { title: "Would order again", text: "Customer support was responsive and the item quality is solid. Happy with the full buying experience." },
    ],
    grips: [
      { title: "Great experience overall", text: "Shipping was very fast and the quality is excellent. Everything arrived exactly as expected." },
      { title: "Very happy with this order", text: "Delivery was smooth and packaging was good. The product feels premium and worth the price." },
      { title: "Would order again", text: "Customer support was responsive and the item quality is solid. Happy with the full buying experience." },
    ],
    bag: [
      { title: "Great experience overall", text: "Shipping was very fast and the quality is excellent. Everything arrived exactly as expected." },
      { title: "Very happy with this order", text: "Delivery was smooth and packaging was good. The product feels premium and worth the price." },
      { title: "Would order again", text: "Customer support was responsive and the item quality is solid. Happy with the full buying experience." },
    ],
    towel: [
      { title: "Great experience overall", text: "Shipping was very fast and the quality is excellent. Everything arrived exactly as expected." },
      { title: "Very happy with this order", text: "Delivery was smooth and packaging was good. The product feels premium and worth the price." },
      { title: "Would order again", text: "Customer support was responsive and the item quality is solid. Happy with the full buying experience." },
    ],
    accessory: [
      { title: "Great experience overall", text: "Shipping was very fast and the quality is excellent. Everything arrived exactly as expected." },
      { title: "Very happy with this order", text: "Delivery was smooth and packaging was good. The product feels premium and worth the price." },
      { title: "Would order again", text: "Customer support was responsive and the item quality is solid. Happy with the full buying experience." },
    ],
  };

  return byKind[kind][Math.min(idx, 2)];
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
    // One decimal label must match what ProductDetail shows (review.rating.toFixed(1))
    const ratingLabel = rawRating.toFixed(1);
    const rating = Number(ratingLabel);
    const copy = buildReviewCopy(kind, productTitle, idx);
    const useBalancedThreeNineCopy = ratingLabel === "3.9";
    return {
      id: `${handle}-${idx}`,
      author,
      rating,
      date: formatDateFromSeed(seed + idx * 19),
      title: useBalancedThreeNineCopy ? "Good support, slower delivery" : copy.title,
      text: useBalancedThreeNineCopy
        ? "Shipping took around 10 working days, which was a bit longer than I expected. Support replied quickly and offered a discount for my next purchase."
        : copy.text,
      source: "synthetic",
    };
  });
}

