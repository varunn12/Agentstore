import { getAllAgentsEnriched } from "@/lib/store";
import { ComparePageClient } from "@/components/agents/compare-page-client";

export const dynamic = "force-dynamic";

export default async function ComparePage() {
  const agents = await getAllAgentsEnriched();
  return <ComparePageClient agents={agents} />;
}
