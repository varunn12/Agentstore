import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AGENT_DEFINITION } from "@/lib/agent-definition";
import {
  Bot,
  MessageSquare,
  Wrench,
  Brain,
  Target,
  ArrowRight,
  XCircle,
  CheckCircle,
} from "lucide-react";

const PILLAR_ICONS = {
  conversational: MessageSquare,
  tools: Wrench,
  reasoning: Brain,
  "task-completion": Target,
} as const;

export const metadata = {
  title: "What is an Agent? — Agent Store",
  description: AGENT_DEFINITION.summary,
};

export default function WhatIsAnAgentPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <section className="mb-10">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950">
            <Bot className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            {AGENT_DEFINITION.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
            {AGENT_DEFINITION.summary}
          </p>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            {AGENT_DEFINITION.intro}
          </p>
        </section>

        <section className="mb-10 grid gap-4 sm:grid-cols-2">
          {AGENT_DEFINITION.pillars.map((pillar) => {
            const Icon = PILLAR_ICONS[pillar.id as keyof typeof PILLAR_ICONS];
            return (
              <Card key={pillar.id}>
                <CardContent className="pt-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-800">
                      <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <Badge variant={pillar.required ? "default" : "outline"}>
                      {pillar.required ? "Required" : "Optional"}
                    </Badge>
                  </div>
                  <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {pillar.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {pillar.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="mb-10 space-y-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            What counts — and what does not
          </h2>

          <Card>
            <CardHeader>
              <CardTitle>Boundary examples</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {AGENT_DEFINITION.boundaries.map((item) => {
                const isAgent = item.label === "Is an agent";
                return (
                  <div
                    key={item.example}
                    className="flex gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
                  >
                    {isAgent ? (
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-zinc-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {item.example}
                      </p>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {item.reason}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardContent className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                  Ready to catalog an agent?
                </p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Browse the catalog or add one from GitHub once it meets this
                  definition.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Browse catalog
                </Link>
                <Link
                  href="/agents/add"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                >
                  Add agent
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}
