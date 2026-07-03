import { query } from "./pool.js";
import type { OpportunityRow } from "./types.js";
import type { Opportunity } from "../ai/types.js";
import type { CandidatePost } from "../types.js";

export async function insertOpportunity(opportunity: Opportunity, post: CandidatePost): Promise<void> {
  await query(
    `INSERT INTO opportunities (
      source_url, subreddit, post_title, posted_at,
      title, signal, why_henry_wins, first_move_this_week,
      score_overall, score_demand_signal_strength, score_buildability,
      score_competition_saturation, score_monetization_potential
    ) VALUES ($1, $2, $3, to_timestamp($4), $5, $6, $7, $8, $9, $10, $11, $12, $13)
    ON CONFLICT (source_url) DO NOTHING`,
    [
      post.url,
      post.subreddit,
      post.title,
      post.createdUtc,
      opportunity.title,
      opportunity.signal,
      opportunity.why_henry_wins,
      opportunity.first_move_this_week,
      opportunity.score.overall,
      opportunity.score.demand_signal_strength,
      opportunity.score.buildability,
      opportunity.score.competition_saturation,
      opportunity.score.monetization_potential,
    ]
  );
}

export async function findRecentTitles(limit = 50): Promise<string[]> {
  const rows = await query<Pick<OpportunityRow, "title">>(
    "SELECT title FROM opportunities ORDER BY created_at DESC LIMIT $1",
    [limit]
  );
  return rows.map((row) => row.title);
}
