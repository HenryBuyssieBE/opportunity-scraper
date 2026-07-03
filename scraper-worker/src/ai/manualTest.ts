import { config } from "dotenv";
import { filterPost, analyzePost } from "./index.js";
import { mockPosts } from "../jobs/mockPosts.js";

// .env lives at the repo root, one level up from scraper-worker/
config({ path: "../.env" });

for (const post of mockPosts) {
  const stage1 = await filterPost(post);
  console.log(`[${post.id}] is_signal=${stage1.is_signal} reason="${stage1.reason}"`);

  if (!stage1.is_signal) {
    continue;
  }

  const opportunity = await analyzePost(post);
  console.log(`  -> ${opportunity.title} (overall score: ${opportunity.score.overall})`);
}
