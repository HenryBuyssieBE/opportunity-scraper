import { anthropic } from "./client.js";
import { getProfile } from "./profile.js";
import type { CandidatePost } from "../types.js";
import type { Opportunity } from "./types.js";

const SCORE_FIELD = { type: "integer" as const };

const STAGE2_SCHEMA = {
  type: "object" as const,
  properties: {
    title: { type: "string" as const },
    signal: { type: "string" as const },
    why_henry_wins: { type: "string" as const },
    first_move_this_week: { type: "string" as const },
    score: {
      type: "object" as const,
      properties: {
        overall: SCORE_FIELD,
        demand_signal_strength: SCORE_FIELD,
        buildability: SCORE_FIELD,
        competition_saturation: SCORE_FIELD,
        monetization_potential: SCORE_FIELD,
      },
      required: [
        "overall",
        "demand_signal_strength",
        "buildability",
        "competition_saturation",
        "monetization_potential",
      ],
      additionalProperties: false,
    },
    source_url: { type: "string" as const },
    subreddit: { type: "string" as const },
  },
  required: [
    "title",
    "signal",
    "why_henry_wins",
    "first_move_this_week",
    "score",
    "source_url",
    "subreddit",
  ],
  additionalProperties: false,
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function buildSystemPrompt(): string {
  return `You analyze a Reddit post that has already been flagged as a signal of an unmet AI/automation product need, and turn it into a concrete opportunity for Henry.

Henry's profile (skills, constraints, goals) — use this to judge "why Henry wins" and buildability:
${getProfile()}

Output a catchy product title, the verbatim or lightly-paraphrased pain point as "signal", why Henry specifically is positioned to build it, and a concrete first move he could ship this week to test it.

Score each field as an integer from 1 to 10 (inclusive):
- overall: composite opportunity score
- demand_signal_strength: how strong/explicit is the demand signal in the post
- buildability: how feasible for a solo builder in ≤1 week, given Henry's skills
- competition_saturation: 10 = wide open, 1 = saturated with existing solutions
- monetization_potential: how plausible is it to charge Belgian SMEs for this`;
}

function assertScoreInRange(value: number, field: string): void {
  if (!Number.isInteger(value) || value < 1 || value > 10) {
    throw new Error(`Stage 2 score.${field} out of range: ${value}`);
  }
}

export async function analyzePost(post: CandidatePost): Promise<Opportunity> {
  const model = requireEnv("ANALYSIS_MODEL");

  const response = await anthropic.messages.create({
    model,
    max_tokens: 2048,
    system: buildSystemPrompt(),
    messages: [
      {
        role: "user",
        content: `Subreddit: ${post.subreddit}\nSource URL: ${post.url}\nTitle: ${post.title}\n\nBody: ${post.selftext}`,
      },
    ],
    output_config: {
      format: {
        type: "json_schema",
        schema: STAGE2_SCHEMA,
      },
    },
  });

  if (response.stop_reason === "refusal") {
    throw new Error(`Stage 2 analysis refused for post ${post.id}`);
  }

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error(`Stage 2 analysis returned no text block for post ${post.id}`);
  }

  const opportunity = JSON.parse(textBlock.text) as Opportunity;

  for (const [field, value] of Object.entries(opportunity.score)) {
    assertScoreInRange(value, field);
  }

  return opportunity;
}
