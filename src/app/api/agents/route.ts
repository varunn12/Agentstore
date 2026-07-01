import { NextResponse } from "next/server";
import { createAgent, getAllAgentsEnriched } from "@/lib/store";
import type { CreateAgentInput } from "@/lib/types";

export async function GET() {
  return NextResponse.json(await getAllAgentsEnriched());
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateAgentInput;
    const agent = await createAgent(body);
    return NextResponse.json(agent, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create agent" },
      { status: 400 },
    );
  }
}
