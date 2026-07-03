import { config } from "dotenv";

// .env lives at the repo root, one level up from scraper-worker/
config({ path: "../.env" });

const { isSeen, markSeen, insertOpportunity, findRecentTitles, isDuplicateTitle } = await import("./index.js");
const { pool } = await import("./pool.js");

const testPostId = "test-manualTest-1";
const testUrl = "https://www.reddit.com/r/test/comments/test-manualTest-1/";

console.log("--- seenPosts ---");
console.log("isSeen before mark:", await isSeen(testPostId));
await markSeen(testPostId, testUrl);
console.log("isSeen after mark:", await isSeen(testPostId));

console.log("\n--- opportunities ---");
await insertOpportunity(
  {
    title: "Test Opportunity",
    signal: "People keep asking for a test tool",
    why_henry_wins: "Because this is a manual test",
    first_move_this_week: "Run this script",
    score: {
      overall: 7,
      demand_signal_strength: 6,
      buildability: 8,
      competition_saturation: 5,
      monetization_potential: 4,
    },
    source_url: testUrl,
    subreddit: "test",
  },
  {
    id: testPostId,
    title: "Someone should build a test tool",
    selftext: "body text",
    subreddit: "test",
    url: testUrl,
    createdUtc: Math.floor(Date.now() / 1000),
  }
);
const recentTitles = await findRecentTitles(5);
console.log("Recent titles:", recentTitles);

console.log("\n--- dedup ---");
console.log(
  "near-identical:",
  isDuplicateTitle("Someone should build a test tool", ["Someone should build a testing tool"])
);
console.log("unrelated:", isDuplicateTitle("Someone should build a test tool", ["Best pizza in Brussels"]));

await pool.end();
console.log("\nDone. Clean up test rows with:");
console.log(`  DELETE FROM seen_posts WHERE reddit_post_id = '${testPostId}';`);
console.log(`  DELETE FROM opportunities WHERE source_url = '${testUrl}';`);
