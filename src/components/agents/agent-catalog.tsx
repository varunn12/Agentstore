"use client";

import { useMemo, useState } from "react";
import type { AgentSummary, AgentCategory, AgentStatus } from "@/lib/types";
import { AgentCard } from "@/components/agents/agent-card";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

export function AgentCatalog({
  agents,
  gridClassName = "sm:grid-cols-2 lg:grid-cols-3",
}: {
  agents: AgentSummary[];
  gridClassName?: string;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<AgentCategory | "all">("all");
  const [status, setStatus] = useState<AgentStatus | "all">("all");

  const filtered = useMemo(() => {
    return agents.filter((a) => {
      const matchesSearch =
        search === "" ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase()) ||
        a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = category === "all" || a.category === category;
      const matchesStatus = status === "all" || a.status === status;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [agents, search, category, status]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search agents, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-indigo-400"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as AgentCategory | "all")}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as AgentStatus | "all")}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-zinc-500">No agents match your filters.</p>
      ) : (
        <div className={cn("grid gap-6", gridClassName)}>
          {filtered.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
}
