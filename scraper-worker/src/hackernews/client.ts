import type { CandidatePost } from "../types.js";

const SEARCH_URL = "https://hn.algolia.com/api/v1/search_by_date";

interface AlgoliaHit {
  objectID: string;
  title: string | null;
  story_text: string | null;
  created_at_i: number;
}

interface AlgoliaResponse {
  hits: AlgoliaHit[];
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

export async function fetchNewStories(limit = 30): Promise<CandidatePost[]> {
  const url = `${SEARCH_URL}?tags=ask_hn&hitsPerPage=${limit}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Hacker News request failed: ${response.status}`);
  }

  const data = (await response.json()) as AlgoliaResponse;

  return data.hits.map((hit) => ({
    id: `hn_${hit.objectID}`,
    title: hit.title ?? "",
    selftext: stripHtml(hit.story_text ?? ""),
    subreddit: "HackerNews",
    url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
    createdUtc: hit.created_at_i,
  }));
}
