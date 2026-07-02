import { config } from "dotenv";
import { fetchNewPosts } from "./index.js";

// .env lives at the repo root, one level up from scraper-worker/
config({ path: "../.env" });

const posts = await fetchNewPosts(5);
for (const post of posts) {
  console.log(`[${post.subreddit}] ${post.title}`);
  console.log(`  ${post.url}`);
}
console.log(`\nTotal: ${posts.length} posts`);
