type ProductNode = {
  handle: string;
  updatedAt?: string;
};

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function resolveSiteUrl(req: any): string {
  const envSiteUrl = process.env.VITE_SITE_URL || process.env.SHOP_PUBLIC_URL;
  if (envSiteUrl) return String(envSiteUrl).replace(/\/$/, "");

  const host = req?.headers?.host || "courtlane.us";
  const proto = req?.headers?.["x-forwarded-proto"] || "https";
  return `${proto}://${host}`.replace(/\/$/, "");
}

async function fetchProductHandles(): Promise<ProductNode[]> {
  const domain = process.env.VITE_SHOPIFY_STORE_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN;
  const token =
    process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!domain || !token) return [];

  const endpoint = `https://${domain}/api/2024-01/graphql.json`;
  const query = `
    query SitemapProducts {
      products(first: 250) {
        edges {
          node {
            handle
            updatedAt
          }
        }
      }
    }
  `;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) return [];

  const data = await response.json();
  const edges = data?.data?.products?.edges || [];
  return edges
    .map((edge: any) => edge?.node)
    .filter((node: any) => node?.handle)
    .map((node: any) => ({ handle: String(node.handle), updatedAt: node.updatedAt ? String(node.updatedAt) : undefined }));
}

function buildSitemapXml(siteUrl: string, products: ProductNode[]): string {
  const staticUrls: Array<{ path: string; changefreq: string; priority: string }> = [
    { path: "/", changefreq: "daily", priority: "1.0" },
    { path: "/shop", changefreq: "daily", priority: "0.9" },
    { path: "/about", changefreq: "monthly", priority: "0.6" },
    { path: "/faq", changefreq: "monthly", priority: "0.7" },
    { path: "/shipping", changefreq: "monthly", priority: "0.5" },
    { path: "/returns", changefreq: "monthly", priority: "0.5" },
    { path: "/privacy", changefreq: "yearly", priority: "0.3" },
    { path: "/terms", changefreq: "yearly", priority: "0.3" },
  ];

  const staticXml = staticUrls
    .map(
      (entry) => `  <url>
    <loc>${xmlEscape(`${siteUrl}${entry.path}`)}</loc>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
    )
    .join("\n");

  const productXml = products
    .map((product) => {
      const lastmod = product.updatedAt ? `\n    <lastmod>${xmlEscape(product.updatedAt)}</lastmod>` : "";
      return `  <url>
    <loc>${xmlEscape(`${siteUrl}/product/${product.handle}`)}</loc>${lastmod}
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticXml}${productXml ? `\n${productXml}` : ""}
</urlset>`;
}

export default async function handler(req: any, res: any) {
  const method = String(req.method || "").toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    res.status(405).setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Method not allowed");
    return;
  }

  const siteUrl = resolveSiteUrl(req);
  const products = await fetchProductHandles();
  const xml = buildSitemapXml(siteUrl, products);

  res.status(200);
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  if (method === "HEAD") {
    res.end();
    return;
  }
  res.end(xml);
}
