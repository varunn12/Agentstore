export type AgentStatus = "draft" | "beta" | "production" | "deprecated";

export type AgentCategory =
  | "customer-support"
  | "sales"
  | "engineering"
  | "ops"
  | "research"
  | "internal";

export interface TechnicalScores {
  reliability: number;
  latency: number;
  toolUse: number;
  safety: number;
  maintainability: number;
  documentation: number;
}

export interface EvalCase {
  id: string;
  name: string;
  description: string;
  category: string;
  passed: boolean;
  score?: number;
  latencyMs?: number;
  notes?: string;
}

export interface EvalSuite {
  id: string;
  name: string;
  description: string;
  lastRunAt: string;
  passRate: number;
  totalCases: number;
  passedCases: number;
  cases: EvalCase[];
}

export interface GTMChecklistItem {
  item: string;
  completed: boolean;
}

export interface GTMInfo {
  tagline: string;
  valueProposition: string;
  targetAudience: string[];
  useCases: string[];
  pricingTier?: string;
  launchDate?: string;
  readinessChecklist: GTMChecklistItem[];
}

export type TechnicalScoreNotes = Partial<
  Record<keyof TechnicalScores, string>
>;

export interface Agent {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  category: AgentCategory;
  status: AgentStatus;
  version: string;
  owner: string;
  team: string;
  tags: string[];
  icon: string;
  repoUrl?: string;
  createdAt: string;
  updatedAt: string;
  technicalScores: TechnicalScores;
  scoreNotes?: TechnicalScoreNotes;
  evalSuites: EvalSuite[];
  gtm: GTMInfo;
}

export interface AgentSummary extends Agent {
  overallTechnicalScore: number;
  overallEvalPassRate: number;
  gtmReadinessPercent: number;
}

export type CreateAgentInput = Omit<
  Agent,
  "id" | "slug" | "createdAt" | "updatedAt"
> & { slug?: string };

export type UpdateAgentInput = Partial<
  Omit<Agent, "id" | "createdAt" | "updatedAt">
>;
