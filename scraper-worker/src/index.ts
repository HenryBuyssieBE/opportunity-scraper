import { config } from "dotenv";

// .env lives at the repo root, one level up from scraper-worker/
config({ path: "../.env" });

// Dynamic imports so dotenv finishes loading before any module reads process.env
// at import time (e.g. src/db/pool.ts building its connection string).
const cron = (await import("node-cron")).default;
const { runScrape } = await import("./jobs/index.js");

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

const schedule = requireEnv("SCRAPE_CRON_SCHEDULE");

cron.schedule(schedule, () => {
  runScrape().catch((error) => console.error("Scheduled scrape run failed:", error));
});

console.log(`Scraper worker started. Cron schedule: ${schedule}`);

runScrape().catch((error) => console.error("Initial scrape run failed:", error));
