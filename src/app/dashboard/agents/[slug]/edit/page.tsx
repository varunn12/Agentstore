import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { AgentEditor } from "@/components/dashboard/agent-editor";
import { getAgentBySlug } from "@/lib/store";

export default async function EditAgentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);
  if (!agent) notFound();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="mb-8 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Edit {agent.name}
        </h1>
        <AgentEditor agent={agent} mode="edit" />
      </main>
    </>
  );
}
