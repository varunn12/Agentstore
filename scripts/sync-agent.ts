import fs from "fs";
import path from "path";
import { buildAgentUpdatesFromCIReport } from "../src/lib/ci-report";
import { enrichAgent } from "../src/lib/scoring";
import { getAgentBySlug, updateAgent } from "../src/lib/store";

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
  const slug = process.argv[2];
  if (!slug) {
    console.error("Usage: npx tsx scripts/sync-agent.ts <slug>");
    process.exit(1);
  }

  const agent = await getAgentBySlug(slug);
  if (!agent) {
    console.error(`Agent "${slug}" not found`);
    process.exit(1);
  }

  if (!agent.repoUrl) {
    console.error(`Agent "${slug}" has no repoUrl linked`);
    process.exit(1);
  }

  const updates = await buildAgentUpdatesFromCIReport(agent, {
    syncManifest: true,
  });
  const updated = await updateAgent(slug, updates);
  const enriched = enrichAgent(updated);

  console.log(
    JSON.stringify(
      {
        slug,
        repoUrl: agent.repoUrl,
        applied: Object.keys(updates),
        version: enriched.version,
        overallTechnicalScore: enriched.overallTechnicalScore,
        gtmReadinessPercent: enriched.gtmReadinessPercent,
        technicalScores: enriched.technicalScores,
        readinessChecklist: enriched.gtm.readinessChecklist,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
