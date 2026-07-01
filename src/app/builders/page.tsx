import Link from "next/link";
import { Header } from "@/components/layout/header";
import { BuilderScoreboard } from "@/components/builders/builder-scoreboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BUILDER_SCORE_WEIGHTS,
  computeBuilderScores,
} from "@/lib/builder-scoring";
import { getAllAgentsEnriched } from "@/lib/store";
import { Calculator } from "lucide-react";

export const metadata = {
  title: "Builder Scoreboard — Agent Store",
  description:
    "Top agent builders ranked by portfolio technical, eval, and GTM performance.",
};

export const dynamic = "force-dynamic";

export default async function BuildersPage() {
  const builders = computeBuilderScores(await getAllAgentsEnriched());

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <section className="mb-10">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Builder Scoreboard
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-zinc-600 dark:text-zinc-400">
            Builders are ranked by the quality of the agents they own. Scores
            roll up each builder&apos;s portfolio — technical quality, eval
            results, and GTM readiness — into a single leaderboard score.
          </p>
        </section>

        <div className="mb-10">
          <BuilderScoreboard builders={builders} title="Top Builders" />
        </div>

        <section className="mb-10">
          <div className="mb-6 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              How builder scores work
            </h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Portfolio formula</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Each builder&apos;s score is the average of their agents&apos;
                dimension scores, then combined with the same weighting used on
                the agent catalog cards.
              </p>
              <div className="rounded-lg bg-zinc-50 px-4 py-3 font-mono text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                builder score = round(technical × {BUILDER_SCORE_WEIGHTS.technical * 100}% + evals ×{" "}
                {BUILDER_SCORE_WEIGHTS.eval * 100}% + GTM × {BUILDER_SCORE_WEIGHTS.gtm * 100}%)
              </div>
              <ul className="list-inside list-disc space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                <li>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    Grouping —
                  </span>{" "}
                  Agents are grouped by the <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">owner</code> field set in the dashboard or GitHub import.
                </li>
                <li>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    Averages —
                  </span>{" "}
                  Technical, eval, and GTM sub-scores are averaged across all agents owned by that builder.
                </li>
                <li>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    Tie-breakers —
                  </span>{" "}
                  Higher overall score wins; ties break on agent count, then alphabetically by name.
                </li>
              </ul>
              <p className="text-sm text-zinc-500">
                For per-agent scoring details, see the{" "}
                <Link href="/scoring" className="text-indigo-600 hover:underline dark:text-indigo-400">
                  scoring methodology
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}
