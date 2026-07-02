import { NextResponse } from "next/server";
import {
  isCIApiConfigured,
  unauthorizedCIResponse,
  verifyCIApiKey,
} from "@/lib/api-auth";
import { buildAgentUpdatesFromCIReport } from "@/lib/ci-report";
import { enrichAgent } from "@/lib/scoring";
import { getAgentBySlug, updateAgent } from "@/lib/store";
import type { CIReportInput } from "@/lib/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isCIApiConfigured()) {
    return NextResponse.json(
      {
        error:
          "CI reporting is not configured. Set AGENTSTORE_API_KEY in the Agent Store environment.",
      },
      { status: 503 },
    );
  }

  if (!verifyCIApiKey(request)) {
    return unauthorizedCIResponse();
  }

  const { slug } = await params;
  const agent = await getAgentBySlug(slug);
  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  try {
    const report = (await request.json()) as CIReportInput;

    if (
      !report.evalSuites?.length &&
      !report.technicalScores &&
      !report.scoreNotes &&
      !report.syncManifest &&
      !report.version
    ) {
      return NextResponse.json(
        {
          error:
            "No updates in payload. Send evalSuites, technicalScores, scoreNotes, syncManifest, and/or version.",
        },
        { status: 400 },
      );
    }

    const updates = await buildAgentUpdatesFromCIReport(agent, report);
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No applicable updates from CI report." },
        { status: 400 },
      );
    }

    const updated = await updateAgent(slug, updates);

    return NextResponse.json({
      ok: true,
      agent: enrichAgent(updated),
      applied: Object.keys(updates),
      metadata: report.metadata ?? null,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to apply CI report",
      },
      { status: 400 },
    );
  }
}
