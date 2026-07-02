import Link from "next/link";
import type { BuilderSummary } from "@/lib/builder-scoring";
import { getBuilderInitials } from "@/lib/builder-scoring";
import { getScoreBarColor, getScoreGrade } from "@/lib/scoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Trophy, Medal, ArrowRight } from "lucide-react";

const RANK_STYLES = [
  {
    ring: "ring-amber-400/60",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    icon: Trophy,
  },
  {
    ring: "ring-zinc-300/80",
    badge: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    icon: Medal,
  },
  {
    ring: "ring-orange-300/70",
    badge: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
    icon: Medal,
  },
] as const;

export function BuilderScoreboard({
  builders,
  compact = false,
  layout = "default",
  title = "Top Builders",
  showViewAll = false,
}: {
  builders: BuilderSummary[];
  compact?: boolean;
  layout?: "default" | "sidebar";
  title?: string;
  showViewAll?: boolean;
}) {
  if (builders.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-zinc-500">
          No builders yet. Add agents with an owner to populate the scoreboard.
        </CardContent>
      </Card>
    );
  }

  return (
    <section>
      <div
        className={cn(
          "mb-4 flex items-center justify-between gap-2",
          layout === "sidebar" && "flex-col items-stretch",
        )}
      >
        <div>
          <h2
            className={cn(
              "font-semibold text-zinc-900 dark:text-zinc-50",
              layout === "sidebar" ? "text-base" : "text-xl",
            )}
          >
            {title}
          </h2>
          {!compact && layout !== "sidebar" && (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Ranked by portfolio score — average technical, eval, and GTM
              performance across each builder&apos;s agents.
            </p>
          )}
        </div>
        {showViewAll && (
          <Link
            href="/builders"
            className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div
        className={cn(
          "grid gap-4",
          layout === "sidebar"
            ? "grid-cols-1"
            : compact
              ? "lg:grid-cols-3"
              : "gap-6",
        )}
      >
        {builders.map((builder, index) => (
          <BuilderCard
            key={builder.owner}
            builder={builder}
            rank={index + 1}
            compact={compact || layout === "sidebar"}
            sidebar={layout === "sidebar"}
          />
        ))}
      </div>
    </section>
  );
}

function BuilderCard({
  builder,
  rank,
  compact,
  sidebar = false,
}: {
  builder: BuilderSummary;
  rank: number;
  compact: boolean;
  sidebar?: boolean;
}) {
  const grade = getScoreGrade(builder.overallScore);
  const rankStyle = RANK_STYLES[rank - 1];
  const RankIcon = rankStyle?.icon;

  if (sidebar) {
    return (
      <Card className={cn(rankStyle && "ring-2", rankStyle?.ring)}>
        <CardContent className="flex items-center gap-3 py-4">
          <div className="relative shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {getBuilderInitials(builder.owner)}
            </div>
            {rank <= 3 && RankIcon && (
              <span
                className={cn(
                  "absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full",
                  rankStyle.badge,
                )}
              >
                <RankIcon className="h-2.5 w-2.5" />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {builder.owner}
            </p>
            <p className="text-xs text-zinc-500">
              {builder.agentCount} agent{builder.agentCount === 1 ? "" : "s"}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className={cn("text-lg font-bold leading-none", grade.color)}>
              {builder.overallScore}
            </p>
            <p className="text-[10px] text-zinc-500">{grade.grade}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(rankStyle && "ring-2", rankStyle?.ring)}>
      <CardHeader className={compact ? "pb-3" : undefined}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {getBuilderInitials(builder.owner)}
              </div>
              {rank <= 3 && RankIcon && (
                <span
                  className={cn(
                    "absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full",
                    rankStyle.badge,
                  )}
                >
                  <RankIcon className="h-3 w-3" />
                </span>
              )}
            </div>
            <div>
              <CardTitle className="text-base">{builder.owner}</CardTitle>
              <p className="text-xs text-zinc-500">
                {builder.agentCount} agent{builder.agentCount === 1 ? "" : "s"}
                {builder.productionCount > 0 &&
                  ` · ${builder.productionCount} in production`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={cn("text-2xl font-bold", grade.color)}>
              {builder.overallScore}
            </p>
            <p className="text-xs text-zinc-500">Grade {grade.grade}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScoreRow label="Technical" value={builder.avgTechnicalScore} />
        <ScoreRow label="Evals" value={builder.avgEvalPassRate} />
        <ScoreRow label="GTM" value={builder.avgGtmReadiness} />

        {!compact && (
          <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Portfolio
            </p>
            <div className="space-y-2">
              {builder.agents.map((agent) => (
                <Link
                  key={agent.slug}
                  href={`/agents/${agent.slug}`}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                >
                  <span className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <span>{agent.icon}</span>
                    {agent.name}
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {agent.overallScore}
                  </span>
                </Link>
              ))}
            </div>
            {builder.teams.length > 0 && (
              <p className="mt-3 text-xs text-zinc-500">
                Teams: {builder.teams.join(", ")}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {value}
        </span>
      </div>
      <ProgressBar value={value} barClassName={getScoreBarColor(value)} />
    </div>
  );
}
