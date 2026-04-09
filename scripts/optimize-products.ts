import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const domain = process.env.VITE_SHOPIFY_STORE_DOMAIN?.trim();
const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim();
const clientId = process.env.SHOPIFY_CLIENT_ID?.trim();
const clientSecret = process.env.SHOPIFY_CLIENT_SECRET?.trim();
const geminiKey = process.env.GEMINI_API_KEY?.trim();
const geminiModel = process.env.GEMINI_MODEL?.trim() || "gemini-3-flash-preview";
const tagToProcess = process.env.OPTIMIZE_TAG?.trim() || "ai-not-optimized";
const successTag = process.env.OPTIMIZED_TAG?.trim() || "ai-optimized";
const limit = Number(process.env.OPTIMIZE_LIMIT || "10");
const cliLiveMode = process.argv.includes("--live");
const dryRun = cliLiveMode ? false : (process.env.OPTIMIZE_DRY_RUN || "true").toLowerCase() === "true";
const optimizeImageAlt = (process.env.OPTIMIZE_IMAGE_ALT || "false").toLowerCase() === "true";

if (!domain || !(adminToken || (clientId && clientSecret)) || !geminiKey) {
  console.error("Missing required .env variables:");
  if (!domain) console.error("- VITE_SHOPIFY_STORE_DOMAIN");
  if (!(adminToken || (clientId && clientSecret))) {
    console.error("- SHOPIFY_ADMIN_ACCESS_TOKEN (or SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET)");
  }
  if (!geminiKey) console.error("- GEMINI_API_KEY");
  process.exit(1);
}

type ShopifyProduct = {
  id: number;
  title: string;
  body_html: string;
  tags: string;
  images?: Array<{
    id: number;
    src: string;
    alt?: string | null;
  }>;
};

type AiResult = {
  title: string;
  body_html: string;
  seo_title: string;
  seo_description: string;
  specs: string[];
};

type ImageAltResult = {
  alt_text: string;
};

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

function uniqueTags(tagString: string, add: string, remove: string): string {
  const tags = tagString
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => t !== remove);
  if (!tags.includes(add)) tags.push(add);
  return tags.join(", ");
}

function sanitizeDescriptionHtml(html: string): string {
  return html
    .replace(/<img\b[^>]*>/gi, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseJsonObject<T>(raw: string): T {
  const normalized = raw.replace(/```json|```/gi, "").trim();
  const firstBrace = normalized.indexOf("{");
  const lastBrace = normalized.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON object found in model response.");
  }
  const jsonString = normalized.slice(firstBrace, lastBrace + 1);
  return JSON.parse(jsonString) as T;
}

async function generateLuxuryContent(product: ShopifyProduct): Promise<AiResult> {
  const prompt = `
You are a Master E-commerce Copywriter for a premium pickleball brand.
Rewrite this Shopify listing in high-converting, premium English.

Rules:
1) Keep claims realistic and compliant (no medical or impossible claims).
2) Title: concise, premium, benefit-forward.
3) Description: 2 short paragraphs + a "Performance Highlights" HTML bullet list (4-6 bullets).
4) Include "Quick Specs" as a short list of 4-6 factual bullet points.
5) Generate SEO fields:
   - seo_title: max 60 chars
   - seo_description: 140-160 chars
6) Do NOT include any images, image links, markdown images, or <img> tags in body_html.
6) Output ONLY valid JSON:
{
  "title": "string",
  "body_html": "<p>...</p><p>...</p><h3>Performance Highlights</h3><ul><li>...</li></ul><h3>Quick Specs</h3><ul><li>...</li></ul>",
  "seo_title": "string",
  "seo_description": "string",
  "specs": ["string", "string"]
}

Current title: ${product.title}
Current HTML description: ${sanitizeDescriptionHtml(product.body_html || "<p>N/A</p>")}
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.65,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Gemini API failed (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error("Gemini returned empty content.");

  const parsed = parseJsonObject<AiResult>(raw);

  if (!parsed.title || !parsed.body_html || !parsed.seo_title || !parsed.seo_description) {
    throw new Error("Gemini response missing required fields.");
  }

  return {
    ...parsed,
    body_html: sanitizeDescriptionHtml(parsed.body_html),
  };
}

async function fetchProductsToOptimize(): Promise<ShopifyProduct[]> {
  const token = await getShopifyToken();
  const url = `https://${domain}/admin/api/2024-01/products.json?limit=${limit}&status=active&tag=${encodeURIComponent(tagToProcess)}&fields=id,title,body_html,tags,images`;
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

async function generateImageAltText(productTitle: string, imageUrl: string): Promise<string> {
  const prompt = `
Write SEO-friendly alt text for a product image.

Rules:
- 8 to 16 words.
- Describe what the image likely shows for this product.
- Include product context naturally.
- No keyword stuffing, no quotes, no emojis, no ending punctuation.
- Output ONLY valid JSON:
{
  "alt_text": "string"
}

Product title: ${productTitle}
Image URL: ${imageUrl}
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 256,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Gemini alt-text API failed (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error("Gemini returned empty alt text.");

  const parsed = parseJsonObject<ImageAltResult>(raw);

  if (!parsed.alt_text?.trim()) {
    throw new Error("Gemini response missing alt_text.");
  }

  return parsed.alt_text.trim().slice(0, 125);
}

async function updateProductImageAlt(productId: number, imageId: number, alt: string) {
  const token = await getShopifyToken();
  const url = `https://${domain}/admin/api/2024-01/products/${productId}/images/${imageId}.json`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: {
        id: imageId,
        alt,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Image alt update failed (${response.status}): ${err}`);
  }
}

async function updateProduct(product: ShopifyProduct, optimized: AiResult) {
  const token = await getShopifyToken();
  const url = `https://${domain}/admin/api/2024-01/products/${product.id}.json`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product: {
        id: product.id,
        title: optimized.title,
        body_html: optimized.body_html,
        metafields_global_title_tag: optimized.seo_title.slice(0, 60),
        metafields_global_description_tag: optimized.seo_description.slice(0, 160),
        tags: uniqueTags(product.tags || "", successTag, tagToProcess),
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Shopify update failed (${response.status}): ${err}`);
  }
}

async function optimizeImageAlts(product: ShopifyProduct) {
  if (!product.images?.length) {
    console.log("No images found for alt-text optimization.");
    return;
  }

  for (const [imageIndex, image] of product.images.entries()) {
    if (!image?.id || !image?.src) continue;
    try {
      const alt = await generateImageAltText(product.title, image.src);
      if (dryRun) {
        console.log(`Image ${imageIndex + 1}: ${alt} (dry run)`);
      } else {
        await updateProductImageAlt(product.id, image.id, alt);
        console.log(`Image ${imageIndex + 1}: alt text updated.`);
      }
    } catch (error) {
      console.error(`Image ${imageIndex + 1}: alt text failed`, error);
    }
  }
}

async function optimizeProducts() {
  console.log("--- Bulk Product Optimizer ---");
  console.log(`Store: ${domain}`);
  console.log(`Filter tag: ${tagToProcess}`);
  console.log(`Success tag: ${successTag}`);
  console.log(`Limit: ${limit}`);
  console.log(`Mode: ${dryRun ? "DRY RUN (no Shopify writes)" : "LIVE"}`);
  console.log(`Image alt optimization: ${optimizeImageAlt ? "ON" : "OFF"}`);

  const products = await fetchProductsToOptimize();
  if (!products.length) {
    console.log(`No products found with tag "${tagToProcess}".`);
    return;
  }

  console.log(`Found ${products.length} products.`);

  for (const [index, product] of products.entries()) {
    console.log(`\n[${index + 1}/${products.length}] Optimizing: ${product.title}`);
    try {
      const optimized = await generateLuxuryContent(product);
      console.log(`AI title: ${optimized.title}`);
      console.log(`SEO title: ${optimized.seo_title}`);
      console.log(`SEO description: ${optimized.seo_description}`);
      if (optimized.specs?.length) {
        console.log(`Specs: ${optimized.specs.slice(0, 3).join(" | ")}${optimized.specs.length > 3 ? " ..." : ""}`);
      }

      if (dryRun) {
        console.log("Skipped Shopify update (dry run).");
      } else {
        await updateProduct(product, optimized);
        console.log("Updated in Shopify.");
      }

      if (optimizeImageAlt) {
        await optimizeImageAlts(product);
      }
    } catch (error) {
      console.error(`Failed for "${product.title}":`, error);
    }
  }

  console.log("\nDone.");
}

optimizeProducts().catch((error) => {
  console.error("Fatal script error:", error);
  process.exit(1);
});
