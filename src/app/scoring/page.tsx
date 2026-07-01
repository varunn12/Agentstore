import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import {
  SCORE_GRADES,
  TECH_SCORE_DESCRIPTIONS,
  TECH_SCORE_LABELS,
  TECH_WEIGHTS,
} from "@/lib/scoring";
import type { TechnicalScores } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Calculator, CheckCircle, Gauge, Rocket } from "lucide-react";

const EXAMPLE_SCORES: TechnicalScores = {
  reliability: 85,
  latency: 78,
  toolUse: 90,
  safety: 82,
  maintainability: 75,
  documentation: 70,
};

const EXAMPLE_OVERALL = Object.entries(TECH_WEIGHTS).reduce(
  (sum, [key, weight]) =>
    sum + EXAMPLE_SCORES[key as keyof TechnicalScores] * weight,
  0,
);

export const metadata = {
  title: "Scoring Methodology — Agent Store",
  description:
    "How technical scores, eval pass rates, and GTM readiness are calculated for agents.",
};

export default function ScoringPage() {
  const techDimensions = Object.keys(TECH_WEIGHTS) as (keyof TechnicalScores)[];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <section className="mb-10">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            How Agent Scoring Works
          </h1>
          <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
            Every agent in the catalog is rated across three dimensions: technical
            quality, evaluation results, and go-to-market readiness. Scores are
            computed automatically from the data you enter in the dashboard.
          </p>
        </section>

        <section className="mb-10 grid gap-4 sm:grid-cols-3">
          <OverviewCard
            icon={<Gauge className="h-5 w-5 text-indigo-600" />}
            title="Technical Score"
            description="Weighted average of six engineering dimensions (0–100)."
          />
          <OverviewCard
            icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
            title="Eval Pass Rate"
            description="Percentage of eval cases passed across all suites."
          />
          <OverviewCard
            icon={<Rocket className="h-5 w-5 text-amber-600" />}
            title="GTM Readiness"
            description="Percentage of launch checklist items completed."
          />
        </section>

        <section className="mb-10 space-y-6">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Technical Score
            </h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Weighted formula</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                The overall technical score is a weighted average of six
                sub-scores, each rated 0–100. The result is rounded to the
                nearest integer.
              </p>
              <div className="rounded-lg bg-zinc-50 px-4 py-3 font-mono text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                overall = round(Σ dimension × weight)
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-left dark:border-zinc-700">
                      <th className="pb-2 pr-4 font-medium text-zinc-500">Dimension</th>
                      <th className="pb-2 pr-4 font-medium text-zinc-500">Weight</th>
                      <th className="pb-2 font-medium text-zinc-500">What it measures</th>
                    </tr>
                  </thead>
                  <tbody>
                    {techDimensions.map((key) => (
                      <tr
                        key={key}
                        className="border-b border-zinc-100 dark:border-zinc-800"
                      >
                        <td className="py-3 pr-4 font-medium text-zinc-900 dark:text-zinc-100">
                          {TECH_SCORE_LABELS[key]}
                        </td>
                        <td className="py-3 pr-4 text-zinc-600 dark:text-zinc-400">
                          {TECH_WEIGHTS[key] * 100}%
                        </td>
                        <td className="py-3 text-zinc-600 dark:text-zinc-400">
                          {TECH_SCORE_DESCRIPTIONS[key]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Worked example
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Suppose an agent has the sub-scores below. The overall technical
                score would be{" "}
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {Math.round(EXAMPLE_OVERALL)}/100
                </span>
                .
              </p>
              <div className="space-y-3">
                {techDimensions.map((key) => {
                  const value = EXAMPLE_SCORES[key];
                  const contribution = value * TECH_WEIGHTS[key];
                  return (
                    <div key={key}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {TECH_SCORE_LABELS[key]}{" "}
                          <span className="text-zinc-400">
                            ({value} × {TECH_WEIGHTS[key] * 100}% ={" "}
                            {contribution.toFixed(1)})
                          </span>
                        </span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {value}
                        </span>
                      </div>
                      <ProgressBar value={value} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-10 space-y-6">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Eval Pass Rate
            </h2>
          </div>

          <Card>
            <CardContent className="space-y-4 pt-5">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Eval pass rate aggregates results across all eval suites attached
                to an agent. Each suite tracks individual test cases with pass/fail
                outcomes.
              </p>
              <div className="rounded-lg bg-zinc-50 px-4 py-3 font-mono text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                pass rate = round(passed cases / total cases × 100)
              </div>
              <ul className="list-inside list-disc space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                <li>If an agent has no eval suites, the pass rate is 0%.</li>
                <li>
                  Per-suite pass rates are also shown on the agent detail page,
                  along with case-level latency and failure notes.
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="mb-10 space-y-6">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-amber-600" />
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              GTM Readiness
            </h2>
          </div>

          <Card>
            <CardContent className="space-y-4 pt-5">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                GTM readiness tracks how prepared an agent is for launch. It is
                based on a checklist of go-to-market items (pricing, docs,
                support runbooks, etc.) that you define per agent.
              </p>
              <div className="rounded-lg bg-zinc-50 px-4 py-3 font-mono text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                readiness = round(completed items / total items × 100)
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                If no checklist items exist, readiness is reported as 0%.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-10 space-y-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Letter Grades
          </h2>

          <Card>
            <CardContent className="pt-5">
              <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                All three scores use the same letter-grade scale in the UI:
              </p>
              <div className="grid gap-2 sm:grid-cols-5">
                {SCORE_GRADES.map(({ min, grade, color }) => (
                  <div
                    key={grade}
                    className="flex flex-col items-center rounded-lg border border-zinc-200 px-3 py-4 dark:border-zinc-700"
                  >
                    <span className={cn("text-2xl font-bold", color)}>
                      {grade}
                    </span>
                    <span className="mt-1 text-xs text-zinc-500">
                      {min === 0 ? "< 60" : `≥ ${min}`}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Where Scores Come From
          </h2>

          <Card>
            <CardContent className="space-y-4 pt-5">
              <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                <li>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    Dashboard edits —
                  </span>{" "}
                  Technical sub-scores and GTM checklists are set manually in the
                  dashboard when creating or editing an agent.
                </li>
                <li>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    GitHub import —
                  </span>{" "}
                  When importing from a repository, technical scores start at 70
                  across all dimensions and are adjusted based on manifest signals
                  (e.g. action count boosts tool use; load-test data boosts
                  latency and reliability).
                </li>
                <li>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    Eval suites —
                  </span>{" "}
                  Pass rates are derived from eval case results stored with each
                  agent. Update cases in the dashboard to reflect the latest test
                  runs.
                </li>
              </ul>
              <p className="text-sm text-zinc-500">
                Computed scores are recalculated on every page load via{" "}
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                  enrichAgent()
                </code>
                — they are not stored separately.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}

function OverviewCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 pt-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-800">
          {icon}
        </div>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
      </CardContent>
    </Card>
  );
}
