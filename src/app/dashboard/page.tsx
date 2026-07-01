import Link from "next/link";
import { Header } from "@/components/layout/header";
import { getAllAgentsEnriched, getStoreStats } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/agents/status-badge";
import { ProgressBar } from "@/components/ui/progress";
import { getOwnerRecommendations } from "@/lib/recommendations";
import { getScoreBarColor } from "@/lib/scoring";
import type { AgentSummary } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const agents = await getAllAgentsEnriched();
  const stats = await getStoreStats();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              Team Dashboard
            </h1>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              Manage agents, update technical scores, and track GTM readiness.
            </p>
          </div>
          <Link href="/dashboard/agents/new">
            <Button>
              <Plus className="h-4 w-4" /> Add Agent
            </Button>
          </Link>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <MiniStat label="Total Agents" value={stats.totalAgents} />
          <MiniStat label="Production" value={stats.productionReady} />
          <MiniStat label="Avg Tech Score" value={stats.avgTechnicalScore} suffix="/100" />
          <MiniStat label="Avg GTM Ready" value={stats.avgGTMReadiness} suffix="%" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Agents — Score Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-left text-xs text-zinc-500 dark:border-zinc-800">
                    <th className="pb-3 pr-4 font-medium">Agent</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Technical</th>
                    <th className="pb-3 pr-4 font-medium">Evals</th>
                    <th className="pb-3 pr-4 font-medium">GTM</th>
                    <th className="pb-3 pr-4 font-medium">For owner</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((a) => (
                    <tr key={a.id} className="border-b border-zinc-50 dark:border-zinc-800/50">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-2">
                          <span>{a.icon}</span>
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-zinc-100">{a.name}</p>
                            <p className="text-xs text-zinc-500">{a.team}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="py-4 pr-4">
                        <ScoreCell value={a.overallTechnicalScore} />
                      </td>
                      <td className="py-4 pr-4">
                        <ScoreCell value={a.overallEvalPassRate} />
                      </td>
                      <td className="py-4 pr-4">
                        <ScoreCell value={a.gtmReadinessPercent} />
                      </td>
                      <td className="py-4 pr-4">
                        <OwnerRecCount agent={a} />
                      </td>
                      <td className="py-4">
                        <Link href={`/dashboard/agents/${a.slug}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

function MiniStat({
  label,
  value,
  suffix = "",
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {value}{suffix}
        </p>
      </CardContent>
    </Card>
  );
}

function ScoreCell({ value }: { value: number }) {
  return (
    <div className="w-24">
      <p className="mb-1 font-medium">{value}</p>
      <ProgressBar value={value} barClassName={getScoreBarColor(value)} />
    </div>
  );
}

function OwnerRecCount({ agent }: { agent: AgentSummary }) {
  const count = getOwnerRecommendations(agent).length;
  if (count === 0) {
    return <span className="text-xs text-emerald-600 dark:text-emerald-400">Clear</span>;
  }
  return (
    <Link
      href={`/agents/${agent.slug}`}
      className="text-xs font-medium text-amber-700 hover:underline dark:text-amber-400"
    >
      {count} item{count === 1 ? "" : "s"}
    </Link>
  );
}
