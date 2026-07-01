"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CreateAgentInput } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch, Loader2, Sparkles } from "lucide-react";

export function RepoImportForm({
  onPreview,
}: {
  onPreview?: (input: CreateAgentInput) => void;
}) {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runImport(preview: boolean) {
    if (!repoUrl.trim()) {
      setError("Enter a GitHub repository URL");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/agents/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: repoUrl.trim(), preview }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");

      if (preview && onPreview) {
        onPreview(data as CreateAgentInput);
        return;
      }

      router.push(`/agents/${data.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Import from GitHub
        </CardTitle>
        <p className="text-sm text-zinc-500">
          Paste a public repo link. We read{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
            agent.manifest.json
          </code>{" "}
          and the README to pre-fill the agent profile.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            {error}
            {error.includes("Cannot access") && (
              <p className="mt-2 text-xs opacity-80">
                Put <code className="rounded bg-red-100 px-1 dark:bg-red-900">GITHUB_TOKEN</code> in{" "}
                <code className="rounded bg-red-100 px-1 dark:bg-red-900">.env.local</code> at the
                project root, then restart <code className="rounded bg-red-100 px-1 dark:bg-red-900">npm run dev</code>.
              </p>
            )}
            {error.includes("Token cannot read") && (
              <p className="mt-2 text-xs opacity-80">
                Your token must include read access to that specific repo. For fine-grained tokens,
                add the repository under &quot;Repository access&quot; with Contents: Read.
              </p>
            )}
          </div>
        )}
        <input
          type="url"
          placeholder="https://github.com/owner/repo"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={() => runImport(false)}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Import Agent
          </Button>
          {onPreview && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => runImport(true)}
              disabled={loading}
            >
              Preview in form
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
