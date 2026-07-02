import fs from "fs";
import path from "path";
import { buildAgentUpdatesFromRepoSync } from "../src/lib/ci-report";
import { enrichAgent } from "../src/lib/scoring";
import { getAllAgents, updateAgent } from "../src/lib/store";

function loadEnvLocal() {
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return;

  for (const line of fs.readFileSync(file, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

async function main() {
  const agents = await getAllAgents();
  const linked = agents.filter((agent) => agent.repoUrl);

  if (linked.length === 0) {
    console.log("No agents with linked repositories.");
    return;
  }

  console.log(`Syncing ${linked.length} agent(s) from GitHub...\n`);

  const results: Array<{
    slug: string;
    ok: boolean;
    error?: string;
    technicalScore?: number;
    gtmReadiness?: number;
  }> = [];

  for (const agent of linked) {
    try {
      const updates = await buildAgentUpdatesFromRepoSync(agent);
      const updated = await updateAgent(agent.slug, updates);
      const enriched = enrichAgent(updated);

      results.push({
        slug: agent.slug,
        ok: true,
        technicalScore: enriched.overallTechnicalScore,
        gtmReadiness: enriched.gtmReadinessPercent,
      });

      console.log(
        `✓ ${agent.slug} — tech ${enriched.overallTechnicalScore}/100, GTM ${enriched.gtmReadinessPercent}%`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      results.push({ slug: agent.slug, ok: false, error: message });
      console.log(`✗ ${agent.slug} — ${message}`);
    }
  }

  const ok = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\nDone: ${ok} synced, ${failed} failed.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
