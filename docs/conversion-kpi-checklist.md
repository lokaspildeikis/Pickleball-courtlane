# Conversion KPI Checklist

Use this checklist to compare baseline vs post-release performance for the conversion-first UX updates.

## Tracking Events

- `ViewContent` (existing): product detail views.
- `AddToCart` (existing): add-to-cart actions from product detail.
- `InitiateCheckout` (existing): checkout start from cart drawer.
- `ShopFilterChanged` (new custom): category filter usage on shop page.
- `ShopIntentSelected` (new custom): quick-pick chip usage (`beginner`, `best-seller`, `budget`).
- `ShopSortChanged` (new custom): sorting behavior.
- `ShopFiltersCleared` (new custom): filter reset behavior.
- `StickyAtcShown` (new custom): sticky mobile ATC visibility.
- `StickyAtcClicked` (new custom): sticky mobile ATC interaction.

## Baseline Window

- Collect at least 7 days of baseline data before comparing results.
- Segment by device (mobile vs desktop), because sticky ATC is mobile only.

## Primary Conversion KPIs

- Product View -> Add to Cart rate.
- Add to Cart -> Initiate Checkout rate.
- Product View -> Initiate Checkout rate.

## Secondary Behavior KPIs

- Quick-pick chip adoption rate (`ShopIntentSelected` / shop sessions).
- Sticky ATC click-through rate (`StickyAtcClicked` / `StickyAtcShown`).
- Filter reset rate (`ShopFiltersCleared` / sessions with any filter event).

## Success Criteria

- Increase Product View -> Add to Cart rate by 10%+ on mobile.
- Increase Add to Cart -> Initiate Checkout rate by 5%+ overall.
- Keep bounce/exit behavior stable or improved on shop and product pages.

## QA Validation Notes

- Mobile: sticky ATC appears only after main CTA scrolls out of view.
- Desktop: sticky ATC does not appear.
- Shop page: quick-pick chips, result count, and clear-filters action all function with URL params.
