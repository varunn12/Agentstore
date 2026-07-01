"use client";

import Link from "next/link";
import type { AgentSummary } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/agents/status-badge";
import { ProgressBar } from "@/components/ui/progress";
import { getScoreBarColor } from "@/lib/scoring";
import { CATEGORY_LABELS } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export function AgentCard({ agent }: { agent: AgentSummary }) {
  return (
    <Link href={`/agents/${agent.slug}`}>
      <Card hover className="h-full">
        <CardContent className="flex h-full flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{agent.icon}</span>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {agent.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  v{agent.version} · {CATEGORY_LABELS[agent.category]}
                </p>
              </div>
            </div>
            <StatusBadge status={agent.status} />
          </div>

          <p className="flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {agent.description}
          </p>

          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-zinc-500">Technical Score</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {agent.overallTechnicalScore}/100
                </span>
              </div>
              <ProgressBar
                value={agent.overallTechnicalScore}
                barClassName={getScoreBarColor(agent.overallTechnicalScore)}
              />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-zinc-500">Eval Pass Rate</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {agent.overallEvalPassRate}%
                </span>
              </div>
              <ProgressBar
                value={agent.overallEvalPassRate}
                barClassName={getScoreBarColor(agent.overallEvalPassRate)}
              />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-zinc-500">GTM Readiness</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {agent.gtmReadinessPercent}%
                </span>
              </div>
              <ProgressBar
                value={agent.gtmReadinessPercent}
                barClassName={getScoreBarColor(agent.gtmReadinessPercent)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
            <span className="text-xs text-zinc-500">{agent.team}</span>
            <span className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
              View details <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
