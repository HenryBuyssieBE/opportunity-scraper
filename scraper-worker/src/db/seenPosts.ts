import { query } from "./pool.js";
import type { SeenPostRow } from "./types.js";

export async function isSeen(redditPostId: string): Promise<boolean> {
  const rows = await query<SeenPostRow>(
    "SELECT id FROM seen_posts WHERE reddit_post_id = $1",
    [redditPostId]
  );
  return rows.length > 0;
}

export async function markSeen(redditPostId: string, threadUrl: string): Promise<void> {
  await query(
    "INSERT INTO seen_posts (reddit_post_id, thread_url) VALUES ($1, $2) ON CONFLICT (reddit_post_id) DO NOTHING",
    [redditPostId, threadUrl]
  );
}
