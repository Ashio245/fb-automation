const fs = require("fs");
const path = require("path");

// --- Config from environment ---
const PAGE_ID = process.env.FB_PAGE_ID;
const PAGE_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const PEXELS_KEY = process.env.PEXELS_API_KEY;
const START_DATE = process.env.START_DATE || "2026-07-22";
const DRY_RUN = process.env.DRY_RUN === "true";

// --- Helpers ---

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getPostDay(totalDays) {
  if (process.env.POST_DAY) {
    const day = parseInt(process.env.POST_DAY, 10);
    if (!isNaN(day) && day >= 1 && day <= totalDays) {
      console.log(`📌 Using POST_DAY override: Day ${day}`);
      return day;
    }
  }

  const startDateStr = process.env.START_DATE || "2026-07-22";
  const startDateParts = startDateStr.split("-").map(Number);
  const startUtc = Date.UTC(startDateParts[0], startDateParts[1] - 1, startDateParts[2]);
  
  const now = new Date();
  const nowUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  const diffMs = nowUtc - startUtc;
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const dayIndex = diffDays % totalDays;
  const dayNumber = dayIndex + 1;

  console.log(`📅 Start Date: ${startDateStr} | Days Elapsed: ${diffDays} | Selected: Day ${dayNumber} of ${totalDays}`);
  return dayNumber;
}

function buildCaption(item) {
  const parts = [];
  if (item.hook) parts.push(item.hook);
  if (item.caption) parts.push(item.caption);
  if (item.cta) parts.push(item.cta);
  if (item.hashtags) parts.push(item.hashtags);
  return parts.join("\n\n");
}

function getPexelsQuery(item) {
  const text = `${item.pillar} ${item.visual}`.toLowerCase();
  if (text.includes("farm") || text.includes("cherry") || text.includes("hill") || text.includes("harvest")) return "coffee farm";
  if (text.includes("pour-over") || text.includes("moka") || text.includes("brew")) return "pour over coffee";
  if (text.includes("espresso") || text.includes("cup") || text.includes("mug")) return "coffee cup";
  if (text.includes("roast") || text.includes("bean")) return "coffee beans";
  if (text.includes("barista") || text.includes("cafe")) return "barista coffee";
  return "specialty coffee";
}

async function getPexelsImage(query) {
  const page = Math.floor(Math.random() * 3) + 1; // pages 1-3

  console.log(`🔍 Searching Pexels for "${query}" (page ${page})...`);

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&page=${page}`;
    const res = await fetch(url, {
      headers: { Authorization: PEXELS_KEY },
    });

    if (!res.ok) {
      throw new Error(`Pexels API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    if (!data.photos || data.photos.length === 0) {
      throw new Error("No photos found on Pexels for query: " + query);
    }

    const photo = pickRandom(data.photos);
    const imageUrl = photo.src.large;
    console.log(`📸 Picked image: ${imageUrl}`);
    return imageUrl;
  } catch (err) {
    if (DRY_RUN) {
      console.warn(`⚠️ Pexels fetch failed (${err.message}). Using placeholder for DRY RUN.`);
      const fallbackUrl = "https://images.pexels.com/photos/1695052/pexels-photo-1695052.jpeg";
      console.log(`📸 Picked image: ${fallbackUrl}`);
      return fallbackUrl;
    }
    throw err;
  }
}

async function postToFacebook(imageUrl, caption) {
  if (DRY_RUN) {
    console.log("🧪 DRY RUN enabled — skipping Facebook API request.");
    console.log("----------------------------------------");
    console.log(`Image URL: ${imageUrl}`);
    console.log("Caption:\n" + caption);
    console.log("----------------------------------------");
    return { id: "DRY_RUN_ID" };
  }

  console.log("📤 Posting to Facebook Page...");

  const url = `https://graph.facebook.com/v21.0/${PAGE_ID}/photos`;

  const params = new URLSearchParams({
    url: imageUrl,
    message: caption,
    access_token: PAGE_TOKEN,
  });

  const res = await fetch(url, {
    method: "POST",
    body: params,
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(
      `Facebook API error: ${data.error.message} (code ${data.error.code})`
    );
  }

  console.log(`✅ Posted! Photo ID: ${data.id}`);
  return data;
}

// --- Main ---

async function main() {
  // Validate secrets (skip FB secrets if DRY_RUN is active)
  if (!DRY_RUN && (!PAGE_ID || !PAGE_TOKEN)) {
    console.error("❌ Missing Facebook environment variables. Required:");
    console.error("   FB_PAGE_ID, FB_PAGE_ACCESS_TOKEN");
    process.exit(1);
  }
  if (!PEXELS_KEY) {
    console.error("❌ Missing environment variable: PEXELS_API_KEY");
    process.exit(1);
  }

  // Load calendar
  const calendarPath = path.join(__dirname, "calendar.json");
  if (!fs.existsSync(calendarPath)) {
    console.error("❌ calendar.json not found!");
    process.exit(1);
  }

  const calendar = JSON.parse(fs.readFileSync(calendarPath, "utf-8"));
  console.log(`📖 Loaded ${calendar.length} calendar posts.`);

  // Determine post day
  const dayNumber = getPostDay(calendar.length);
  const postItem = calendar.find((item) => item.day === dayNumber) || calendar[0];

  console.log(`\n📌 Day ${postItem.day} [${postItem.weekday}] — ${postItem.pillar}`);
  console.log(`🎨 Format: ${postItem.format}`);

  // Build full caption
  const caption = buildCaption(postItem);

  // Get image query & fetch image
  const pexelsQuery = getPexelsQuery(postItem);
  const imageUrl = await getPexelsImage(pexelsQuery);

  // Post to Facebook
  await postToFacebook(imageUrl, caption);

  console.log("🎉 Done!");
}

main().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
