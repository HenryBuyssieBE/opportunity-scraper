"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { SortOption } from "../lib/opportunities";

export function FilterControls({ subreddits }: { subreddits: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sort = (searchParams.get("sort") as SortOption) ?? "score";
  const subreddit = searchParams.get("subreddit") ?? "";

  function updateParams(next: { sort?: string; subreddit?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="mb-4 flex items-center gap-3 text-sm">
      <div className="flex overflow-hidden rounded-md border border-gray-700">
        <button
          onClick={() => updateParams({ sort: "score" })}
          className={`px-3 py-1 ${sort === "score" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"}`}
        >
          Score
        </button>
        <button
          onClick={() => updateParams({ sort: "date" })}
          className={`px-3 py-1 ${sort === "date" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"}`}
        >
          Date
        </button>
      </div>

      <select
        value={subreddit}
        onChange={(e) => updateParams({ subreddit: e.target.value })}
        className="rounded-md border border-gray-700 bg-gray-900 px-2 py-1 text-gray-300"
      >
        <option value="">All subreddits</option>
        {subreddits.map((s) => (
          <option key={s} value={s}>
            r/{s}
          </option>
        ))}
      </select>
    </div>
  );
}
