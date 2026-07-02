CREATE TABLE opportunities (
    id SERIAL PRIMARY KEY,

    -- retained post metadata (§4) — no full post/comment body ever stored
    source_url TEXT NOT NULL UNIQUE,
    subreddit TEXT NOT NULL,
    post_title TEXT NOT NULL,
    posted_at TIMESTAMPTZ NOT NULL,

    -- AI-generated fields (§5 Stage 2 output schema)
    title TEXT NOT NULL,
    signal TEXT NOT NULL,
    why_henry_wins TEXT NOT NULL,
    first_move_this_week TEXT NOT NULL,
    score_overall SMALLINT NOT NULL CHECK (score_overall BETWEEN 1 AND 10),
    score_demand_signal_strength SMALLINT NOT NULL CHECK (score_demand_signal_strength BETWEEN 1 AND 10),
    score_buildability SMALLINT NOT NULL CHECK (score_buildability BETWEEN 1 AND 10),
    score_competition_saturation SMALLINT NOT NULL CHECK (score_competition_saturation BETWEEN 1 AND 10),
    score_monetization_potential SMALLINT NOT NULL CHECK (score_monetization_potential BETWEEN 1 AND 10),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_opportunities_score_overall ON opportunities (score_overall DESC);
CREATE INDEX idx_opportunities_subreddit ON opportunities (subreddit);
