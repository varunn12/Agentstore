import type { AgentCategory, CreateAgentInput, GTMInfo, TechnicalScores } from "./types";

interface AgentManifest {
  agent_id?: string;
  agent_version?: string;
  display_name?: string;
  description?: string;
  owner_squad?: string;
  tier?: string;
  actions?: Array<{ name: string; description?: string }>;
  capacity?: { load_tested_to_rps?: number | null; p95_latency_ms?: number };
}

interface GitHubRepo {
  description: string | null;
  topics?: string[];
  default_branch?: string;
}

export function normalizeGitHubRepoUrl(input: string): string | null {
  const trimmed = input.trim();
  const patterns = [
    /^https?:\/\/(?:www\.)?github\.com\/([^/\s?#]+)\/([^/\s?#.]+)/i,
    /^github\.com\/([^/\s?#]+)\/([^/\s?#.]+)/i,
    /^([^/\s]+)\/([^/\s]+)$/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) {
      const repo = match[2].replace(/\.git$/i, "");
      return `https://github.com/${match[1]}/${repo}`;
    }
  }
  return null;
}

function parseRepoParts(repoUrl: string): { owner: string; repo: string } {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/i);
  if (!match) throw new Error("Invalid GitHub repository URL");
  return { owner: match[1], repo: match[2] };
}

function sanitizeToken(raw: string): string {
  return raw.trim().replace(/^["']|["']$/g, "");
}

/** Classic first — better for collaborator/private repos across owners. */
export function getGitHubTokens(): string[] {
  const seen = new Set<string>();
  const tokens: string[] = [];

  for (const key of ["GITHUB_CLASSIC_TOKEN", "GITHUB_TOKEN"] as const) {
    const raw = process.env[key];
    if (!raw) continue;
    const token = sanitizeToken(raw);
    if (token && !seen.has(token)) {
      seen.add(token);
      tokens.push(token);
    }
  }

  return tokens;
}

function baseGitHubHeaders(): Record<string, string> {
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "AgentStore",
  };
}

function authHeadersForToken(token: string): Record<string, string> {
  return {
    ...baseGitHubHeaders(),
    Authorization: `Bearer ${token}`,
  };
}

export async function getGitHubTokenStatuses(): Promise<
  Array<{ label: string; valid: boolean; login: string | null }>
> {
  const entries: Array<{ label: string; token: string }> = [];
  if (process.env.GITHUB_CLASSIC_TOKEN?.trim()) {
    entries.push({ label: "classic", token: sanitizeToken(process.env.GITHUB_CLASSIC_TOKEN) });
  }
  if (process.env.GITHUB_TOKEN?.trim()) {
    entries.push({ label: "fine-grained", token: sanitizeToken(process.env.GITHUB_TOKEN) });
  }

  const results: Array<{ label: string; valid: boolean; login: string | null }> = [];
  for (const { label, token } of entries) {
    const { data, status } = await fetchGitHubJsonWithToken<{ login?: string }>(
      "https://api.github.com/user",
      token,
    );
    results.push({
      label,
      valid: status === 200 && !!data?.login,
      login: data?.login ?? null,
    });
  }
  return results;
}

export async function getGitHubTokenLogin(): Promise<string | null> {
  for (const token of getGitHubTokens()) {
    const { data, status } = await fetchGitHubJsonWithToken<{ login?: string }>(
      "https://api.github.com/user",
      token,
    );
    if (status === 200 && data?.login) return data.login;
  }
  return null;
}

async function fetchGitHubJsonWithToken<T>(
  url: string,
  token?: string,
): Promise<{ data: T | null; status: number; message?: string }> {
  const res = await fetch(url, {
    headers: token ? authHeadersForToken(token) : baseGitHubHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    let message: string | undefined;
    try {
      const body = (await res.json()) as { message?: string };
      message = body.message;
    } catch {
      message = undefined;
    }
    return { data: null, status: res.status, message };
  }
  return { data: (await res.json()) as T, status: res.status };
}

async function fetchGitHubJson<T>(
  url: string,
): Promise<{ data: T | null; status: number; message?: string }> {
  const tokens = getGitHubTokens();
  if (tokens.length === 0) {
    return fetchGitHubJsonWithToken<T>(url);
  }

  let last: { data: T | null; status: number; message?: string } = {
    data: null,
    status: 404,
  };

  for (const token of tokens) {
    const result = await fetchGitHubJsonWithToken<T>(url, token);
    if (result.status === 200 && result.data) return result;
    last = result;
  }

  return last;
}

async function fetchRawRepoFile(
  owner: string,
  repo: string,
  path: string,
  defaultBranch?: string,
): Promise<string | null> {
  const branches = [defaultBranch, "main", "master"].filter(
    (b): b is string => !!b,
  );
  const uniqueBranches = [...new Set(branches)];
  const tokens = getGitHubTokens();

  const tryFetch = async (token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    for (const branch of uniqueBranches) {
      const res = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`,
        { headers, cache: "no-store" },
      );
      if (res.ok) return res.text();
    }
    return null;
  };

  for (const token of tokens.length > 0 ? tokens : [undefined]) {
    const content = await tryFetch(token);
    if (content) return content;
  }

  return null;
}

async function fetchRepoFile(
  owner: string,
  repo: string,
  path: string,
  defaultBranch?: string,
): Promise<string | null> {
  const { data } = await fetchGitHubJson<{ content?: string; encoding?: string }>(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
  );
  if (data?.content && data.encoding === "base64") {
    return Buffer.from(data.content, "base64").toString("utf-8");
  }

  return fetchRawRepoFile(owner, repo, path, defaultBranch);
}

async function fetchRepoMeta(
  owner: string,
  repo: string,
): Promise<{ meta: GitHubRepo | null; status: number; message?: string }> {
  const { data, status, message } = await fetchGitHubJson<GitHubRepo>(
    `https://api.github.com/repos/${owner}/${repo}`,
  );
  if (data) return { meta: data, status };

  const readme = await fetchRepoFile(owner, repo, "README.md");
  if (!readme) return { meta: null, status, message };

  const firstLine = readme
    .split("\n")
    .find((line) => line.trim() && !line.startsWith("#"));
  return { meta: { description: firstLine?.trim() ?? null }, status };
}

function extractReadmeSummary(readme: string): string {
  const lines = readme
    .split("\n")
    .map((line) => line.trim())
    .filter(
      (line) =>
        line &&
        !line.startsWith("#") &&
        !line.startsWith("```") &&
        !line.startsWith("![") &&
        !line.startsWith("[!") &&
        !line.startsWith("---"),
    );
  return lines.slice(0, 4).join(" ").slice(0, 600);
}

function inferCategory(description: string): AgentCategory {
  const text = description.toLowerCase();
  if (text.includes("support") || text.includes("ticket")) return "customer-support";
  if (text.includes("sales") || text.includes("outbound")) return "sales";
  if (text.includes("code review") || text.includes("pull request"))
    return "engineering";
  if (text.includes("research") || text.includes("competitive"))
    return "research";
  if (
    text.includes("replenish") ||
    text.includes("outlet") ||
    text.includes("dedup") ||
    text.includes("distributor") ||
    text.includes("incident") ||
    text.includes("on-call")
  ) {
    return "ops";
  }
  return "internal";
}

function inferIcon(name: string, description: string): string {
  const text = `${name} ${description}`.toLowerCase();
  if (text.includes("replenish") || text.includes("order")) return "📦";
  if (text.includes("dedup") || text.includes("outlet")) return "🔍";
  if (text.includes("support")) return "🎧";
  if (text.includes("sales")) return "📈";
  if (text.includes("forecast")) return "📊";
  return "🤖";
}

function defaultScores(manifest: AgentManifest | null): TechnicalScores {
  const scores: TechnicalScores = {
    reliability: 70,
    latency: 70,
    toolUse: 70,
    safety: 70,
    maintainability: 70,
    documentation: 70,
  };

  const actionCount = manifest?.actions?.length ?? 0;
  if (actionCount >= 3) scores.toolUse = 82;
  if (actionCount >= 8) scores.toolUse = 90;
  if (actionCount >= 12) scores.toolUse = 92;

  if (manifest?.capacity?.load_tested_to_rps) {
    scores.latency = 90;
    scores.reliability = 85;
  }

  if (manifest?.tier === "M" || manifest?.tier === "L") {
    scores.maintainability = 80;
  }

  return scores;
}

function buildGtm(
  manifest: AgentManifest | null,
  description: string,
  useCases: string[],
): GTMInfo {
  const actionCount = manifest?.actions?.length ?? 0;
  return {
    tagline: manifest?.display_name
      ? `${manifest.display_name} for programmatic CPG operations`
      : "",
    valueProposition: description,
    targetAudience: ["Product teams", "Platform engineers", "GTM leads"],
    useCases,
    readinessChecklist: [
      { item: "Agent manifest published", completed: !!manifest },
      {
        item: `${actionCount} action(s) defined`,
        completed: actionCount > 0,
      },
      {
        item: "Load test verified",
        completed: !!manifest?.capacity?.load_tested_to_rps,
      },
      { item: "Product demo video recorded", completed: false },
      { item: "Sales one-pager published", completed: false },
      { item: "Customer case study", completed: false },
    ],
  };
}

export async function importAgentFromRepo(
  repoUrlInput: string,
): Promise<CreateAgentInput> {
  const repoUrl = normalizeGitHubRepoUrl(repoUrlInput);
  if (!repoUrl) {
    throw new Error(
      "Invalid GitHub URL. Use https://github.com/owner/repo or owner/repo",
    );
  }

  const { owner, repo } = parseRepoParts(repoUrl);

  const { meta: repoMeta, status, message } = await fetchRepoMeta(owner, repo);
  if (!repoMeta) {
    const hasToken = getGitHubTokens().length > 0;
    if (!hasToken) {
      throw new Error(
        `Cannot access ${owner}/${repo}. Add GITHUB_CLASSIC_TOKEN and/or GITHUB_TOKEN to .env.local at the project root and restart npm run dev.`,
      );
    }
    if (status === 401) {
      throw new Error(
        "GitHub token is invalid or expired. Generate a new token at github.com/settings/tokens.",
      );
    }

    const login = await getGitHubTokenLogin();
    const identity = login ? ` (authenticated as @${login})` : "";

    if (message?.toLowerCase().includes("sso")) {
      throw new Error(
        `GitHub SSO authorization required${identity}. Open github.com/settings/tokens, find your token, and click "Configure SSO" → Authorize for the org that owns ${owner}/${repo}.`,
      );
    }

    throw new Error(
      `Neither token can read ${owner}/${repo}${identity}. Classic token needs repo scope. Fine-grained token needs this repo added under Repository access with Contents + Metadata read.`,
    );
  }

  const defaultBranch = repoMeta.default_branch;

  const [manifestRaw, readme] = await Promise.all([
    fetchRepoFile(owner, repo, "agent.manifest.json", defaultBranch),
    fetchRepoFile(owner, repo, "README.md", defaultBranch),
  ]);

  let manifest: AgentManifest | null = null;
  if (manifestRaw) {
    try {
      manifest = JSON.parse(manifestRaw) as AgentManifest;
    } catch {
      manifest = null;
    }
  }

  const name =
    manifest?.display_name ??
    repo.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const description =
    manifest?.description ??
    repoMeta.description ??
    `Agent imported from ${owner}/${repo}`;
  const longDescription = readme
    ? extractReadmeSummary(readme)
    : description;
  const version =
    manifest?.agent_version?.replace(/-scaffold$/i, "") ?? "0.1.0";
  const useCases =
    manifest?.actions
      ?.map((action) => action.description ?? action.name)
      .slice(0, 6) ?? [];

  const tags = [
    ...new Set(
      [
        ...(repoMeta.topics ?? []),
        manifest?.tier ? `tier-${manifest.tier}` : "",
        manifest?.agent_id,
        "github",
      ].filter(Boolean) as string[],
    ),
  ];

  return {
    slug: repo.toLowerCase(),
    name,
    description: description.slice(0, 280),
    longDescription,
    category: inferCategory(description),
    status: "draft",
    version,
    owner,
    team: manifest?.owner_squad ?? owner,
    tags,
    icon: inferIcon(name, description),
    repoUrl,
    technicalScores: defaultScores(manifest),
    evalSuites: [],
    gtm: buildGtm(manifest, description, useCases),
  };
}
