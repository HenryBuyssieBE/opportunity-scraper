import { query } from "./db";
import type { OpportunityRow } from "./types";

export type SortOption = "score" | "date";

export interface GetOpportunitiesParams {
  sort?: SortOption;
  subreddit?: string;
}

const ORDER_BY: Record<SortOption, string> = {
  score: "score_overall DESC",
  date: "posted_at DESC",
};

export async function getOpportunities(params: GetOpportunitiesParams = {}): Promise<OpportunityRow[]> {
  const sort = params.sort ?? "score";
  const orderBy = ORDER_BY[sort];

  if (params.subreddit) {
    return query<OpportunityRow>(
      `SELECT * FROM opportunities WHERE subreddit = $1 AND archived_at IS NULL ORDER BY ${orderBy}`,
      [params.subreddit]
    );
  }

  return query<OpportunityRow>(
    `SELECT * FROM opportunities WHERE archived_at IS NULL ORDER BY ${orderBy}`
  );
}

export async function archiveOpportunity(id: number): Promise<void> {
  await query("UPDATE opportunities SET archived_at = now() WHERE id = $1", [id]);
}

export async function getSubreddits(): Promise<string[]> {
  const rows = await query<{ subreddit: string }>(
    "SELECT DISTINCT subreddit FROM opportunities ORDER BY subreddit"
  );
  return rows.map((row) => row.subreddit);
}
