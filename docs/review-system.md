# Review System

Customer reviews are managed in `src/lib/syntheticReviews.ts`.

## Where to edit reviews

- `REVIEW_DATA.byProduct[handle]`: exact reviews for a specific product handle.
- `REVIEW_DATA.byType[type]`: fallback reviews for product categories.
- `REVIEW_DATA.safeFallback`: neutral store-level reviews used only when no exact/type reviews match.

## Assignment order

1. Exact product handle (`byProduct`)
2. Product type pool (`byType`)
3. Safe fallback (`safeFallback`)

Each candidate review is filtered by keyword relevance before rendering.

## Product types

- `balls`
- `paddles`
- `paddle-covers`
- `bags`
- `towels-accessories`
- `bundles`
- `generic`

## Relevance safeguard

Keyword groups are defined in `TYPE_KEYWORDS`.
If a review text strongly matches another product type more than the current one, it is excluded.
Neutral service reviews with no product-specific words can still be used as safe fallback.
