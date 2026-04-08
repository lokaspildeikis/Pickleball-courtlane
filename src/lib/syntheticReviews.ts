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
      {
        title: "Consistent bounce and flight",
        text: `${productTitle} keeps a reliable bounce and stable flight path. Great for regular outdoor sessions.`,
      },
      {
        title: "Durable for weekly games",
        text: `After multiple matches, these still hold shape and play consistently. Good visibility on court too.`,
      },
      {
        title: "Solid value for practice",
        text: `Good control and predictable response when drilling and playing points. Happy with the quality so far.`,
      },
    ],
    paddle: [
      {
        title: "Nice balance of power and control",
        text: `${productTitle} feels stable through contact and gives solid touch around the kitchen.`,
      },
      {
        title: "Comfortable handle, clean feel",
        text: `Grip feels secure and the paddle response is consistent on drives, blocks, and resets.`,
      },
      {
        title: "Good all-around option",
        text: `Easy to use in both practice and matches. Build quality feels dependable for frequent play.`,
      },
    ],
    grips: [
      {
        title: "Better hold during long sessions",
        text: `${productTitle} adds secure traction and helps keep the handle from slipping when hands get sweaty.`,
      },
      {
        title: "Easy to wrap and feels tacky",
        text: `Installation was quick and the grip texture stays comfortable over multiple sessions.`,
      },
      {
        title: "Reliable upgrade",
        text: `Good thickness and feel without making the handle too bulky. Nice control improvement.`,
      },
    ],
    bag: [
      {
        title: "Plenty of storage",
        text: `${productTitle} fits gear well and keeps paddles and accessories organized for match days.`,
      },
      {
        title: "Comfortable to carry",
        text: `Straps feel supportive and the build quality looks strong. Great for court-to-court travel.`,
      },
      {
        title: "Practical and clean design",
        text: `Good pocket layout and enough room for essentials. Works well for weekly training.`,
      },
    ],
    towel: [
      {
        title: "Absorbs sweat quickly",
        text: `${productTitle} does a good job during hot sessions and dries fast between games.`,
      },
      {
        title: "Lightweight and useful on court",
        text: `Easy to carry and actually helps in long workouts. Material feels soft but durable.`,
      },
      {
        title: "Great training accessory",
        text: `Simple, functional, and good quality overall. Nice add-on for regular practice.`,
      },
    ],
    accessory: [
      {
        title: "Good quality for the price",
        text: `${productTitle} feels durable and performs as expected in weekly play.`,
      },
      {
        title: "Works as advertised",
        text: `Easy to use and holds up well after multiple sessions on court.`,
      },
      {
        title: "Happy with this purchase",
        text: `Shipping was smooth and the product quality is solid. Would buy again.`,
      },
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
    const rating = Number(Math.max(3.9, Math.min(5, summary.rating - (idx === 2 ? 0.3 : 0) + seededFloat(seed + idx * 11) * 0.2)).toFixed(1));
    const copy = buildReviewCopy(kind, productTitle, idx);
    return {
      id: `${handle}-${idx}`,
      author,
      rating,
      date: formatDateFromSeed(seed + idx * 19),
      title: copy.title,
      text: copy.text,
      source: "synthetic",
    };
  });
}

