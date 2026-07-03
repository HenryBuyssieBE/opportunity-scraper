import { RunNowButton } from "./RunNowButton";
import { RunMockButton } from "./RunMockButton";

function timeAgo(dateString: string | undefined): string {
  if (!dateString) {
    return "never";
  }
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(dateString).getTime()) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function Header({ count, lastUpdated }: { count: number; lastUpdated?: string }) {
  return (
    <div className="mb-6 flex items-start justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg">
          🔍
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-white">Henry · Opportunity Feed</h1>
            <span className="rounded-full bg-purple-600 px-2 py-0.5 text-xs font-semibold text-white">
              {count}
            </span>
          </div>
          <p className="text-sm text-gray-400">Autonomous scout · powered by Claude</p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-green-400">LIVE</span>
          <span>· scans every 6h</span>
        </div>
        <div className="text-xs text-gray-500">
          Updated {timeAgo(lastUpdated)} · auto-refresh 30s
        </div>
        <div className="flex gap-2">
          <RunNowButton />
          <RunMockButton />
        </div>
      </div>
    </div>
  );
}
