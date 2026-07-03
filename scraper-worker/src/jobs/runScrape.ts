import { fetchNewPosts } from "../reddit/index.js";
import { fetchNewStories } from "../hackernews/index.js";
import { filterPost, analyzePost } from "../ai/index.js";
import { isSeen, markSeen, insertOpportunity, findRecentTitles, isDuplicateTitle } from "../db/index.js";
import { sendAlert } from "./alert.js";
import type { CandidatePost } from "../types.js";

const ALERT_THRESHOLD = 8;

async function processPost(post: CandidatePost): Promise<void> {
  if (await isSeen(post.id)) {
    return;
  }

  const stage1 = await filterPost(post);
  if (!stage1.is_signal) {
    console.log(`[skip] ${post.id} not a signal: ${stage1.reason}`);
    await markSeen(post.id, post.url);
    return;
  }

  const recentTitles = await findRecentTitles();
  if (isDuplicateTitle(post.title, recentTitles)) {
    console.log(`[skip] ${post.id} duplicate of a recent opportunity: ${post.title}`);
    await markSeen(post.id, post.url);
    return;
  }

  const opportunity = await analyzePost(post);
  await insertOpportunity(opportunity, post);
  await markSeen(post.id, post.url);
  console.log(`[stored] ${post.id} -> "${opportunity.title}" (score ${opportunity.score.overall}/10)`);

  if (opportunity.score.overall >= ALERT_THRESHOLD) {
    await sendAlert(opportunity);
  }
}

export async function runScrapeOverPosts(posts: CandidatePost[]): Promise<void> {
  console.log(`Processing ${posts.length} candidate posts.`);

  for (const post of posts) {
    try {
      await processPost(post);
    } catch (error) {
      console.error(`[error] failed to process post ${post.id}:`, error);
    }
  }

  console.log("Scrape run complete.");
}

function settledOrEmpty(result: PromiseSettledResult<CandidatePost[]>, sourceName: string): CandidatePost[] {
  if (result.status === "rejected") {
    console.error(`${sourceName} fetch failed:`, result.reason);
    return [];
  }
  return result.value;
}

export async function runScrape(): Promise<void> {
  console.log("Starting scrape run...");
  const [redditResult, hnResult] = await Promise.allSettled([fetchNewPosts(), fetchNewStories()]);
  const posts = [
    ...settledOrEmpty(redditResult, "Reddit"),
    ...settledOrEmpty(hnResult, "Hacker News"),
  ];
  await runScrapeOverPosts(posts);
}
