import { TECH_SCORE_LABELS } from "./scoring";
import type { Agent, AgentSummary, EvalCase, TechnicalScores } from "./types";

export type ComparisonMetric =
  | "overallTechnicalScore"
  | "overallEvalPassRate"
  | "gtmReadinessPercent"
  | keyof TechnicalScores;

export interface AgentScoreReason {
  slug: string;
  name: string;
  value: number;
  reason: string;
}

export interface ComparisonRowInsight {
  label: string;
  metric: ComparisonMetric;
  reasons: AgentScoreReason[];
  summary: string;
}

function firstSentence(...parts: (string | undefined)[]): string {
  const text = parts.filter((part): part is string => Boolean(part)).join(" ");
  return text || "No supporting evidence recorded for this score.";
}

function latencyCases(agent: Agent): EvalCase[] {
  return agent.evalSuites.flatMap((suite) =>
    suite.cases.filter(
      (c) => c.category === "latency" || typeof c.latencyMs === "number",
    ),
  );
}

function safetyCases(agent: Agent): EvalCase[] {
  return agent.evalSuites.flatMap((suite) =>
    suite.cases.filter((c) => c.category === "safety"),
  );
}

function checklistMatches(agent: Agent, pattern: RegExp): string[] {
  return agent.gtm.readinessChecklist
    .filter((item) => pattern.test(item.item))
    .map((item) =>
      item.completed ? `${item.item} (done)` : `${item.item} (pending)`,
    );
}

function loadTestSuiteSummary(agent: Agent): string[] {
  return agent.evalSuites
    .filter(
      (suite) =>
        /load test|tier-s/i.test(suite.name) ||
        /load test|rps|p95/i.test(suite.description),
    )
    .map((suite) => {
      const latencyEvidence = suite.cases
        .filter((c) => c.latencyMs || c.description)
        .map((c) =>
          c.latencyMs
            ? `${c.name}: ${c.latencyMs}ms`
            : c.description,
        );
      if (latencyEvidence.length > 0) return latencyEvidence.join("; ");
      return suite.description || suite.name;
    });
}

function getTechnicalDimensionReason(
  agent: Agent,
  dimension: keyof TechnicalScores,
): string {
  const note = agent.scoreNotes?.[dimension];
  if (note) return note;

  switch (dimension) {
    case "latency": {
      const loadTests = loadTestSuiteSummary(agent);
      const cases = latencyCases(agent).map((c) =>
        c.latencyMs
          ? `${c.name} measured at ${c.latencyMs}ms`
          : c.description,
      );
      const checklist = checklistMatches(agent, /load test/i);
      return firstSentence(...loadTests, ...cases, ...checklist);
    }
    case "safety": {
      const cases = safetyCases(agent).map((c) => c.description || c.name);
      const reviewSignals = agent.tags.includes("vision")
        ? "Vision workflow includes human review before destructive actions"
        : "";
      const hITL = agent.gtm.useCases.some((u) => /human-in-the-loop|review/i.test(u))
        ? "Human-in-the-loop flows reduce unsafe automation risk"
        : "";
      return firstSentence(...cases, reviewSignals, hITL);
    }
    case "reliability": {
      const failed = agent.evalSuites.flatMap((s) =>
        s.cases.filter((c) => !c.passed).map((c) => `Failed: ${c.name}`),
      );
      if (failed.length > 0) return firstSentence(...failed);
      const suiteRates = agent.evalSuites.map(
        (s) => `${s.name}: ${s.passRate}% pass rate`,
      );
      return firstSentence(...suiteRates);
    }
    case "toolUse": {
      const manifestItem = agent.gtm.readinessChecklist.find((i) =>
        /action/i.test(i.item),
      );
      const surfaces = agent.gtm.readinessChecklist.filter((i) =>
        /api|mcp|cli|ui|surface/i.test(i.item),
      );
      return firstSentence(
        manifestItem?.item,
        surfaces.map((s) => s.item).join(", "),
        agent.longDescription.match(/~\d+ typed actions/i)?.[0],
      );
    }
    case "maintainability": {
      const tier = agent.longDescription.match(/tier [SML]/i)?.[0];
      const stack = agent.longDescription.match(
        /built on [^.]+\./i,
      )?.[0];
      return firstSentence(tier, stack);
    }
    case "documentation": {
      const docSignals = checklistMatches(
        agent,
        /manifest|readme|docs|one-pager/i,
      );
      return firstSentence(...docSignals);
    }
    default:
      return "Score set in the agent catalog without additional notes.";
  }
}

function getOverallTechnicalReason(agent: Agent): string {
  const dimensions = Object.keys(TECH_SCORE_LABELS) as (keyof TechnicalScores)[];
  const sorted = [...dimensions].sort(
    (a, b) => agent.technicalScores[b] - agent.technicalScores[a],
  );
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];
  return `Weighted blend of six dimensions. Strongest: ${TECH_SCORE_LABELS[strongest]} (${agent.technicalScores[strongest]}). Weakest: ${TECH_SCORE_LABELS[weakest]} (${agent.technicalScores[weakest]}).`;
}

function getEvalPassRateReason(agent: Agent): string {
  if (agent.evalSuites.length === 0) {
    return "No eval suites recorded.";
  }
  const suiteSummaries = agent.evalSuites.map(
    (s) =>
      `${s.name}: ${s.passedCases}/${s.totalCases} cases passed (${s.passRate}%)`,
  );
  const failedCases = agent.evalSuites.flatMap((s) =>
    s.cases.filter((c) => !c.passed).map((c) => c.name),
  );
  if (failedCases.length > 0) {
    return firstSentence(
      ...suiteSummaries,
      `Open failures: ${failedCases.join(", ")}`,
    );
  }
  return suiteSummaries.join("; ");
}

function getGtmReadinessReason(agent: Agent): string {
  const completed = agent.gtm.readinessChecklist.filter((i) => i.completed);
  const pending = agent.gtm.readinessChecklist.filter((i) => !i.completed);
  const done = completed.map((i) => i.item).join(", ");
  const open = pending.map((i) => i.item).join(", ");
  if (completed.length === 0 && pending.length === 0) {
    return "No GTM readiness checklist items defined.";
  }
  return firstSentence(
    done ? `Completed: ${done}` : "",
    open ? `Still open: ${open}` : "",
  );
}

export function getScoreReason(
  agent: Agent,
  metric: ComparisonMetric,
): string {
  if (metric === "overallTechnicalScore") return getOverallTechnicalReason(agent);
  if (metric === "overallEvalPassRate") return getEvalPassRateReason(agent);
  if (metric === "gtmReadinessPercent") return getGtmReadinessReason(agent);
  return getTechnicalDimensionReason(agent, metric);
}

function buildSummary(
  metric: ComparisonMetric,
  label: string,
  reasons: AgentScoreReason[],
): string {
  if (reasons.length < 2) return "";

  const sorted = [...reasons].sort((a, b) => b.value - a.value);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const delta = best.value - worst.value;

  if (delta === 0) {
    return `Tied on ${label}. ${best.name} and ${worst.name} share the same score (${best.value}).`;
  }

  const metricPhrase =
    metric === "overallTechnicalScore"
      ? "overall technical score"
      : metric === "overallEvalPassRate"
        ? "eval pass rate"
        : metric === "gtmReadinessPercent"
          ? "GTM readiness"
          : label.toLowerCase();

  return `${best.name} leads on ${metricPhrase} (+${delta} vs ${worst.name}): ${best.reason}`;
}

export function buildComparisonRowInsight(
  agents: AgentSummary[],
  metric: ComparisonMetric,
  label: string,
  values: number[],
): ComparisonRowInsight {
  const reasons: AgentScoreReason[] = agents.map((agent, index) => ({
    slug: agent.slug,
    name: agent.name,
    value: values[index],
    reason: getScoreReason(agent, metric),
  }));

  return {
    label,
    metric,
    reasons,
    summary: buildSummary(metric, label, reasons),
  };
}
