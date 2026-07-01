import Link from "next/link";
import type { Agent, AgentSummary } from "@/lib/types";
import {
  getOwnerRecommendations,
  type RecommendationArea,
  type RecommendationPriority,
} from "@/lib/recommendations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const AREA_LABELS: Record<RecommendationArea, string> = {
  technical: "Technical",
  evals: "Evals",
  gtm: "GTM",
  launch: "Launch",
};

const PRIORITY_STYLES: Record<RecommendationPriority, string> = {
  high: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40",
  medium: "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50",
  low: "border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900",
};

export function OwnerRecommendations({
  agent,
  editHref,
  compact = false,
}: {
  agent: Agent | AgentSummary;
  editHref?: string;
  compact?: boolean;
}) {
  const recommendations = getOwnerRecommendations(agent);

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-5">
          <Lightbulb className="h-5 w-5 text-emerald-500" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No open recommendations — this agent is in good shape across technical,
            eval, and GTM dimensions.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <p className="text-xs text-amber-700 dark:text-amber-400">
        {recommendations.length} recommendation
        {recommendations.length === 1 ? "" : "s"} for owner
      </p>
    );
  }

  return (
    <Card className="border-amber-200 dark:border-amber-900/60">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Recommendations for {agent.owner}
            </CardTitle>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Low scores highlight gaps to work on — not final judgments. Complete
              these items to improve the agent&apos;s standing in the catalog.
            </p>
          </div>
          {editHref && (
            <Link
              href={editHref}
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Update in dashboard <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className={cn(
              "rounded-lg border px-4 py-3",
              PRIORITY_STYLES[rec.priority],
            )}
          >
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {rec.title}
              </span>
              <Badge variant="outline">{AREA_LABELS[rec.area]}</Badge>
              {rec.priority === "high" && (
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                  High priority
                </Badge>
              )}
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {rec.description}
            </p>
            {rec.impact && (
              <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-500">
                Impact: {rec.impact}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
