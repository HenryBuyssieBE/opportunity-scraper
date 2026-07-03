export async function POST() {
  const workerUrl = process.env.SCRAPER_WORKER_URL;
  if (!workerUrl) {
    return Response.json({ error: "SCRAPER_WORKER_URL not configured" }, { status: 500 });
  }

  const response = await fetch(`${workerUrl}/run-now`, { method: "POST" });
  return Response.json(await response.json(), { status: response.status });
}
