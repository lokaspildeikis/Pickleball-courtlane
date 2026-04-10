/**
 * Courtlane brand & About copy — single source of truth.
 * Edit here to update the About page, homepage story block, and footer blurb together.
 */

import { SUPPORT_EMAIL } from "./trustContent";

export const BRAND_NAME = "Courtlane";

/** Short line used in the footer (and anywhere else you need a one-line blurb). */
export const FOOTER_BRAND_BLURB =
  "Pickleball accessories and essentials for beginners and everyday players—clear info, practical gear, and email support when you need it.";

/** Homepage: compact credibility block above the fold area (keep brief). */
export const HOME_BRAND_STORY = {
  /** Section heading — one short line */
  heading: "Built for real court days",
  paragraphs: [
    "Courtlane is a pickleball-focused shop for people who play for fun, exercise, and regular rec games—not for chasing pro hype or sorting through endless marketplace listings.",
    "We stick to useful essentials and starter-friendly bundles, with straightforward descriptions and policies so you can grab what you need and get back to playing.",
  ] as const,
  readMoreLabel: "About Courtlane",
  readMoreHref: "/about",
  shopCtaLabel: "Shop essentials",
  shopHref: "/shop",
};

/** Full About page — sections map to the page layout in About.tsx */
export const ABOUT_PAGE = {
  meta: {
    title: "About Courtlane — Pickleball essentials for everyday players",
    description:
      "Courtlane sells pickleball accessories and essentials for beginners and recreational players. Simple gear, clear product info, secure checkout, and straightforward shipping & returns.",
  },
  /** Section 1 — intro */
  intro: {
    headline: "Pickleball essentials for everyday players",
    subheading:
      "Courtlane exists so beginners and recreational players can find reliable gear without wading through generic sports copy or marketplace clutter. Useful products, plain language, simple support.",
    ctaPrimary: { label: "Shop essentials", href: "/shop" },
    ctaSecondary: { label: "Browse starter bundles", href: "/shop?filter=bundles" },
  },
  /** Section 2 — narrative (2–4 short paragraphs) */
  story: {
    paragraphs: [
      "Pickleball shopping shouldn’t feel like homework. Too many listings read the same, stack specs you’ll never use, or push “elite performance” when you just want a comfortable grip and gear that shows up when expected.",
      "Courtlane is built for players who want simple, dependable accessories—balls, grips, bags, covers, towels, and bundled starters—chosen for everyday play, not showroom flex.",
      "We’re not trying to sound like a giant sports brand. We’re aiming for the opposite: a small, pickleball-specific shelf where you can read what something does, see what’s in a bundle, and check shipping or returns without digging.",
      "If you’re new, play a few times a week, or you’re buying for someone who does, that’s who this store is for. Questions before checkout? Email us—we’d rather answer plainly than leave you guessing.",
    ] as const,
  },
  /** Section 3 — what we care about in selection */
  focus: {
    title: "What Courtlane focuses on",
    items: [
      "Simple, useful gear you’ll actually use between sessions",
      "Everyday practicality over trend-chasing or spec overload",
      "Beginner-friendly bundles when you want fewer decisions",
      "Straightforward support by email",
      "Clean product information—what it is, who it’s for, how to choose",
    ] as const,
  },
  /** Section 4 — trust (calm, not badge spam) */
  trust: {
    title: "Straightforward shopping, start to finish",
    body:
      "Checkout runs through secure payment processing. Shipping timelines and return rules are spelled out on their own pages—no fine-print scavenger hunt. If something’s wrong with an order or you’re unsure what to buy, write us at",
    links: [
      { label: "Shipping", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "Help & FAQ", href: "/faq" },
    ] as const,
  },
  /** Optional micro-proof — honest framing, no fake metrics */
  proof: {
    title: "Why shop here instead of a giant marketplace?",
    points: [
      "Pickleball-only focus—categories and copy match what you’re actually buying",
      "Fewer tabs and mystery sellers; one place with consistent policies",
      "Product pages written for recreational play, not wholesale catalogs",
    ] as const,
  },
  /** Section 5 — closing CTA */
  closing: {
    title: "Ready to stock your bag?",
    body: "Browse the full catalog, start with a bundle, or get in touch if you want a quick recommendation.",
    primary: { label: "Shop all", href: "/shop" },
    secondary: [
      { label: "Starter bundles", href: "/shop?filter=bundles" },
      { label: "Contact support", href: `mailto:${SUPPORT_EMAIL}` },
    ] as const,
  },
  /** Hero image — swap for your own photography when ready */
  heroImage: {
    src: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&q=80&w=1600",
    alt: "Outdoor pickleball court on a clear day",
  },
} as const;
