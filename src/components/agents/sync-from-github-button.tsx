"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GitBranch, Loader2 } from "lucide-react";

export function SyncFromGitHubButton({
  slug,
  repoUrl,
}: {
  slug: string;
  repoUrl: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSync() {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/agents/${slug}/sync`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Sync failed");
      }

      const applied = (data.applied as string[] | undefined)?.join(", ") ?? "profile";
      setMessage({
        type: "success",
        text: `Synced from GitHub — updated ${applied}.`,
      });
      router.refresh();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Sync failed",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={handleSync}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <GitBranch className="h-4 w-4" />
        )}
        Sync from GitHub
      </Button>
      <p className="max-w-xs text-xs text-zinc-500">
        Re-reads{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
          agent.manifest.json
        </code>{" "}
        from{" "}
        {repoUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "")}. Eval results
        are preserved.
      </p>
      {message && (
        <p
          className={
            message.type === "success"
              ? "text-xs text-emerald-600 dark:text-emerald-400"
              : "text-xs text-red-600 dark:text-red-400"
          }
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
