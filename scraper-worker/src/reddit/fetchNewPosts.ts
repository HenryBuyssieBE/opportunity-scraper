import { redditGet } from "./authClient.js";
import { SUBREDDITS } from "./subreddits.js";
import type { RedditPost } from "./types.js";

interface RedditListingResponse {
  data: {
    children: Array<{
      data: {
        id: string;
        title: string;
        selftext: string;
        subreddit: string;
        permalink: string;
        created_utc: number;
      };
    }>;
  };
}

async function fetchNewPostsForSubreddit(subreddit: string, limit: number): Promise<RedditPost[]> {
  const response = (await redditGet(`/r/${subreddit}/new?limit=${limit}`)) as RedditListingResponse;

  return response.data.children.map(({ data }) => ({
    id: data.id,
    title: data.title,
    selftext: data.selftext,
    subreddit: data.subreddit,
    url: `https://www.reddit.com${data.permalink}`,
    createdUtc: data.created_utc,
  }));
}

export async function fetchNewPosts(limit = 25): Promise<RedditPost[]> {
  const results = await Promise.all(
    SUBREDDITS.map((subreddit) => fetchNewPostsForSubreddit(subreddit, limit))
  );
  return results.flat();
}
