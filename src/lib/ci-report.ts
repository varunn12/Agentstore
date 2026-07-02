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

function mergeGtmChecklist(existing: GTMInfo, imported: GTMInfo): GTMInfo {
  const importedByItem = new Map(
    imported.readinessChecklist.map((item) => [item.item, item.completed]),
  );

  const mergedChecklist = existing.readinessChecklist.map((item) => ({
    ...item,
    completed:
      item.completed ||
      (importedByItem.has(item.item) ? importedByItem.get(item.item)! : false),
  }));

  const knownItems = new Set(mergedChecklist.map((item) => item.item));
  for (const item of imported.readinessChecklist) {
    if (!knownItems.has(item.item)) {
      mergedChecklist.push(item);
    }
  }

  return {
    ...existing,
    readinessChecklist: mergedChecklist,
    useCases:
      existing.useCases.length > 0 ? existing.useCases : imported.useCases,
    tagline: existing.tagline.trim() ? existing.tagline : imported.tagline,
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
    updates.gtm = mergeGtmChecklist(agent.gtm, imported.gtm);

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
