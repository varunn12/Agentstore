export interface StoreDomain {
  id: string;
  acronym: string;
  title: string;
  description: string;
}

export const STORE_DEFINITION = {
  title: "About Agent Store",
  tagline: "The agent marketplace for CPG, RTM, and RGM",
  summary:
    "Agent Store is the AppExchange for consumer goods — a curated marketplace where teams discover, evaluate, and launch AI agents built for Route to Market and Revenue Growth Management.",
  intro:
    "Just as Salesforce AppExchange and the iOS App Store connect builders with buyers, Agent Store connects CPG operators, field teams, and revenue leaders with production-ready agents. Every listing includes technical scores, eval results, and go-to-market readiness so you can adopt with confidence.",
  analogy: {
    appExchange:
      "Salesforce AppExchange lets teams install vetted apps into their CRM. Agent Store does the same for AI agents in CPG workflows.",
    appStore:
      "The iOS App Store gives users trusted, reviewed software in one place. Agent Store brings that same discover-and-install experience to replenishment, pricing, trade promo, and field operations agents.",
  },
  domains: [
    {
      id: "cpg",
      acronym: "CPG",
      title: "Consumer Packaged Goods",
      description:
        "Agents for supply chain, replenishment, demand planning, distributor operations, and shelf-level intelligence across your brand portfolio.",
    },
    {
      id: "rtm",
      acronym: "RTM",
      title: "Route to Market",
      description:
        "Agents for field sales, beat planning, distributor coverage, order capture, and last-mile execution — the workflows that get product to shelf.",
    },
    {
      id: "rgm",
      acronym: "RGM",
      title: "Revenue Growth Management",
      description:
        "Agents for pricing, promotion optimization, elasticity modeling, trade spend, and revenue levers that drive profitable growth.",
    },
  ] satisfies StoreDomain[],
  capabilities: [
    {
      title: "Discover",
      description:
        "Browse a catalog of agents by domain, status, and technical score — find the right capability for your team.",
    },
    {
      title: "Evaluate",
      description:
        "Compare agents side by side with eval pass rates, latency benchmarks, and safety checks before you adopt.",
    },
    {
      title: "Launch",
      description:
        "Track GTM readiness, target audience, and launch checklists so agents move from beta to production with confidence.",
    },
    {
      title: "Build",
      description:
        "Publish agents from GitHub, compete on the builder scoreboard, and grow the ecosystem for CPG-OS and beyond.",
    },
  ],
} as const;
