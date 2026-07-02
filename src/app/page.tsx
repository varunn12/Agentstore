import Link from "next/link";
import { Header } from "@/components/layout/header";
import { AgentCatalog } from "@/components/agents/agent-catalog";
import { BuilderScoreboard } from "@/components/builders/builder-scoreboard";
import { getAllAgentsEnriched, getStoreStats } from "@/lib/store";
import { getTopBuilders } from "@/lib/builder-scoring";
import { AGENT_DEFINITION } from "@/lib/agent-definition";
import { STORE_DEFINITION } from "@/lib/store-definition";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Rocket, Gauge, CheckCircle, Plus, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const agents = await getAllAgentsEnriched();
  const stats = await getStoreStats();
  const topBuilders = getTopBuilders(agents, 3);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <section className="mb-10">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Agent Store
          </h1>
          <p className="mt-2 text-lg font-medium text-indigo-600 dark:text-indigo-400">
            {STORE_DEFINITION.tagline}
          </p>
          <p className="mt-3 max-w-3xl text-lg text-zinc-600 dark:text-zinc-400">
            {STORE_DEFINITION.summary} Discover, evaluate, and launch agents with
            technical scores, eval pass rates, and GTM readiness in one place.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {STORE_DEFINITION.domains.map((domain) => (
              <Badge key={domain.id} variant="outline">
                {domain.acronym} — {domain.title}
              </Badge>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              About Agent Store
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/what-is-an-agent"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              {AGENT_DEFINITION.title}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Bot className="h-5 w-5 text-indigo-600" />}
            label="Total Agents"
            value={stats.totalAgents.toString()}
          />
          <StatCard
            icon={<Rocket className="h-5 w-5 text-emerald-600" />}
            label="Production Ready"
            value={stats.productionReady.toString()}
          />
          <StatCard
            icon={<Gauge className="h-5 w-5 text-amber-600" />}
            label="Avg Technical Score"
            value={`${stats.avgTechnicalScore}/100`}
          />
          <StatCard
            icon={<CheckCircle className="h-5 w-5 text-indigo-600" />}
            label="Avg Eval Pass Rate"
            value={`${stats.avgEvalPassRate}%`}
          />
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,1fr)] lg:items-start">
          <div className="min-w-0">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Agent Catalog
              </h2>
              <Link href="/agents/add">
                <Button variant="secondary" size="sm">
                  <Plus className="h-4 w-4" /> Add from GitHub
                </Button>
              </Link>
            </div>
            <AgentCatalog agents={agents} gridClassName="sm:grid-cols-2 xl:grid-cols-2" />
          </div>

          <aside className="min-w-0 lg:sticky lg:top-24">
            <BuilderScoreboard
              builders={topBuilders}
              layout="sidebar"
              showViewAll
            />
          </aside>
        </div>
      </main>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-800">
          {icon}
        </div>
        <div>
          <p className="text-sm text-zinc-500">{label}</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
