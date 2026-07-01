import type { Agent, GTMInfo, TechnicalScores } from "./types";

export const TECH_WEIGHTS: Record<keyof TechnicalScores, number> = {
  reliability: 0.25,
  latency: 0.15,
  toolUse: 0.2,
  safety: 0.2,
  maintainability: 0.1,
  documentation: 0.1,
};

export function computeOverallTechnicalScore(scores: TechnicalScores): number {
  let total = 0;
  for (const key of Object.keys(TECH_WEIGHTS) as (keyof TechnicalScores)[]) {
    total += scores[key] * TECH_WEIGHTS[key];
  }
  return Math.round(total);
}

export function computeOverallEvalPassRate(agent: Agent): number {
  if (agent.evalSuites.length === 0) return 0;
  const totalCases = agent.evalSuites.reduce((sum, s) => sum + s.totalCases, 0);
  const passedCases = agent.evalSuites.reduce(
    (sum, s) => sum + s.passedCases,
    0,
  );
  if (totalCases === 0) return 0;
  return Math.round((passedCases / totalCases) * 100);
}

export function computeGTMReadinessPercent(gtm: GTMInfo): number {
  if (gtm.readinessChecklist.length === 0) return 0;
  const completed = gtm.readinessChecklist.filter((i) => i.completed).length;
  return Math.round((completed / gtm.readinessChecklist.length) * 100);
}

export function getScoreGrade(score: number): {
  grade: string;
  color: string;
} {
  if (score >= 90) return { grade: "A", color: "text-emerald-600" };
  if (score >= 80) return { grade: "B", color: "text-lime-600" };
  if (score >= 70) return { grade: "C", color: "text-amber-600" };
  if (score >= 60) return { grade: "D", color: "text-orange-600" };
  return { grade: "F", color: "text-red-600" };
}

export function getScoreBarColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

export function enrichAgent(agent: Agent) {
  return {
    ...agent,
    overallTechnicalScore: computeOverallTechnicalScore(agent.technicalScores),
    overallEvalPassRate: computeOverallEvalPassRate(agent),
    gtmReadinessPercent: computeGTMReadinessPercent(agent.gtm),
  };
}

export const TECH_SCORE_LABELS: Record<keyof TechnicalScores, string> = {
  reliability: "Reliability",
  latency: "Latency & Performance",
  toolUse: "Tool Use",
  safety: "Safety & Guardrails",
  maintainability: "Maintainability",
  documentation: "Documentation",
};

export const TECH_SCORE_DESCRIPTIONS: Record<keyof TechnicalScores, string> = {
  reliability:
    "Consistency of outputs, uptime, error handling, and recovery from failures.",
  latency:
    "Response time, throughput, and performance under expected load.",
  toolUse:
    "Quality of tool and action integration, orchestration, and result handling.",
  safety:
    "Guardrails for harmful content, PII handling, and policy compliance.",
  maintainability:
    "Code quality, test coverage, operational overhead, and ease of change.",
  documentation:
    "README quality, API docs, runbooks, and onboarding materials.",
};

export const SCORE_GRADES = [
  { min: 90, grade: "A", color: "text-emerald-600" },
  { min: 80, grade: "B", color: "text-lime-600" },
  { min: 70, grade: "C", color: "text-amber-600" },
  { min: 60, grade: "D", color: "text-orange-600" },
  { min: 0, grade: "F", color: "text-red-600" },
] as const;
