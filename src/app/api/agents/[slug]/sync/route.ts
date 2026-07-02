import { NextResponse } from "next/server";
import { buildAgentUpdatesFromCIReport } from "@/lib/ci-report";
import { enrichAgent } from "@/lib/scoring";
import { getAgentBySlug, updateAgent } from "@/lib/store";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  if (!agent.repoUrl) {
    return NextResponse.json(
      {
        error:
          "No GitHub repository linked. Add a repo URL in the dashboard first.",
      },
      { status: 400 },
    );
  }

  try {
    const updates = await buildAgentUpdatesFromCIReport(agent, {
      syncManifest: true,
    });

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Nothing to update from the linked repository." },
        { status: 400 },
      );
    }

    const updated = await updateAgent(slug, updates);

    return NextResponse.json({
      ok: true,
      applied: Object.keys(updates),
      agent: enrichAgent(updated),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to sync from GitHub",
      },
      { status: 400 },
    );
  }
}
