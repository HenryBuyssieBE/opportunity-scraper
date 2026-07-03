export interface SeenPostRow {
  id: number;
  reddit_post_id: string;
  thread_url: string;
  processed_at: string;
}

export interface OpportunityRow {
  id: number;
  source_url: string;
  subreddit: string;
  post_title: string;
  posted_at: string;
  title: string;
  signal: string;
  why_henry_wins: string;
  first_move_this_week: string;
  score_overall: number;
  score_demand_signal_strength: number;
  score_buildability: number;
  score_competition_saturation: number;
  score_monetization_potential: number;
  created_at: string;
}
