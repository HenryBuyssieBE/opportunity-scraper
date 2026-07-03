import { config } from "dotenv";

// .env lives at the repo root, one level up from scraper-worker/
config({ path: "../.env" });

const { sendAlert } = await import("./alert.js");

await sendAlert({
  title: "Test Alert Opportunity",
  signal: "This is a manual test of the Twilio WhatsApp alert.",
  why_henry_wins: "N/A — test only",
  first_move_this_week: "N/A — test only",
  score: {
    overall: 9,
    demand_signal_strength: 9,
    buildability: 9,
    competition_saturation: 9,
    monetization_potential: 9,
  },
  source_url: "https://www.reddit.com/r/test/comments/test-alert-1/",
  subreddit: "test",
});

console.log("sendAlert() completed without throwing — check your WhatsApp.");
