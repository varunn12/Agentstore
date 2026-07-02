import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STORE_DEFINITION } from "@/lib/store-definition";
import {
  Store,
  ArrowRight,
  Search,
  GitCompare,
  Rocket,
  Hammer,
} from "lucide-react";

const CAPABILITY_ICONS = {
  Discover: Search,
  Evaluate: GitCompare,
  Launch: Rocket,
  Build: Hammer,
} as const;

export const metadata = {
  title: "About — Agent Store",
  description: STORE_DEFINITION.summary,
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <section className="mb-10">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950">
            <Store className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            {STORE_DEFINITION.title}
          </h1>
          <p className="mt-2 text-lg font-medium text-indigo-600 dark:text-indigo-400">
            {STORE_DEFINITION.tagline}
          </p>
          <p className="mt-4 text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
            {STORE_DEFINITION.summary}
          </p>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            {STORE_DEFINITION.intro}
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Built like the marketplaces you already know
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="pt-5">
                <Badge variant="outline" className="mb-3">
                  AppExchange
                </Badge>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {STORE_DEFINITION.analogy.appExchange}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <Badge variant="outline" className="mb-3">
                  App Store
                </Badge>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {STORE_DEFINITION.analogy.appStore}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Domains we serve
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {STORE_DEFINITION.domains.map((domain) => (
              <Card key={domain.id}>
                <CardContent className="pt-5">
                  <Badge className="mb-3">{domain.acronym}</Badge>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {domain.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {domain.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            What you can do here
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {STORE_DEFINITION.capabilities.map((capability) => {
              const Icon =
                CAPABILITY_ICONS[
                  capability.title as keyof typeof CAPABILITY_ICONS
                ];
              return (
                <Card key={capability.title}>
                  <CardContent className="flex gap-4 pt-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-800">
                      <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {capability.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                        {capability.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section>
          <Card>
            <CardContent className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                  Explore the catalog
                </p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Browse agents across CPG, RTM, and RGM — or publish your own.
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
                  Publish an agent
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
