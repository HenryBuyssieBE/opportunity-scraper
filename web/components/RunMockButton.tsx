"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RunMockButton() {
  const [isRunning, setIsRunning] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setIsRunning(true);
    try {
      await fetch("/api/run-mock", { method: "POST" });
      router.refresh();
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isRunning}
      className="rounded-md border border-gray-700 px-3 py-1.5 text-sm font-medium text-gray-300 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isRunning ? "Starting…" : "Run with mock data"}
    </button>
  );
}
