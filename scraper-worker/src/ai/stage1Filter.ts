import { anthropic } from "./client.js";
import type { RedditPost } from "../reddit/types.js";
import type { Stage1Result } from "./types.js";

const STAGE1_SCHEMA = {
  type: "object" as const,
  properties: {
    is_signal: { type: "boolean" as const },
    reason: { type: "string" as const },
  },
  required: ["is_signal", "reason"],
  additionalProperties: false,
};

const RUBRIC = `You are screening Reddit posts for signals of an unmet AI/automation product need — someone describing a problem, complaining about an existing tool, or explicitly saying "someone should build X".

Mark is_signal=false for: memes, unrelated discussion, posts with no business/product angle.
Mark is_signal=true for: pain points, feature requests, "does X exist?", complaints about existing tools, explicit "someone should build" posts.

Give a one-sentence reason for your decision.`;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export async function filterPost(post: RedditPost): Promise<Stage1Result> {
  const model = requireEnv("FILTER_MODEL");

  const response = await anthropic.messages.create({
    model,
    max_tokens: 256,
    system: RUBRIC,
    messages: [
      {
        role: "user",
        content: `Title: ${post.title}\n\nBody: ${post.selftext}`,
      },
    ],
    output_config: {
      format: {
        type: "json_schema",
        schema: STAGE1_SCHEMA,
      },
    },
  });

  if (response.stop_reason === "refusal") {
    throw new Error(`Stage 1 filter refused for post ${post.id}`);
  }

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error(`Stage 1 filter returned no text block for post ${post.id}`);
  }

  return JSON.parse(textBlock.text) as Stage1Result;
}
