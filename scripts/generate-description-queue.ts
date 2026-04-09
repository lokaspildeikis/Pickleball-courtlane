import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const domain = process.env.VITE_SHOPIFY_STORE_DOMAIN?.trim();
const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim();
const clientId = process.env.SHOPIFY_CLIENT_ID?.trim();
const clientSecret = process.env.SHOPIFY_CLIENT_SECRET?.trim();
const limit = Number(process.env.DESCRIPTION_QUEUE_LIMIT || "250");

if (!domain || !(adminToken || (clientId && clientSecret))) {
  console.error("Missing required .env variables:");
  if (!domain) console.error("- VITE_SHOPIFY_STORE_DOMAIN");
  if (!(adminToken || (clientId && clientSecret))) {
    console.error("- SHOPIFY_ADMIN_ACCESS_TOKEN (or SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET)");
  }
  process.exit(1);
}

type ShopifyProduct = {
  id: number;
  handle: string;
  title: string;
  body_html: string;
  tags: string;
  product_type?: string;
  variants?: Array<{ title: string }>;
};

type DescriptionType =
  | "balls"
  | "paddle"
  | "bag"
  | "bundle"
  | "towel"
  | "sweat-accessory"
  | "grip"
  | "cover"
  | "accessory";

type RewriteRow = {
  id: number;
  handle: string;
  title: string;
  type: DescriptionType;
  originalBodyHtml: string;
  proposedBodyHtml: string;
  reviewStatus: "needs-review";
};

const SUPPLIER_NOISE_PATTERNS: RegExp[] = [
  /mainkey\d*\s*:/i,
  /brand name\s*:/i,
  /choice\s*:/i,
  /high-concerned chemical\s*:/i,
  /^cn\s*:/i,
];

function stripHtml(input: string): string {
  return input
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanText(input: string): string {
  const text = stripHtml(input)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !SUPPLIER_NOISE_PATTERNS.some((pattern) => pattern.test(line)))
    .join(" ");

  return text
    .replace(/\b(high quality|premium quality|perfect gift|pro-level|tournament-level)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function extractListItems(html: string): string[] {
  const items = Array.from(html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)).map((match) =>
    cleanText(match[1] || ""),
  );
  return items.filter(Boolean).slice(0, 6);
}

function detectType(product: ShopifyProduct): DescriptionType {
  const haystack = `${product.title} ${product.tags || ""} ${product.product_type || ""} ${product.body_html || ""}`.toLowerCase();
  if (haystack.includes("ball")) return "balls";
  if (haystack.includes("paddle")) return "paddle";
  if (haystack.includes("bag") || haystack.includes("backpack")) return "bag";
  if (haystack.includes("bundle") || haystack.includes("kit") || haystack.includes("starter")) return "bundle";
  if (haystack.includes("towel")) return "towel";
  if (haystack.includes("sweatband") || haystack.includes("headband") || haystack.includes("wristband")) return "sweat-accessory";
  if (haystack.includes("grip")) return "grip";
  if (haystack.includes("cover")) return "cover";
  return "accessory";
}

function detectPackCount(product: ShopifyProduct): string | null {
  const haystack = `${product.title} ${product.body_html}`.toLowerCase();
  const match = haystack.match(/(\d+)\s*[- ]?(pack|pcs|pieces|balls?)/i);
  if (!match) return null;
  return `${match[1]} ${match[2].toLowerCase()}`;
}

function introFor(product: ShopifyProduct, type: DescriptionType): string {
  const clean = cleanText(product.body_html || "");
  const candidate = clean.split(".").slice(0, 2).join(".").trim();
  if (candidate.length > 45) {
    return candidate.endsWith(".") ? candidate : `${candidate}.`;
  }

  if (type === "bundle") {
    return `${product.title} is a simple all-in-one setup for players who want to start quickly with practical pickleball essentials. It helps reduce guesswork by grouping core items in one purchase.`;
  }
  if (type === "bag") {
    return `${product.title} helps keep your pickleball gear organized and easy to carry between home and court. It is built for everyday sessions where convenience matters.`;
  }
  if (type === "paddle") {
    return `${product.title} is a straightforward paddle option for beginners and rec players who want reliable day-to-day playability. It is designed for comfortable use without overcomplicated setup.`;
  }
  if (type === "balls") {
    return `${product.title} is a practical ball option for repeat drills, rec games, and regular court sessions. It is a solid choice for players who want consistent everyday use.`;
  }

  return `${product.title} is a useful pickleball essential built for regular court use. It supports simple, reliable setup for everyday players.`;
}

function featuresFor(product: ShopifyProduct, type: DescriptionType): string[] {
  const extracted = extractListItems(product.body_html || "");
  if (extracted.length >= 3) return extracted.slice(0, 6);

  const features: string[] = [];
  const packCount = detectPackCount(product);
  if (packCount) features.push(`Pack size: ${packCount}`);

  if (type === "balls") {
    features.push("Use case: practice, rec matches, and repeat court sessions");
  } else if (type === "paddle") {
    features.push("Use case: beginner and casual rec play");
  } else if (type === "bag") {
    features.push("Use case: court travel and everyday gear organization");
  } else if (type === "bundle") {
    features.push("Bundle format: multiple essentials in one purchase");
  } else if (type === "towel" || type === "sweat-accessory") {
    features.push("Use case: sweat control and comfort during long sessions");
  } else if (type === "grip" || type === "cover") {
    features.push("Use case: comfort and paddle-care convenience");
  } else {
    features.push("Use case: everyday court sessions");
  }

  if (product.variants?.length && product.variants[0]?.title !== "Default Title") {
    features.push(`Variant options: ${product.variants.length}`);
  }

  features.push("Brand voice: straightforward setup for beginners and everyday players");
  return features.slice(0, 5);
}

function useCaseFor(type: DescriptionType): string {
  if (type === "bundle") return "Who it's for: Beginners, gifting, or players who want a ready-to-play setup in one order.";
  if (type === "bag") return "Who it's for: Players who carry multiple items and want faster gear organization.";
  if (type === "balls") return "Who it's for: Beginners and rec players doing regular drills or everyday games.";
  if (type === "paddle") return "Who it's for: Casual and rec players looking for simple, dependable paddle performance.";
  if (type === "towel" || type === "sweat-accessory") {
    return "Who it's for: Players who want basic comfort and sweat control during longer sessions.";
  }
  return "Who it's for: Everyday pickleball players who prefer practical, no-fuss gear.";
}

function buildHtml(product: ShopifyProduct): { type: DescriptionType; bodyHtml: string } {
  const type = detectType(product);
  const intro = introFor(product, type);
  const features = featuresFor(product, type);
  const useCase = useCaseFor(type);

  const listHtml = features.map((feature) => `<li>${feature}</li>`).join("");
  const bodyHtml = `<p>${intro}</p><ul>${listHtml}</ul><p><strong>${useCase}</strong></p>`;
  return { type, bodyHtml };
}

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

let resolvedShopifyToken: string | null = adminToken || null;

async function getShopifyToken(): Promise<string> {
  if (resolvedShopifyToken) return resolvedShopifyToken;
  if (!clientId || !clientSecret || !domain) {
    throw new Error("Missing Shopify credentials for OAuth token exchange.");
  }

  const url = `https://${domain}/admin/oauth/access_token`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Shopify token exchange failed (${response.status}): ${err}`);
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error("Shopify token exchange returned no access_token.");
  }

  resolvedShopifyToken = data.access_token;
  return resolvedShopifyToken;
}

async function fetchProducts(): Promise<ShopifyProduct[]> {
  const token = await getShopifyToken();
  const url = `https://${domain}/admin/api/2024-01/products.json?limit=${limit}&status=active&fields=id,handle,title,body_html,tags,product_type,variants`;
  const response = await fetch(url, {
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to fetch products (${response.status}): ${err}`);
  }
  const data = await response.json();
  return (data.products || []) as ShopifyProduct[];
}

async function run() {
  console.log("--- Generate Product Description Queue ---");
  console.log(`Store: ${domain}`);
  console.log(`Limit: ${limit}`);

  const products = await fetchProducts();
  if (!products.length) {
    console.log("No active products found.");
    return;
  }

  const queue: RewriteRow[] = products.map((product) => {
    const rewrite = buildHtml(product);
    return {
      id: product.id,
      handle: product.handle,
      title: product.title,
      type: rewrite.type,
      originalBodyHtml: product.body_html || "",
      proposedBodyHtml: rewrite.bodyHtml,
      reviewStatus: "needs-review",
    };
  });

  const tmpDir = path.resolve(__dirname, "../src/tmp");
  await fs.mkdir(tmpDir, { recursive: true });

  const jsonPath = path.join(tmpDir, "description-rewrite-queue.json");
  await fs.writeFile(jsonPath, JSON.stringify(queue, null, 2), "utf8");

  const csvHeader = [
    "id",
    "handle",
    "title",
    "type",
    "review_status",
    "original_body_html",
    "proposed_body_html",
  ].join(",");

  const csvRows = queue.map((row) =>
    [
      row.id.toString(),
      csvEscape(row.handle),
      csvEscape(row.title),
      csvEscape(row.type),
      csvEscape(row.reviewStatus),
      csvEscape(row.originalBodyHtml),
      csvEscape(row.proposedBodyHtml),
    ].join(","),
  );

  const csvPath = path.join(tmpDir, "description-rewrite-queue.csv");
  await fs.writeFile(csvPath, [csvHeader, ...csvRows].join("\n"), "utf8");

  console.log(`Queued ${queue.length} products for review.`);
  console.log(`JSON: ${jsonPath}`);
  console.log(`CSV: ${csvPath}`);
  console.log("Next step: review proposed_body_html, then apply approved rows via Shopify Admin CSV or API script.");
}

run().catch((error) => {
  console.error("Fatal script error:", error);
  process.exit(1);
});

