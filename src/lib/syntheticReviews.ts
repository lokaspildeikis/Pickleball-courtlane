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

export function getSyntheticReviewSummary(handle: string) {
  const seed = hashString(handle);
  const rating = Number((3.9 + seededFloat(seed + 1) * 1.1).toFixed(1));
  const reviewCount = 30 + Math.floor(seededFloat(seed + 2) * 61); // 30-90
  return { rating: Math.min(5, rating), reviewCount, source: "synthetic" as const };
}

export function getSyntheticReviews(handle: string, productTitle: string): SyntheticReview[] {
  const seed = hashString(`${handle}-${productTitle}`);
  const summary = getSyntheticReviewSummary(handle);

  return [0, 1, 2].map((idx) => {
    const author = `${FIRST_NAMES[(seed + idx) % FIRST_NAMES.length]} ${LAST_INITIALS[(seed + idx * 2) % LAST_INITIALS.length]}`;
    const rating = Number(Math.max(3.9, Math.min(5, summary.rating - (idx === 2 ? 0.3 : 0) + seededFloat(seed + idx * 11) * 0.2)).toFixed(1));
    return {
      id: `${handle}-${idx}`,
      author,
      rating,
      date: formatDateFromSeed(seed + idx * 19),
      title: idx === 0 ? "Great quality for the price" : idx === 1 ? "Solid performance on court" : "Happy with this purchase",
      text:
        idx === 0
          ? `${productTitle} feels durable and well-made. Good control and consistent performance in matches.`
          : idx === 1
            ? `Used this for a few sessions now and it has held up well. Comfortable feel and does what I expected.`
            : `Shipping was smooth and the product quality is good overall. Would buy again for training and weekly games.`,
      source: "synthetic",
    };
  });
}

