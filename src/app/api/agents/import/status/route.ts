import { NextResponse } from "next/server";
import { getGitHubTokenLogin, getGitHubTokenStatuses } from "@/lib/repo-import";

export async function GET() {
  const tokens = await getGitHubTokenStatuses();

  if (tokens.length === 0) {
    return NextResponse.json({
      configured: false,
      message:
        "No tokens set. Add GITHUB_CLASSIC_TOKEN and/or GITHUB_TOKEN to .env.local",
    });
  }

  const login = await getGitHubTokenLogin();

  return NextResponse.json({
    configured: true,
    valid: tokens.some((t) => t.valid),
    login,
    tokens,
    message: login
      ? `Active as @${login} (tries classic token first, then fine-grained)`
      : "Tokens are set but none were accepted by GitHub",
  });
}
