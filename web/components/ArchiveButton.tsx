"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ArchiveButton({ id }: { id: number }) {
  const [isArchiving, setIsArchiving] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setIsArchiving(true);
    try {
      await fetch(`/api/opportunities/${id}/archive`, { method: "POST" });
      router.refresh();
    } finally {
      setIsArchiving(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isArchiving}
      className="rounded-md border border-gray-700 px-2 py-1 text-xs text-gray-400 hover:bg-gray-800 hover:text-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isArchiving ? "Archiving…" : "Archive"}
    </button>
  );
}
