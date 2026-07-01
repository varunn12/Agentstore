import {
  computeGTMReadinessPercent,
  computeOverallEvalPassRate,
  computeOverallTechnicalScore,
  TECH_SCORE_LABELS,
} from "./scoring";
import type { Agent, AgentSummary, GTMInfo, TechnicalScores } from "./types";

export type RecommendationArea = "technical" | "evals" | "gtm" | "launch";
export type RecommendationPriority = "high" | "medium" | "low";

export interface OwnerRecommendation {
  id: string;
  area: RecommendationArea;
  priority: RecommendationPriority;
  title: string;
  description: string;
  impact?: string;
}

function findChecklistItem(gtm: GTMInfo, needle: string) {
  return gtm.readinessChecklist.find((item) =>
    item.item.toLowerCase().includes(needle.toLowerCase()),
  );
}

function isImportBaseline(scores: TechnicalScores): boolean {
  return Object.values(scores).every((score) => score === 70);
}

export function getOwnerRecommendations(
  agent: Agent | AgentSummary,
): OwnerRecommendation[] {
  const recs: OwnerRecommendation[] = [];
  const { gtm, technicalScores, evalSuites, repoUrl } = agent;

  const manifestItem = findChecklistItem(gtm, "manifest published");
  if (manifestItem && !manifestItem.completed) {
    recs.push({
      id: "manifest",
      area: "technical",
      priority: "high",
      title: "Publish an agent manifest",
      description: repoUrl
        ? `Add agent.manifest.json to the repository with agent metadata, typed actions, tier, and capacity signals.`
        : "Add agent.manifest.json with agent metadata, typed actions, tier, and capacity signals.",
      impact: "Unlocks automatic score boosts on re-import and completes a core GTM checklist item.",
    });
  }

  const actionsItem = findChecklistItem(gtm, "action(s) defined");
  if (actionsItem && !actionsItem.completed) {
    recs.push({
      id: "actions",
      area: "technical",
      priority: "high",
      title: "Define typed actions",
      description:
        "List the agent's capabilities as named actions in the manifest, each with a clear description.",
      impact: "3+ actions raises Tool Use to 82; 8+ raises it to 90.",
    });
  }

  const loadTestItem = findChecklistItem(gtm, "load test");
  if (loadTestItem && !loadTestItem.completed) {
    recs.push({
      id: "load-test",
      area: "technical",
      priority: "medium",
      title: "Verify load performance",
      description:
        "Run a sustained load test and record results in the manifest capacity block (RPS and P95 latency).",
      impact: "Documented load tests raise Latency to 90 and Reliability to 85.",
    });
  }

  if (evalSuites.length === 0) {
    recs.push({
      id: "eval-suites",
      area: "evals",
      priority: "high",
      title: "Add evaluation suites",
      description:
        "Create contract, capability, and safety eval suites and record pass/fail results in the dashboard.",
      impact: "Eval pass rate is currently 0% with no suites attached.",
    });
  } else {
    const totalCases = evalSuites.reduce((sum, s) => sum + s.totalCases, 0);
    const passedCases = evalSuites.reduce((sum, s) => sum + s.passedCases, 0);
    if (totalCases > passedCases) {
      recs.push({
        id: "eval-failures",
        area: "evals",
        priority: "medium",
        title: "Fix failing eval cases",
        description: `${totalCases - passedCases} of ${totalCases} eval cases are failing across ${evalSuites.length} suite(s).`,
        impact: "Improves eval pass rate and launch confidence.",
      });
    }
  }

  if (isImportBaseline(technicalScores) && !agent.scoreNotes) {
    recs.push({
      id: "baseline-scores",
      area: "technical",
      priority: "medium",
      title: "Replace import baseline scores",
      description:
        "Technical scores are still at the default 70/100 import baseline. Update them after manifest, testing, and review.",
      impact: "Scores should reflect measured quality, not placeholder defaults.",
    });
  } else {
    for (const key of Object.keys(technicalScores) as (keyof TechnicalScores)[]) {
      const value = technicalScores[key];
      if (value < 75 && !agent.scoreNotes?.[key]) {
        recs.push({
          id: `tech-${key}`,
          area: "technical",
          priority: "low",
          title: `Improve ${TECH_SCORE_LABELS[key]}`,
          description: `This dimension is scored ${value}/100 without supporting notes.`,
          impact: `Raises the weighted technical score (${TECH_SCORE_LABELS[key]} is a key input).`,
        });
      }
    }
  }

  const gtmItems: Array<{
    needle: string;
    id: string;
    title: string;
    description: string;
    priority: RecommendationPriority;
  }> = [
    {
      needle: "demo video",
      id: "demo-video",
      title: "Record a product demo",
      description: "Capture a short walkthrough showing the agent's primary use cases.",
      priority: "low",
    },
    {
      needle: "one-pager",
      id: "one-pager",
      title: "Publish a sales one-pager",
      description: "Create a concise GTM document for internal sales and partner teams.",
      priority: "medium",
    },
    {
      needle: "case study",
      id: "case-study",
      title: "Add a customer case study",
      description: "Document a real deployment with outcomes and quotes.",
      priority: "low",
    },
  ];

  for (const item of gtmItems) {
    const checklist = findChecklistItem(gtm, item.needle);
    if (checklist && !checklist.completed) {
      recs.push({
        id: item.id,
        area: "gtm",
        priority: item.priority,
        title: item.title,
        description: item.description,
        impact: "Increases GTM readiness percentage.",
      });
    }
  }

  if (!gtm.tagline.trim()) {
    recs.push({
      id: "tagline",
      area: "gtm",
      priority: "medium",
      title: "Write a GTM tagline",
      description: "Add a short, customer-facing tagline in the dashboard GTM section.",
      impact: "Improves catalog presentation and launch materials.",
    });
  }

  if (gtm.useCases.length === 0) {
    recs.push({
      id: "use-cases",
      area: "gtm",
      priority: "medium",
      title: "Document use cases",
      description: "List the primary jobs-to-be-done this agent supports.",
      impact: "Helps GTM and integrators understand where to deploy the agent.",
    });
  }

  if (
    agent.status === "draft" &&
    ("overallTechnicalScore" in agent
      ? agent.overallTechnicalScore
      : computeOverallTechnicalScore(agent.technicalScores)) >= 80 &&
    ("overallEvalPassRate" in agent
      ? agent.overallEvalPassRate
      : computeOverallEvalPassRate(agent)) >= 90 &&
    ("gtmReadinessPercent" in agent
      ? agent.gtmReadinessPercent
      : computeGTMReadinessPercent(agent.gtm)) >= 50
  ) {
    recs.push({
      id: "promote-beta",
      area: "launch",
      priority: "low",
      title: "Consider promoting to beta",
      description:
        "Technical, eval, and GTM signals are strong enough to move this agent from draft to beta.",
      impact: "Signals broader team availability beyond the owning squad.",
    });
  }

  const priorityOrder: Record<RecommendationPriority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  return recs.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
  );
}
