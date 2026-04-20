/// <reference types="vite/client" />

/**
 * Shopify Storefront API Client
 * 
 * To use the real Shopify Storefront API:
 * 1. Add your credentials to .env:
 *    VITE_SHOPIFY_STORE_DOMAIN="your-store.myshopify.com"
 *    VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN="your-storefront-access-token"
 * 2. Set USE_MOCK_DATA = false below.
 */

const domain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

// Set to true to use mock data for preview/development without Shopify credentials
const USE_MOCK_DATA = !domain || !storefrontAccessToken;

export async function shopifyFetch({ query, variables }: { query: string, variables?: any }) {
  if (USE_MOCK_DATA) {
    return mockShopifyFetch({ query, variables });
  }

  const endpoint = `https://${domain}/api/2024-01/graphql.json`;

  try {
    const result = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables })
    });

    return {
      status: result.status,
      body: await result.json()
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      status: 500,
      error: 'Error receiving data'
    };
  }
}

// --- Types ---

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  compareAtPriceRange?: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  images: {
    edges: Array<{ node: { url: string; altText: string | null } }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        availableForSale: boolean;
        selectedOptions?: Array<{ name: string; value: string }>;
        price: { amount: string; currencyCode: string };
        compareAtPrice?: { amount: string; currencyCode: string };
      }
    }>;
  };
  tags: string[];
}

// --- Mock Data Implementation ---

const MOCK_PRODUCTS: Product[] = [
  {
    id: "gid://shopify/Product/1",
    handle: "pro-tour-overgrip-3-pack",
    title: "Pro Tour Overgrip (3-Pack)",
    description: "An easy overgrip refill for players who want a steadier paddle hold during rec games and practice. It is built to improve hand comfort and control when your sessions run long.",
    descriptionHtml: "<p>An easy overgrip refill for players who want a steadier paddle hold during rec games and practice. It is built to improve hand comfort and control when your sessions run long.</p><ul><li>Includes: 3 overgrips</li><li>Surface feel: tacky, comfort-first wrap</li><li>Use case: everyday rec play and repeat practice sessions</li><li>Fit: wraps over most standard pickleball paddle handles</li></ul><p><strong>Who it's for:</strong> Beginners and casual players who want a simple grip upgrade without changing paddles.</p>",
    priceRange: { minVariantPrice: { amount: "12.00", currencyCode: "USD" } },
    images: {
      edges: [
        { node: { url: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&q=80&w=800", altText: "White overgrips" } }
      ]
    },
    variants: {
      edges: [
        { node: { id: "gid://shopify/ProductVariant/1", title: "White", availableForSale: true, price: { amount: "12.00", currencyCode: "USD" } } },
        { node: { id: "gid://shopify/ProductVariant/2", title: "Black", availableForSale: true, price: { amount: "12.00", currencyCode: "USD" } } }
      ]
    },
    tags: ["best-seller", "grip", "essentials"]
  },
  {
    id: "gid://shopify/Product/2",
    handle: "aero-paddle-cover",
    title: "Aero Neoprene Paddle Cover",
    description: "A simple paddle cover that helps protect your paddle face between sessions and while traveling to the court. It keeps your setup cleaner and easier to store in bags or lockers.",
    descriptionHtml: "<p>A simple paddle cover that helps protect your paddle face between sessions and while traveling to the court. It keeps your setup cleaner and easier to store in bags or lockers.</p><ul><li>Material: neoprene-style protective sleeve</li><li>Fit: works with most standard and elongated pickleball paddles</li><li>Use case: storage, travel, and daily court carry</li><li>Closure: quick on-and-off access for routine use</li></ul><p><strong>Who it's for:</strong> Players who want straightforward paddle protection without extra bulk.</p>",
    priceRange: { minVariantPrice: { amount: "24.00", currencyCode: "USD" } },
    compareAtPriceRange: { minVariantPrice: { amount: "30.00", currencyCode: "USD" } },
    images: {
      edges: [
        { node: { url: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&q=80&w=800&sat=-100", altText: "Paddle cover" } }
      ]
    },
    variants: {
      edges: [
        { node: { id: "gid://shopify/ProductVariant/3", title: "One size", availableForSale: true, price: { amount: "24.00", currencyCode: "USD" }, compareAtPrice: { amount: "30.00", currencyCode: "USD" } } }
      ]
    },
    tags: ["protection", "sale"]
  },
  {
    id: "gid://shopify/Product/3",
    handle: "cooling-performance-towel",
    title: "Cooling Performance Towel",
    description: "A lightweight court towel made for hot sessions, quick wipe-downs, and easier sweat control during play. Keep it in your bag for practice, rec games, and summer court days.",
    descriptionHtml: "<p>A lightweight court towel made for hot sessions, quick wipe-downs, and easier sweat control during play. Keep it in your bag for practice, rec games, and summer court days.</p><ul><li>Use case: sweat management during practice and matches</li><li>Portability: easy to fold and carry in pickleball bags</li><li>Comfort: soft feel for quick face and hand wipe-downs</li><li>Best for: warm weather sessions and high-activity games</li></ul><p><strong>Who it's for:</strong> Everyday players who want simple comfort and less distraction from sweat.</p>",
    priceRange: { minVariantPrice: { amount: "18.00", currencyCode: "USD" } },
    images: {
      edges: [
        { node: { url: "https://images.unsplash.com/photo-1584844297613-88220037a1e3?auto=format&fit=crop&q=80&w=800", altText: "Cooling towel" } }
      ]
    },
    variants: {
      edges: [
        { node: { id: "gid://shopify/ProductVariant/4", title: "Teal", availableForSale: true, price: { amount: "18.00", currencyCode: "USD" } } }
      ]
    },
    tags: ["apparel", "summer"]
  },
  {
    id: "gid://shopify/Product/4",
    handle: "starter-bundle",
    title: "The Court Starter Bundle",
    description: "A practical starter setup that bundles core pickleball accessories into one easy purchase. It helps new players skip the guesswork and get court-ready faster.",
    descriptionHtml: "<p>A practical starter setup that bundles core pickleball accessories into one easy purchase. It helps new players skip the guesswork and get court-ready faster.</p><ul><li>Includes: 3 overgrips, 1 paddle cover, 1 cooling towel</li><li>Bundle benefit: coordinated essentials in one order</li><li>Use case: first-time setup, gifting, or simple gear refresh</li><li>Value: lower bundled price vs buying each item separately</li></ul><p><strong>Who it's for:</strong> Beginners and casual players who want an all-in-one essentials kit.</p>",
    priceRange: { minVariantPrice: { amount: "45.00", currencyCode: "USD" } },
    compareAtPriceRange: { minVariantPrice: { amount: "54.00", currencyCode: "USD" } },
    images: {
      edges: [
        { node: { url: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80&w=800", altText: "Bundle" } }
      ]
    },
    variants: {
      edges: [
        { node: { id: "gid://shopify/ProductVariant/5", title: "One size", availableForSale: true, price: { amount: "45.00", currencyCode: "USD" }, compareAtPrice: { amount: "54.00", currencyCode: "USD" } } }
      ]
    },
    tags: ["bundle", "beginner", "best-seller"]
  },
  {
    id: "gid://shopify/Product/5",
    handle: "court-pro-backpack",
    title: "Court Pro Backpack",
    description: "A court-ready backpack designed to keep paddles and day-to-day essentials organized in one place. It is built for players who want cleaner packing before and after games.",
    descriptionHtml: "<p>A court-ready backpack designed to keep paddles and day-to-day essentials organized in one place. It is built for players who want cleaner packing before and after games.</p><ul><li>Capacity: holds up to 4 paddles</li><li>Storage: dedicated sections for shoes and accessories</li><li>Carry comfort: padded shoulder straps for daily use</li><li>Material: water-resistant fabric for routine court travel</li></ul><p><strong>Who it's for:</strong> Rec players who carry multiple items and want quick, reliable organization.</p>",
    priceRange: { minVariantPrice: { amount: "85.00", currencyCode: "USD" } },
    images: {
      edges: [
        { node: { url: "https://images.unsplash.com/photo-1553062407-98eeb94c6a62?auto=format&fit=crop&q=80&w=800", altText: "Premium backpack" } }
      ]
    },
    variants: {
      edges: [
        { node: { id: "gid://shopify/ProductVariant/6", title: "Midnight Black", availableForSale: true, price: { amount: "85.00", currencyCode: "USD" } } }
      ]
    },
    tags: ["backpack", "travel", "essentials"]
  }
];

async function mockShopifyFetch({ query, variables }: { query: string, variables?: any }) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));

  if (query.includes('products(first:')) {
    return {
      status: 200,
      body: {
        data: {
          products: {
            edges: MOCK_PRODUCTS.map(p => ({ node: p }))
          }
        }
      }
    };
  }

  if (query.includes('product(handle:')) {
    const handle = variables?.handle;
    const product = MOCK_PRODUCTS.find(p => p.handle === handle);
    return {
      status: 200,
      body: {
        data: {
          product: product || null
        }
      }
    };
  }

  return {
    status: 200,
    body: { data: {} }
  };
}

// --- Helper Functions ---

export async function getProducts() {
  const query = `
    query getProducts {
      products(first: 250) {
        edges {
          node {
            id
            handle
            title
            description
            tags
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  selectedOptions {
                    name
                    value
                  }
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await shopifyFetch({ query });
  if (response.body?.errors) {
    console.error("Shopify API Errors:", response.body.errors);
  }
  const edges = response.body?.data?.products?.edges || [];
  return edges.map((edge: any) => edge.node) as Product[];
}

export async function getProduct(handle: string) {
  const query = `
    query getProduct($handle: String!) {
      product(handle: $handle) {
        id
        handle
        title
        description
        descriptionHtml
        tags
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        compareAtPriceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 5) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 100) {
          edges {
            node {
              id
              title
              availableForSale
                selectedOptions {
                  name
                  value
                }
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

  const response = await shopifyFetch({ query, variables: { handle } });
  if (response.body?.errors) {
    console.error("Shopify API Errors:", response.body.errors);
  }
  return (response.body?.data?.product as Product) || null;
}
