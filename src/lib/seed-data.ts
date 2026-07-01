import type { Agent } from "./types";

const now = new Date().toISOString();

export const SEED_AGENTS: Agent[] = [
  {
    id: "agent-ars",
    slug: "agent-ars",
    name: "ARS — Auto Replenishment",
    description:
      "Distributor replenishment agent for CPG-OS: ideal-order recommendation, modification review, fund coverage, and ERP push.",
    longDescription:
      "ARS 2.0 is the Auto-Replenishment agent under FieldAssist CPG-OS. It exposes ~12 typed actions through CLI, API, UI, and MCP surfaces. Domain modules are wired through 7 pluggable strategy interfaces (Forecast, Quantity, Allocation, Approval, Scheduling, Lifecycle, Truncation). Built on .NET 9 (engine/API/CLI/MCP), Python 3.12 (ML forecasting), and Nuxt 4 (console UI).",
    category: "ops",
    status: "draft",
    version: "0.1.0",
    owner: "Kumar Prakarsh",
    team: "ARS Squad",
    tags: ["cpg", "replenishment", "forecasting", "distributor", "mcp", "cpg-os"],
    icon: "📦",
    repoUrl: "https://github.com/kumarprakarsh/agent-ars",
    createdAt: "2026-06-15T00:00:00.000Z",
    updatedAt: now,
    technicalScores: {
      reliability: 85,
      latency: 95,
      toolUse: 92,
      safety: 88,
      maintainability: 84,
      documentation: 80,
    },
    scoreNotes: {
      latency:
        "Tier-S load test passed at 30 rps with P95 37ms on recommend_replenishment.",
      safety:
        "Eval gate includes fail-closed contract lock verification before ERP push.",
      toolUse: "12 typed actions across CLI, API, UI, and MCP surfaces.",
    },
    evalSuites: [
      {
        id: "suite-evalgate",
        name: "F-EVALGATE — Pre-Registered Evaluation Gate",
        description: "Forecasting gate correctness: WAPE, MASE, bootstrap CI, tiering, determinism",
        lastRunAt: now,
        passRate: 100,
        totalCases: 12,
        passedCases: 12,
        cases: [],
      },
      {
        id: "suite-load-tier-s",
        name: "Tier-S Load Test",
        description: "30 rps sustained for 5 min — P95 < 2000ms SLO",
        lastRunAt: "2026-06-19T17:20:35.000Z",
        passRate: 100,
        totalCases: 4,
        passedCases: 4,
        cases: [],
      },
    ],
    gtm: {
      tagline: "Automate distributor replenishment with auditable, strategy-pluggable intelligence",
      valueProposition:
        "Generate ideal orders, validate distributor modifications, check fund coverage, and push to ERP — all through a normalized CLI · API · UI · MCP contract under CPG-OS.",
      targetAudience: [
        "CPG brand supply chain teams",
        "Distributor operations",
        "FieldAssist platform teams",
      ],
      useCases: [
        "Ideal order recommendation",
        "Distributor modification review & escalation",
        "Fund coverage evaluation",
      ],
      pricingTier: "TBD",
      readinessChecklist: [
        { item: "Agent manifest published (12 actions)", completed: true },
        { item: "Tier-S load test passed (30 rps)", completed: true },
        { item: "Eval gate suites (F-EVALGATE, F-CLEAN-RESOLVE)", completed: true },
        { item: "Product demo video recorded", completed: false },
        { item: "Sales one-pager published", completed: false },
        { item: "Customer case study", completed: false },
      ],
    },
  },
  {
    id: "agent-dedup",
    slug: "dedup",
    name: "Outlet Dedupe",
    description:
      "Detects duplicate CPG outlet records using storefront-photo similarity, geo, phone, GSTIN, and reviewable evidence.",
    longDescription:
      "Headless outlet-deduplication agent for CPG field-sales teams. Tier M foundation with API + UI + CLI + MCP over one Python application/core layer. Finds duplicate or low-quality outlet records, explains the evidence, and prepares safe recommendations to retire duplicates or recapture poor photos. Works standalone or as a CPG-OS action agent.",
    category: "ops",
    status: "beta",
    version: "0.1.0",
    owner: "FieldAssist Product",
    team: "fieldassist-product",
    tags: ["cpg", "deduplication", "outlet", "field-sales", "mcp", "cpg-os", "vision"],
    icon: "🔍",
    repoUrl: "https://github.com/wandering-green/dedup",
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: now,
    technicalScores: {
      reliability: 82,
      latency: 75,
      toolUse: 90,
      safety: 92,
      maintainability: 86,
      documentation: 88,
    },
    scoreNotes: {
      latency:
        "Photo similarity and VLM corroboration add latency; load test not yet verified.",
      safety:
        "Human-in-the-loop retirement flow, VLM evidence checks, and tenant auth scoping.",
      toolUse: "API, MCP, CLI, and UI surfaces over a shared Python core.",
    },
    evalSuites: [
      {
        id: "suite-agent-contract",
        name: "Agent Contract Tests",
        description: "Manifest, API, MCP, and A2A contract conformance",
        lastRunAt: now,
        passRate: 100,
        totalCases: 30,
        passedCases: 30,
        cases: [],
      },
      {
        id: "suite-backend",
        name: "Backend Test Suite",
        description: "Photo evidence, VLM verification, auth scoping",
        lastRunAt: now,
        passRate: 100,
        totalCases: 65,
        passedCases: 65,
        cases: [],
      },
    ],
    gtm: {
      tagline: "Clean outlet master data with photo-grounded duplicate detection",
      valueProposition:
        "Find duplicate or low-quality outlet records, explain the evidence, and prepare safe retire-or-recapture recommendations — via UI, API, CLI, MCP, or CPG-OS orchestration.",
      targetAudience: [
        "CPG sales-ops and audit teams",
        "Field sales operations",
        "CPG-OS platform integrators",
      ],
      useCases: [
        "Duplicate outlet detection",
        "Human-in-the-loop retirement recommendations",
        "CPG-OS action agent for outlet-quality signals",
      ],
      pricingTier: "TBD",
      readinessChecklist: [
        { item: "Agent manifest published", completed: true },
        { item: "API + MCP + CLI + UI surfaces", completed: true },
        { item: "Backend test suite passing", completed: true },
        { item: "Load test verified", completed: false },
        { item: "Product demo video recorded", completed: false },
        { item: "Customer case study", completed: false },
      ],
    },
  },
];
