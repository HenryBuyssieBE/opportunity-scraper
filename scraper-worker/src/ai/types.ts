export interface Stage1Result {
  is_signal: boolean;
  reason: string;
}

export interface Opportunity {
  title: string;
  signal: string;
  why_henry_wins: string;
  first_move_this_week: string;
  score: {
    overall: number;
    demand_signal_strength: number;
    buildability: number;
    competition_saturation: number;
    monetization_potential: number;
  };
  source_url: string;
  subreddit: string;
}
