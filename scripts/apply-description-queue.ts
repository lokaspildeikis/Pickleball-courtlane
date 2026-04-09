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
const dryRun = !process.argv.includes("--live");
const onlyApproved = (process.env.DESCRIPTION_QUEUE_ONLY_APPROVED || "true").toLowerCase() === "true";

if (!domain || !(adminToken || (clientId && clientSecret))) {
  console.error("Missing required .env variables:");
  if (!domain) console.error("- VITE_SHOPIFY_STORE_DOMAIN");
  if (!(adminToken || (clientId && clientSecret))) {
    console.error("- SHOPIFY_ADMIN_ACCESS_TOKEN (or SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET)");
  }
  process.exit(1);
}

type ReviewStatus = "needs-review" | "approved" | "skip";

type QueueRow = {
  id: number;
  handle: string;
  title: string;
  type: string;
  originalBodyHtml: string;
  proposedBodyHtml: string;
  reviewStatus?: ReviewStatus;
};

function normalizeReviewStatus(value: string | undefined): ReviewStatus {
  const normalized = (value || "needs-review").trim().toLowerCase();
  if (normalized === "approved") return "approved";
  if (normalized === "skip") return "skip";
  return "needs-review";
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

async function loadQueueRows(): Promise<QueueRow[]> {
  const jsonPath = path.resolve(__dirname, "../src/tmp/description-rewrite-queue.json");
  const raw = await fs.readFile(jsonPath, "utf8");
  const parsed = JSON.parse(raw) as QueueRow[];
  return parsed.map((row) => ({
    ...row,
    reviewStatus: normalizeReviewStatus(row.reviewStatus),
  }));
}

async function updateProductBodyHtml(id: number, bodyHtml: string) {
  const token = await getShopifyToken();
  const url = `https://${domain}/admin/api/2024-01/products/${id}.json`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product: {
        id,
        body_html: bodyHtml,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Shopify update failed (${response.status}): ${err}`);
  }
}

async function run() {
  console.log("--- Apply Description Queue ---");
  console.log(`Store: ${domain}`);
  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`Only approved: ${onlyApproved ? "yes" : "no"}`);

  const rows = await loadQueueRows();
  if (!rows.length) {
    console.log("Queue is empty. Generate queue first with npm run descriptions:queue.");
    return;
  }

  const candidates = rows.filter((row) => {
    if (row.reviewStatus === "skip") return false;
    if (!row.proposedBodyHtml?.trim()) return false;
    if (onlyApproved) return row.reviewStatus === "approved";
    return true;
  });

  console.log(`Queue rows: ${rows.length}`);
  console.log(`Rows to apply: ${candidates.length}`);

  if (!candidates.length) {
    console.log("No rows eligible for apply. Mark rows as approved or disable only-approved mode.");
    return;
  }

  for (const [index, row] of candidates.entries()) {
    const label = `[${index + 1}/${candidates.length}] ${row.title} (${row.handle})`;
    try {
      if (dryRun) {
        console.log(`${label} -> dry run, no Shopify write.`);
        continue;
      }
      await updateProductBodyHtml(row.id, row.proposedBodyHtml);
      console.log(`${label} -> updated.`);
    } catch (error) {
      console.error(`${label} -> failed`, error);
    }
  }

  console.log("Done.");
}

run().catch((error) => {
  console.error("Fatal script error:", error);
  process.exit(1);
});

