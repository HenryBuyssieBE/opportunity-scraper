import type { CandidatePost } from "../types.js";

export const mockPosts: CandidatePost[] = [
  {
    id: "mock1",
    title: "Is there a tool that auto-generates SAP BTP integration docs from OQL?",
    selftext:
      "I keep writing the same integration documentation by hand for every SAP BTP project. Every time I finish an OQL query I have to manually write up what it does for the next dev. Feels like this should be automatable. Anyone know a tool for this?",
    subreddit: "SomebodyMakeThis",
    url: "https://www.reddit.com/r/SomebodyMakeThis/comments/mock1/",
    createdUtc: 1710000000,
  },
  {
    id: "mock2",
    title: "Just adopted a cat, any tips?",
    selftext: "First time cat owner, she's a rescue, any advice on the first week?",
    subreddit: "artificial",
    url: "https://www.reddit.com/r/artificial/comments/mock2/",
    createdUtc: 1710000100,
  },
  {
    id: "mock3",
    title: "Someone should build a Zapier alternative that's actually affordable for small businesses",
    selftext:
      "Zapier's pricing scales terribly once you have more than a handful of zaps. As a small business owner I just want simple automations between my invoicing tool and my CRM without paying $70/month.",
    subreddit: "Entrepreneur",
    url: "https://www.reddit.com/r/Entrepreneur/comments/mock3/",
    createdUtc: 1710000200,
  },
  {
    id: "hn_mock4",
    title: "Ask HN: Is there a good tool for turning support tickets into a searchable FAQ automatically?",
    selftext:
      "We get the same 20 questions over and over in our support inbox. I want something that reads closed tickets and auto-generates/updates a FAQ page, ideally with an LLM doing the summarizing. Everything I've found is either a full helpdesk suite or way overpriced for a 3-person team.",
    subreddit: "HackerNews",
    url: "https://news.ycombinator.com/item?id=mock4",
    createdUtc: 1710000300,
  },
];
