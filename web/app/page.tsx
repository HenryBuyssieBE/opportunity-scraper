import { getOpportunities, getSubreddits, type SortOption } from "../lib/opportunities";
import { Header } from "../components/Header";
import { FilterControls } from "../components/FilterControls";
import { OpportunityCard } from "../components/OpportunityCard";
import { AutoRefresh } from "../components/AutoRefresh";

export const dynamic = "force-dynamic";

function parseSort(value: string | string[] | undefined): SortOption {
  return value === "date" ? "date" : "score";
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; subreddit?: string }>;
}) {
  const params = await searchParams;
  const sort = parseSort(params.sort);
  const subreddit = params.subreddit || undefined;

  const [opportunities, subreddits] = await Promise.all([
    getOpportunities({ sort, subreddit }),
    getSubreddits(),
  ]);

  const lastUpdated = opportunities[0]?.created_at;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <AutoRefresh />
      <Header count={opportunities.length} lastUpdated={lastUpdated} />
      <FilterControls subreddits={subreddits} />

      {opportunities.length === 0 ? (
        <p className="mt-12 text-center text-gray-500">No opportunities yet — run a scrape to get started.</p>
      ) : (
        opportunities.map((opportunity) => (
          <OpportunityCard key={opportunity.id} opportunity={opportunity} />
        ))
      )}
    </main>
  );
}
