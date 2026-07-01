"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import {
  buildComparisonRowInsight,
  type ComparisonMetric,
} from "@/lib/comparison";
import { getScoreBarColor, TECH_SCORE_LABELS } from "@/lib/scoring";
import { CATEGORY_LABELS } from "@/lib/utils";
import type { AgentSummary, TechnicalScores } from "@/lib/types";

function CompareContent({ agents }: { agents: AgentSummary[] }) {
  const searchParams = useSearchParams();
  const slugs = searchParams.get("agents")?.split(",").filter(Boolean) ?? [];
  const selected = agents.filter((a) => slugs.includes(a.slug));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
        Compare Agents
      </h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-400">
        Select agents below to compare technical scores, eval pass rates, and GTM
        readiness. Every row includes the evidence behind each score.
      </p>

      <div className="mb-8 flex flex-wrap gap-2">
        {agents.map((a) => {
          const isSelected = slugs.includes(a.slug);
          const newSlugs = isSelected
            ? slugs.filter((s) => s !== a.slug)
            : [...slugs, a.slug];
          return (
            <Link
              key={a.slug}
              href={`/compare?agents=${newSlugs.join(",")}`}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                isSelected
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950 dark:text-indigo-300"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400"
              }`}
            >
              {a.icon} {a.name}
            </Link>
          );
        })}
      </div>

      {selected.length < 2 ? (
        <p className="py-12 text-center text-zinc-500">
          Select at least 2 agents to compare.
        </p>
      ) : (
        <div className="space-y-8">
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `200px repeat(${selected.length}, 1fr)`,
            }}
          >
            <div />
            {selected.map((a) => (
              <div key={a.slug} className="text-center">
                <span className="text-3xl">{a.icon}</span>
                <h3 className="mt-1 font-semibold">{a.name}</h3>
                <p className="text-xs text-zinc-500">
                  {CATEGORY_LABELS[a.category]}
                </p>
              </div>
            ))}
          </div>

          <CompareRow
            agents={selected}
            metric="overallTechnicalScore"
            label="Overall Technical Score"
            values={selected.map((a) => a.overallTechnicalScore)}
          />
          <CompareRow
            agents={selected}
            metric="overallEvalPassRate"
            label="Eval Pass Rate"
            values={selected.map((a) => a.overallEvalPassRate)}
          />
          <CompareRow
            agents={selected}
            metric="gtmReadinessPercent"
            label="GTM Readiness"
            values={selected.map((a) => a.gtmReadinessPercent)}
          />

          {(Object.keys(TECH_SCORE_LABELS) as (keyof TechnicalScores)[]).map(
            (key) => (
              <CompareRow
                key={key}
                agents={selected}
                metric={key}
                label={TECH_SCORE_LABELS[key]}
                values={selected.map((a) => a.technicalScores[key])}
              />
            ),
          )}
        </div>
      )}
    </main>
  );
}

function CompareRow({
  agents,
  metric,
  label,
  values,
}: {
  agents: AgentSummary[];
  metric: ComparisonMetric;
  label: string;
  values: number[];
}) {
  const insight = buildComparisonRowInsight(agents, metric, label, values);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${values.length}, 1fr)` }}
        >
          {insight.reasons.map((entry) => (
            <div key={entry.slug} className="text-center">
              <p className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {entry.value}
              </p>
              <ProgressBar
                value={entry.value}
                barClassName={getScoreBarColor(entry.value)}
              />
              <p className="mt-3 text-left text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                {entry.reason}
              </p>
            </div>
          ))}
        </div>
        <p className="rounded-lg bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            Comparison:{" "}
          </span>
          {insight.summary}
        </p>
      </CardContent>
    </Card>
  );
}

export function ComparePageClient({ agents }: { agents: AgentSummary[] }) {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <div className="p-8 text-center text-zinc-500">Loading...</div>
        }
      >
        <CompareContent agents={agents} />
      </Suspense>
    </>
  );
}
