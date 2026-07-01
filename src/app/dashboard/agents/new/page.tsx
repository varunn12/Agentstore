import { Header } from "@/components/layout/header";
import { AddAgentClient } from "@/components/agents/add-agent-client";

export default function NewAgentPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Add New Agent
        </h1>
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">
          Import from GitHub or enter details manually.
        </p>
        <AddAgentClient />
      </main>
    </>
  );
}
