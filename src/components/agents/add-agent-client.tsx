"use client";

import { useState } from "react";
import type { CreateAgentInput } from "@/lib/types";
import { RepoImportForm } from "@/components/agents/repo-import-form";
import { AgentEditor } from "@/components/dashboard/agent-editor";

export function AddAgentClient() {
  const [preview, setPreview] = useState<CreateAgentInput | null>(null);

  return (
    <div className="space-y-8">
      <RepoImportForm onPreview={setPreview} />
      <div>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Or add manually
        </h2>
        <AgentEditor mode="create" initial={preview ?? undefined} key={preview?.repoUrl ?? "manual"} />
      </div>
    </div>
  );
}
