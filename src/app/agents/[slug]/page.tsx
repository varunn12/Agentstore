import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { getAgentBySlugEnriched } from "@/lib/store";
import { StatusBadge } from "@/components/agents/status-badge";
import { ScoreBadge } from "@/components/agents/score-badge";
import { TechScoreChart } from "@/components/agents/tech-score-chart";
import { EvalResultsTable } from "@/components/agents/eval-results-table";
import { GTMReadiness } from "@/components/agents/gtm-readiness";
import { OwnerRecommendations } from "@/components/agents/owner-recommendations";
import { SyncFromGitHubButton } from "@/components/agents/sync-from-github-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, formatDate } from "@/lib/utils";
import { ArrowLeft, User, Users, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = await getAgentBySlugEnriched(slug);
  if (!agent) notFound();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" /> Back to catalog
        </Link>

        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="text-5xl">{agent.icon}</span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  {agent.name}
                </h1>
                <StatusBadge status={agent.status} />
              </div>
              <p className="mt-1 text-zinc-500">
                v{agent.version} · {CATEGORY_LABELS[agent.category]}
              </p>
              <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
                {agent.longDescription}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {agent.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            <ScoreBadge score={agent.overallTechnicalScore} label="Technical" />
            <ScoreBadge score={agent.overallEvalPassRate} label="Evals" />
            <ScoreBadge score={agent.gtmReadinessPercent} label="GTM" />
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetaItem icon={<User className="h-4 w-4" />} label="Owner" value={agent.owner} />
          <MetaItem icon={<Users className="h-4 w-4" />} label="Team" value={agent.team} />
          <MetaItem label="Last Updated" value={formatDate(agent.updatedAt)} />
          {agent.repoUrl && (
            <MetaItem
              icon={<ExternalLink className="h-4 w-4" />}
              label="Repository"
              value={
                <a
                  href={agent.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  {agent.repoUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "")}
                </a>
              }
            />
          )}
        </div>

        {agent.repoUrl && (
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900/40">
            <SyncFromGitHubButton slug={agent.slug} repoUrl={agent.repoUrl} />
            <Link
              href={`/dashboard/agents/${agent.slug}/edit`}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Edit scores & evals in Dashboard →
            </Link>
          </div>
        )}

        <section className="mb-8">
          <OwnerRecommendations
            agent={agent}
            editHref={`/dashboard/agents/${agent.slug}/edit`}
          />
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Technical Score Breakdown
            </h2>
            <Card>
              <CardContent className="pt-5">
                <TechScoreChart scores={agent.technicalScores} />
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              GTM & Launch Readiness
            </h2>
            <GTMReadiness gtm={agent.gtm} readinessPercent={agent.gtmReadinessPercent} />
          </section>
        </div>

        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Evaluation Results
          </h2>
          <EvalResultsTable suites={agent.evalSuites} />
        </section>

        {!agent.repoUrl && (
          <div className="mt-8 text-center">
            <Link
              href={`/dashboard/agents/${agent.slug}/edit`}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Edit scores & evals in Dashboard →
            </Link>
          </div>
        )}
      </main>
    </>
  );
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        {icon && <span className="text-zinc-400">{icon}</span>}
        <div>
          <p className="text-xs text-zinc-500">{label}</p>
          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
