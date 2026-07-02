CREATE TABLE seen_posts (
    id SERIAL PRIMARY KEY,
    reddit_post_id TEXT NOT NULL UNIQUE,
    thread_url TEXT NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
