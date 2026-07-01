import { NextResponse } from "next/server";
import {
  deleteAgent,
  getAgentBySlugEnriched,
  updateAgent,
} from "@/lib/store";
import type { UpdateAgentInput } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const agent = await getAgentBySlugEnriched(slug);
  if (!agent) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(agent);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const body = (await request.json()) as UpdateAgentInput;
    const agent = await updateAgent(slug, body);
    return NextResponse.json(agent);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update agent" },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    await deleteAgent(slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete agent" },
      { status: 400 },
    );
  }
}
