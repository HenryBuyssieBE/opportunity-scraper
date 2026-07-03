"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RunNowButton() {
  const [isRunning, setIsRunning] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setIsRunning(true);
    try {
      await fetch("/api/run-now", { method: "POST" });
      router.refresh();
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isRunning}
      className="rounded-md bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isRunning ? "Starting…" : "Run scrape now"}
    </button>
  );
}
