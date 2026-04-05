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
    description: "Maximum tack and sweat absorption for intense rallies. Our premium overgrip keeps your paddle secure in your hand no matter how hot it gets on the court.",
    descriptionHtml: "<p>Maximum tack and sweat absorption for intense rallies. Our premium overgrip keeps your paddle secure in your hand no matter how hot it gets on the court.</p><ul><li>Ultra-tacky surface</li><li>High sweat absorption</li><li>0.6mm thickness for optimal feel</li></ul>",
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
    description: "Protect your investment with our thick, shock-absorbing neoprene cover. Fits all standard and elongated pickleball paddles.",
    descriptionHtml: "<p>Protect your investment with our thick, shock-absorbing neoprene cover. Fits all standard and elongated pickleball paddles.</p>",
    priceRange: { minVariantPrice: { amount: "24.00", currencyCode: "USD" } },
    compareAtPriceRange: { minVariantPrice: { amount: "30.00", currencyCode: "USD" } },
    images: {
      edges: [
        { node: { url: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&q=80&w=800&sat=-100", altText: "Paddle cover" } }
      ]
    },
    variants: {
      edges: [
        { node: { id: "gid://shopify/ProductVariant/3", title: "Default Title", availableForSale: true, price: { amount: "24.00", currencyCode: "USD" }, compareAtPrice: { amount: "30.00", currencyCode: "USD" } } }
      ]
    },
    tags: ["protection", "sale"]
  },
  {
    id: "gid://shopify/Product/3",
    handle: "cooling-performance-towel",
    title: "Cooling Performance Towel",
    description: "Instantly cools when wet. Perfect for those long summer tournament days.",
    descriptionHtml: "<p>Instantly cools when wet. Perfect for those long summer tournament days.</p>",
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
    description: "Everything you need to hit the courts: 3 overgrips, 1 paddle cover, and a cooling towel.",
    descriptionHtml: "<p>Everything you need to hit the courts: 3 overgrips, 1 paddle cover, and a cooling towel.</p>",
    priceRange: { minVariantPrice: { amount: "45.00", currencyCode: "USD" } },
    compareAtPriceRange: { minVariantPrice: { amount: "54.00", currencyCode: "USD" } },
    images: {
      edges: [
        { node: { url: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80&w=800", altText: "Bundle" } }
      ]
    },
    variants: {
      edges: [
        { node: { id: "gid://shopify/ProductVariant/5", title: "Default Title", availableForSale: true, price: { amount: "45.00", currencyCode: "USD" }, compareAtPrice: { amount: "54.00", currencyCode: "USD" } } }
      ]
    },
    tags: ["bundle", "beginner", "best-seller"]
  },
  {
    id: "gid://shopify/Product/5",
    handle: "court-pro-backpack",
    title: "Court Pro Backpack",
    description: "The ultimate tournament bag. Features a dedicated paddle compartment, ventilated shoe garage, and plenty of space for your gear.",
    descriptionHtml: "<p>The ultimate tournament bag. Features a dedicated paddle compartment, ventilated shoe garage, and plenty of space for your gear.</p><ul><li>Water-resistant fabric</li><li>Padded shoulder straps</li><li>Fits up to 4 paddles</li></ul>",
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
        variants(first: 10) {
          edges {
            node {
              id
              title
              availableForSale
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
