import { importAgentFromRepo } from "./repo-import";
import type {
  Agent,
  CIReportInput,
  EvalSuite,
  GTMInfo,
  TechnicalScores,
  UpdateAgentInput,
} from "./types";

const BASELINE_SCORE = 70;

function normalizeEvalSuite(suite: EvalSuite): EvalSuite {
  const totalCases = suite.cases.length > 0 ? suite.cases.length : suite.totalCases;
  const passedCases =
    suite.cases.length > 0
      ? suite.cases.filter((testCase) => testCase.passed).length
      : suite.passedCases;
  const passRate =
    totalCases === 0 ? 0 : Math.round((passedCases / totalCases) * 100);

  return {
    ...suite,
    lastRunAt: suite.lastRunAt || new Date().toISOString(),
    totalCases,
    passedCases,
    passRate,
  };
}

export function mergeEvalSuites(
  existing: EvalSuite[],
  incoming: EvalSuite[],
): EvalSuite[] {
  const byId = new Map(existing.map((suite) => [suite.id, suite]));

  for (const suite of incoming) {
    byId.set(suite.id, normalizeEvalSuite(suite));
  }

  return Array.from(byId.values());
}

function mergeTechnicalScores(
  existing: TechnicalScores,
  imported: TechnicalScores,
): TechnicalScores {
  const merged = { ...existing };

  for (const key of Object.keys(existing) as (keyof TechnicalScores)[]) {
    if (imported[key] > existing[key] || existing[key] === BASELINE_SCORE) {
      merged[key] = imported[key];
    }
  }

  return merged;
}

function mergePartialTechnicalScores(
  existing: TechnicalScores,
  partial: Partial<TechnicalScores>,
): TechnicalScores {
  const merged = { ...existing };

  for (const key of Object.keys(partial) as (keyof TechnicalScores)[]) {
    const value = partial[key];
    if (typeof value === "number" && value >= 0 && value <= 100) {
      merged[key] = value;
    }
  }

  return merged;
}

function syncGtmFromImport(existing: GTMInfo, imported: GTMInfo): GTMInfo {
  const manualItemNeedles = ["demo video", "one-pager", "case study"];
  const importedByItem = new Map(
    imported.readinessChecklist.map((item) => [item.item, item.completed]),
  );

  const checklist = existing.readinessChecklist.map((item) => {
    const isManual = manualItemNeedles.some((needle) =>
      item.item.toLowerCase().includes(needle),
    );
    if (isManual) return item;
    if (importedByItem.has(item.item)) {
      return { ...item, completed: importedByItem.get(item.item)! };
    }
    return item;
  });

  const knownItems = new Set(checklist.map((item) => item.item));
  for (const item of imported.readinessChecklist) {
    if (!knownItems.has(item.item)) {
      checklist.push(item);
    }
  }

  return {
    ...existing,
    tagline: imported.tagline.trim() ? imported.tagline : existing.tagline,
    valueProposition: imported.valueProposition || existing.valueProposition,
    useCases:
      imported.useCases.length > 0 ? imported.useCases : existing.useCases,
    readinessChecklist: checklist,
  };
}

export async function buildAgentUpdatesFromRepoSync(
  agent: Agent,
): Promise<UpdateAgentInput> {
  if (!agent.repoUrl) {
    throw new Error(
      "Sync requires a linked repoUrl. Add the GitHub repo in the dashboard first.",
    );
  }

  const imported = await importAgentFromRepo(agent.repoUrl);

  return {
    name: imported.name,
    description: imported.description,
    longDescription: imported.longDescription,
    version: imported.version,
    category: imported.category,
    icon: imported.icon,
    tags: [...new Set([...imported.tags, ...agent.tags])],
    technicalScores: imported.technicalScores,
    gtm: syncGtmFromImport(agent.gtm, imported.gtm),
  };
}

export async function buildAgentUpdatesFromCIReport(
  agent: Agent,
  report: CIReportInput,
): Promise<UpdateAgentInput> {
  const updates: UpdateAgentInput = {};

  if (report.syncManifest) {
    if (!agent.repoUrl) {
      throw new Error(
        "syncManifest requires a linked repoUrl on this agent. Add the GitHub repo in the dashboard first.",
      );
    }

    const imported = await importAgentFromRepo(agent.repoUrl);
    updates.version = report.version ?? imported.version;
    updates.technicalScores = mergeTechnicalScores(
      agent.technicalScores,
      imported.technicalScores,
    );
    updates.gtm = syncGtmFromImport(agent.gtm, imported.gtm);

    if (!agent.longDescription.trim()) {
      updates.longDescription = imported.longDescription;
    }
  } else if (report.version) {
    updates.version = report.version;
  }

  if (report.technicalScores) {
    updates.technicalScores = mergePartialTechnicalScores(
      updates.technicalScores ?? agent.technicalScores,
      report.technicalScores,
    );
  }

  if (report.scoreNotes) {
    updates.scoreNotes = {
      ...agent.scoreNotes,
      ...report.scoreNotes,
    };
  }

  if (report.evalSuites?.length) {
    updates.evalSuites = mergeEvalSuites(agent.evalSuites, report.evalSuites);
  }

  return updates;
}
