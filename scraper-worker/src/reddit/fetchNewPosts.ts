import { redditGet, redditGetPublic, hasOAuthCredentials } from "./authClient.js";
import { SUBREDDITS } from "./subreddits.js";
import type { CandidatePost } from "../types.js";

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

async function fetchNewPostsForSubreddit(subreddit: string, limit: number): Promise<CandidatePost[]> {
  const path = `/r/${subreddit}/new`;
  const query = `?limit=${limit}`;

  const response = (hasOAuthCredentials()
    ? await redditGet(`${path}${query}`)
    : await redditGetPublic(`${path}.json${query}`)) as RedditListingResponse;

  return response.data.children.map(({ data }) => ({
    id: data.id,
    title: data.title,
    selftext: data.selftext,
    subreddit: data.subreddit,
    url: `https://www.reddit.com${data.permalink}`,
    createdUtc: data.created_utc,
  }));
}

export async function fetchNewPosts(limit = 25): Promise<CandidatePost[]> {
  const results = await Promise.all(
    SUBREDDITS.map((subreddit) => fetchNewPostsForSubreddit(subreddit, limit))
  );
  return results.flat();
}
