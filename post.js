const fs = require("fs");
const path = require("path");

// --- Config from environment ---
const PAGE_ID = process.env.FB_PAGE_ID;
const PAGE_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const PEXELS_KEY = process.env.PEXELS_API_KEY;

// --- Helpers ---

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildCaption(quote) {
  const templates = [
    `${quote}\n\n#DailyVerse #FaithAndCoffee #MorningGrace #DailyInspiration`,
    `${quote}\n\n#BibleVerse #MorningDevotion #CoffeeAndJesus #FaithWalk`,
    `${quote}\n\n#ScriptureOfTheDay #MorningBlessing #GraceAndCoffee #BlessedDay`,
    `${quote}\n\n#DailyStrength #InspirationalQuotes #DailyGrace #CoffeeLovers`,
  ];
  return pickRandom(templates);
}

async function getPexelsImage() {
  const queries = ["coffee beans", "coffee cup", "latte art", "coffee farm"];
  const query = pickRandom(queries);
  const page = Math.floor(Math.random() * 3) + 1; // pages 1-3

  console.log(`🔍 Searching Pexels for "${query}" (page ${page})...`);

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
}

async function postToFacebook(imageUrl, caption) {
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
  // Validate secrets
  if (!PAGE_ID || !PAGE_TOKEN || !PEXELS_KEY) {
    console.error("❌ Missing environment variables. Required:");
    console.error("   FB_PAGE_ID, FB_PAGE_ACCESS_TOKEN, PEXELS_API_KEY");
    process.exit(1);
  }

  // Load quotes
  const quotesPath = path.join(__dirname, "quotes.json");
  const quotes = JSON.parse(fs.readFileSync(quotesPath, "utf-8"));
  console.log(`📖 Loaded ${quotes.length} quotes.`);

  // Pick quote & build caption
  const quote = pickRandom(quotes);
  const caption = buildCaption(quote);
  console.log(`💬 Caption:\n${caption}\n`);

  // Get image from Pexels
  const imageUrl = await getPexelsImage();

  // Post to Facebook
  await postToFacebook(imageUrl, caption);

  console.log("🎉 Done!");
}

main().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
