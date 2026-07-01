import { NextResponse } from "next/server";
import { importAgentFromRepo } from "@/lib/repo-import";
import { createAgent } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      repoUrl?: string;
      preview?: boolean;
    };

    if (!body.repoUrl?.trim()) {
      return NextResponse.json(
        { error: "repoUrl is required" },
        { status: 400 },
      );
    }

    const input = await importAgentFromRepo(body.repoUrl);

    if (body.preview) {
      return NextResponse.json(input);
    }

    const agent = await createAgent(input);
    return NextResponse.json(agent, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Import failed" },
      { status: 400 },
    );
  }
}
