import type { AgentSummary } from "./types";

export const BUILDER_SCORE_WEIGHTS = {
  technical: 0.4,
  eval: 0.35,
  gtm: 0.25,
} as const;

export interface BuilderAgentRef {
  slug: string;
  name: string;
  icon: string;
  overallScore: number;
}

export interface BuilderSummary {
  owner: string;
  teams: string[];
  agentCount: number;
  productionCount: number;
  avgTechnicalScore: number;
  avgEvalPassRate: number;
  avgGtmReadiness: number;
  overallScore: number;
  agents: BuilderAgentRef[];
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function agentOverallScore(agent: AgentSummary): number {
  return Math.round(
    agent.overallTechnicalScore * BUILDER_SCORE_WEIGHTS.technical +
      agent.overallEvalPassRate * BUILDER_SCORE_WEIGHTS.eval +
      agent.gtmReadinessPercent * BUILDER_SCORE_WEIGHTS.gtm,
  );
}

export function computeBuilderScores(agents: AgentSummary[]): BuilderSummary[] {
  const byOwner = new Map<string, AgentSummary[]>();

  for (const agent of agents) {
    const owner = agent.owner.trim();
    if (!owner) continue;
    const group = byOwner.get(owner) ?? [];
    group.push(agent);
    byOwner.set(owner, group);
  }

  const builders = Array.from(byOwner.entries()).map(([owner, ownerAgents]) => {
    const teams = [...new Set(ownerAgents.map((agent) => agent.team).filter(Boolean))];
    const agentRefs = ownerAgents
      .map((agent) => ({
        slug: agent.slug,
        name: agent.name,
        icon: agent.icon,
        overallScore: agentOverallScore(agent),
      }))
      .sort((a, b) => b.overallScore - a.overallScore);

    const avgTechnicalScore = average(
      ownerAgents.map((agent) => agent.overallTechnicalScore),
    );
    const avgEvalPassRate = average(
      ownerAgents.map((agent) => agent.overallEvalPassRate),
    );
    const avgGtmReadiness = average(
      ownerAgents.map((agent) => agent.gtmReadinessPercent),
    );

    return {
      owner,
      teams,
      agentCount: ownerAgents.length,
      productionCount: ownerAgents.filter((agent) => agent.status === "production")
        .length,
      avgTechnicalScore,
      avgEvalPassRate,
      avgGtmReadiness,
      overallScore: Math.round(
        avgTechnicalScore * BUILDER_SCORE_WEIGHTS.technical +
          avgEvalPassRate * BUILDER_SCORE_WEIGHTS.eval +
          avgGtmReadiness * BUILDER_SCORE_WEIGHTS.gtm,
      ),
      agents: agentRefs,
    };
  });

  return builders.sort((a, b) => {
    if (b.overallScore !== a.overallScore) return b.overallScore - a.overallScore;
    if (b.agentCount !== a.agentCount) return b.agentCount - a.agentCount;
    return a.owner.localeCompare(b.owner);
  });
}

export function getTopBuilders(
  agents: AgentSummary[],
  limit = 5,
): BuilderSummary[] {
  return computeBuilderScores(agents).slice(0, limit);
}

export function getBuilderInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
