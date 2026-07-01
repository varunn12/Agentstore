import { Header } from "@/components/layout/header";
import { AddAgentClient } from "@/components/agents/add-agent-client";

export default function AddAgentPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Add Agent
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Import from a public GitHub repo or fill in details manually.
        </p>
        <div className="mt-8">
          <AddAgentClient />
        </div>
      </main>
    </>
  );
}
