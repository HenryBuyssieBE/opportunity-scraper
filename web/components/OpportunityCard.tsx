import type { OpportunityRow } from "../lib/types";
import { ArchiveButton } from "./ArchiveButton";

function scoreColor(score: number): string {
  if (score >= 8) return "bg-red-950 text-red-400";
  if (score >= 5) return "bg-yellow-950 text-yellow-400";
  return "bg-gray-800 text-gray-400";
}

function formatDate(dateString: string): string {
  return new Date(dateString).toISOString().slice(0, 10);
}

export function OpportunityCard({ opportunity }: { opportunity: OpportunityRow }) {
  return (
    <div className="mb-4 rounded-lg border-l-4 border-red-500 bg-gray-900/60 p-5">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">{opportunity.title}</h2>
          <p className="text-xs text-gray-500">{formatDate(opportunity.posted_at)}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`whitespace-nowrap rounded-full px-3 py-1 text-sm font-semibold ${scoreColor(
              opportunity.score_overall
            )}`}
          >
            🔥 {opportunity.score_overall}/10
          </span>
          <ArchiveButton id={opportunity.id} />
        </div>
      </div>

      <div className="mb-3">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">The Signal</p>
        <p className="mb-1 italic text-gray-300">&ldquo;{opportunity.signal}&rdquo;</p>
        <a
          href={opportunity.source_url}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-cyan-400 hover:underline"
        >
          ↗ View the source thread
        </a>
      </div>

      <div className="mb-3">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Why Henry Wins</p>
        <p className="text-sm text-gray-300">{opportunity.why_henry_wins}</p>
      </div>

      <div className="mb-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">First Move This Week</p>
        <p className="text-sm text-gray-300">{opportunity.first_move_this_week}</p>
      </div>

      <div className="grid grid-cols-4 gap-2 border-t border-gray-800 pt-3 text-center text-xs text-gray-500">
        <div>
          <div className="text-sm font-semibold text-gray-300">{opportunity.score_demand_signal_strength}</div>
          Demand
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-300">{opportunity.score_buildability}</div>
          Buildability
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-300">{opportunity.score_competition_saturation}</div>
          Saturation
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-300">{opportunity.score_monetization_potential}</div>
          Monetization
        </div>
      </div>
    </div>
  );
}
