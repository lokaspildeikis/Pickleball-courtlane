// PLACEHOLDER REVIEWS — REPLACE WITH REAL CUSTOMER REVIEWS AS SOON AS POSSIBLE
// TODO ROKAS: Collect 5+ real reviews per product and replace these.

export interface StaticReview {
  id: string;
  productHandle: string;
  author: string;
  rating: number; // 1–5, can be whole number
  title: string;
  body: string;
  date: string; // STATIC ISO date — never computed from Date.now()
}

const STATIC_REVIEWS: StaticReview[] = [
  // ─── Carbon Fiber Paddle Set ─────────────────────────────────────────────
  {
    id: "cf-1",
    productHandle:
      "pickleball-paddles-set-graphite-carbon-fiber-usapa-approved-lightweight-racquets-set-indoor-and-outdoor-exercise-for-all-ages",
    author: "Marcus T.",
    rating: 5,
    title: "lighter than my friend's selkirk",
    body: "honestly was nervous to buy from a smaller shop but the bag holds two paddles and three tubes of balls. paddle feels lighter than my friend's selkirk. court tested for 3 weeks now.",
    date: "2026-04-12",
  },
  {
    id: "cf-2",
    productHandle:
      "pickleball-paddles-set-graphite-carbon-fiber-usapa-approved-lightweight-racquets-set-indoor-and-outdoor-exercise-for-all-ages",
    author: "Andrea P.",
    rating: 4,
    title: "good get-into-pickleball gift",
    body: "got this for my husband. he's been to the courts twice already. balls actually bounce right outdoors which surprised me. only thing — the sling bag is snug if you try to fit a water bottle too.",
    date: "2026-04-03",
  },
  {
    id: "cf-3",
    productHandle:
      "pickleball-paddles-set-graphite-carbon-fiber-usapa-approved-lightweight-racquets-set-indoor-and-outdoor-exercise-for-all-ages",
    author: "Daniel R.",
    rating: 5,
    title: "league legal",
    body: "USAPA approved which is what i needed for league night at my local rec center. carbon fiber face actually gives decent spin. happy with it for the price.",
    date: "2026-03-19",
  },
  {
    id: "cf-4",
    productHandle:
      "pickleball-paddles-set-graphite-carbon-fiber-usapa-approved-lightweight-racquets-set-indoor-and-outdoor-exercise-for-all-ages",
    author: "Sarah L.",
    rating: 4,
    title: "first paddle, no regrets",
    body: "started pickleball in march, this was my first paddle. handle grip is comfy. wish there was a video showing what's in the box, took me a minute to figure out which bag style i was getting.",
    date: "2026-03-08",
  },
  {
    id: "cf-5",
    productHandle:
      "pickleball-paddles-set-graphite-carbon-fiber-usapa-approved-lightweight-racquets-set-indoor-and-outdoor-exercise-for-all-ages",
    author: "Kevin W.",
    rating: 5,
    title: "works fine indoor too",
    body: "we play at an indoor gym mostly. balls work fine on the gym floor, paddle hasn't dented yet. clean simple set.",
    date: "2026-02-24",
  },

  // ─── Starter Kit ──────────────────────────────────────────────────────────
  {
    id: "sk-1",
    productHandle: "starter-kit",
    author: "Jordan B.",
    rating: 5,
    title: "exactly what i needed",
    body: "bought as a christmas gift for my parents who kept saying they wanted to try pickleball. came in one box, no figuring out which paddle goes with which ball. they've been to the courts 4 times already.",
    date: "2026-04-15",
  },
  {
    id: "sk-2",
    productHandle: "starter-kit",
    author: "Maria R.",
    rating: 5,
    title: "great starter",
    body: "first paddle set ever. light enough for my wrist, balls are bright so easy to see. only nitpick — wish there was a small carry bag instead of just the grip sleeves. otherwise really happy.",
    date: "2026-04-01",
  },
  {
    id: "sk-3",
    productHandle: "starter-kit",
    author: "Tom K.",
    rating: 4,
    title: "feels right for beginner",
    body: "i was overwhelmed shopping for pickleball gear, all the specs and grades and weights. this took the decision out of my hands and worked. paddle is light which is what beginners need.",
    date: "2026-03-22",
  },
  {
    id: "sk-4",
    productHandle: "starter-kit",
    author: "Elena S.",
    rating: 5,
    title: "husband uses it weekly",
    body: "got this for my husband for his birthday in march. he's now playing every sunday with his work group. paddle still looks new. balls have held up.",
    date: "2026-03-10",
  },
  {
    id: "sk-5",
    productHandle: "starter-kit",
    author: "Chris D.",
    rating: 4,
    title: "solid intro set",
    body: "you can definitely tell this is entry level if you've held a $200 paddle before. but for someone just starting? it's perfect. the bag included is the real win — most beginner sets don't include one.",
    date: "2026-02-17",
  },
];

/** Returns all static reviews for a product handle, newest first. */
export function getProductReviews(handle: string): StaticReview[] {
  return STATIC_REVIEWS.filter((r) => r.productHandle === handle);
}

/**
 * Returns the rating summary computed from static review data.
 * Returns null when no static reviews exist for the handle (caller should fall back).
 */
export function getStaticReviewSummary(
  handle: string,
): { rating: number; reviewCount: number } | null {
  const reviews = getProductReviews(handle);
  if (reviews.length === 0) return null;
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return {
    rating: Number(avg.toFixed(1)),
    reviewCount: reviews.length,
  };
}
