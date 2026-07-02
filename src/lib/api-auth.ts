import { timingSafeEqual } from "crypto";

function extractApiKey(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7).trim();
  }
  const headerKey = request.headers.get("x-agentstore-api-key");
  return headerKey?.trim() ?? null;
}

function keysMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function isCIApiConfigured(): boolean {
  return Boolean(process.env.AGENTSTORE_API_KEY?.trim());
}

export function verifyCIApiKey(request: Request): boolean {
  const expected = process.env.AGENTSTORE_API_KEY?.trim();
  if (!expected) return false;

  const provided = extractApiKey(request);
  if (!provided) return false;

  return keysMatch(provided, expected);
}

export function unauthorizedCIResponse(): Response {
  return Response.json(
    {
      error:
        "Unauthorized. Set AGENTSTORE_API_KEY on the server and send Authorization: Bearer <key>.",
    },
    { status: 401 },
  );
}
