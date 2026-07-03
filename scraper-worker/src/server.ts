import express from "express";
import { runScrape, runScrapeOverPosts, mockPosts } from "./jobs/index.js";

export function startServer(): void {
  const app = express();
  const port = Number(process.env.WORKER_PORT ?? 4000);

  app.post("/run-now", (_req, res) => {
    runScrape().catch((error) => console.error("Triggered scrape run failed:", error));
    res.status(202).json({ status: "started" });
  });

  app.post("/run-mock", (_req, res) => {
    runScrapeOverPosts(mockPosts).catch((error) => console.error("Triggered mock scrape run failed:", error));
    res.status(202).json({ status: "started" });
  });

  app.listen(port, () => {
    console.log(`Trigger server listening on port ${port}`);
  });
}
