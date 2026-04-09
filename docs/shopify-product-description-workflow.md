# Shopify Product Description Workflow (Courtlane)

This project now standardizes product description rendering in the frontend with:
- a short intro paragraph,
- a key features/specs bullet list,
- a "Who it's for" section,
- and an optional note.

## Where product descriptions come from

- Live storefront product content comes from Shopify Storefront API in `src/lib/shopify.ts`.
- Product detail rendering happens in `src/pages/ProductDetail.tsx`.
- In-repo fallback/demo catalog lives in `MOCK_PRODUCTS` inside `src/lib/shopify.ts`.

Because live descriptions are managed in Shopify Admin, full-catalog rewrite for production data should be done in Shopify content records.

## Reusable template format for Shopify Admin

Use this HTML pattern for each product `body_html`:

```html
<p>[2-4 sentence intro: what product is + practical value for pickleball players]</p>
<ul>
  <li>[Key feature/spec]</li>
  <li>[Key feature/spec]</li>
  <li>[Key feature/spec]</li>
  <li>[Key feature/spec]</li>
</ul>
<p><strong>Who it's for:</strong> [short use-case sentence]</p>
<p><strong>Note:</strong> [optional practical note only when needed]</p>
```

## Product-type mapping guide

- Balls: indoor/outdoor type (if known), pack size, material (if known), hole count (if known), rec/training use.
- Paddles: build/material (if known), shape/style, grip feel/info, beginner/balanced use.
- Bags: paddle capacity, compartments, shoes/balls/towel fit, carry use.
- Towels/sweatbands/grips/accessories: comfort, sweat control, portability, practice/match convenience.
- Bundles/kits: explicit included items and why the bundle is useful for beginners/convenience.

## Recommended bulk update path in Shopify

1. Shopify Admin -> Products -> Export all products as CSV.
2. Rewrite only `Body (HTML)` in bulk using the template above.
3. Keep titles unless supplier-junk or clearly broken.
4. Re-import CSV to Shopify Admin.
5. Spot-check 10-15 products in storefront and mobile.

## Queue-based workflow added in this repo

You can now generate a review queue for the full active catalog:

```bash
npm run descriptions:queue
```

This creates:
- `src/tmp/description-rewrite-queue.json`
- `src/tmp/description-rewrite-queue.csv`

Each row includes:
- product id / handle / title
- detected product type
- original `body_html`
- proposed `body_html` in Courtlane format
- `review_status` column (`needs-review`)

Recommended flow:
1. Run queue generation.
2. Review and edit `proposed_body_html` for ambiguous items.
3. Set `reviewStatus` per row:
   - `approved` to apply
   - `needs-review` to hold
   - `skip` to never apply
4. Apply from queue with dry run first:

```bash
npm run descriptions:apply
```

5. Push approved rows live:

```bash
npm run descriptions:apply:live
```

6. QA on product detail pages for formatting consistency.

If you prefer direct API writes, extend `scripts/optimize-products.ts` to consume approved queue rows and update only reviewed products.

