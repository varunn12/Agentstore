import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { list, put } from "@vercel/blob";
import { SEED_AGENTS } from "./seed-data";
import { enrichAgent } from "./scoring";
import type { Agent, CreateAgentInput, UpdateAgentInput } from "./types";
import { slugify } from "./utils";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "agents.json");
const BLOB_PATHNAME = "agentstore/agents.json";

function usesBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function isVercelRuntime(): boolean {
  return Boolean(process.env.VERCEL);
}

function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(SEED_AGENTS, null, 2));
  }
}

function readLocalAgentsFile(): Agent[] {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw) as Agent[];
}

function writeLocalAgentsFile(agents: Agent[]): void {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(agents, null, 2));
}

async function readBlobAgents(): Promise<Agent[] | null> {
  const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 1 });
  if (blobs.length === 0) return null;

  const response = await fetch(blobs[0].url, { cache: "no-store" });
  if (!response.ok) return null;
  return (await response.json()) as Agent[];
}

async function writeBlobAgents(agents: Agent[]): Promise<void> {
  await put(BLOB_PATHNAME, JSON.stringify(agents, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

async function readAgents(): Promise<Agent[]> {
  if (usesBlobStorage()) {
    const blobAgents = await readBlobAgents();
    if (blobAgents) return blobAgents;

    const seed = readLocalAgentsFile();
    await writeBlobAgents(seed);
    return seed;
  }

  return readLocalAgentsFile();
}

async function writeAgents(agents: Agent[]): Promise<void> {
  if (usesBlobStorage()) {
    await writeBlobAgents(agents);
    return;
  }

  if (isVercelRuntime()) {
    throw new Error(
      "Production edits require Vercel Blob storage. In the Vercel dashboard, open Storage → Create Database → Blob, connect it to this project, and redeploy.",
    );
  }

  writeLocalAgentsFile(agents);
}

export async function getAllAgents(): Promise<Agent[]> {
  return readAgents();
}

export async function getAllAgentsEnriched() {
  const agents = await getAllAgents();
  return agents.map(enrichAgent);
}

export async function getAgentBySlug(slug: string): Promise<Agent | undefined> {
  const agents = await readAgents();
  return agents.find((agent) => agent.slug === slug);
}

export async function getAgentBySlugEnriched(slug: string) {
  const agent = await getAgentBySlug(slug);
  return agent ? enrichAgent(agent) : undefined;
}

export async function createAgent(input: CreateAgentInput): Promise<Agent> {
  const agents = await readAgents();
  const slug = input.slug ?? slugify(input.name);
  if (agents.some((agent) => agent.slug === slug)) {
    throw new Error(`Agent with slug "${slug}" already exists`);
  }

  const now = new Date().toISOString();
  const agent: Agent = {
    ...input,
    id: randomUUID(),
    slug,
    createdAt: now,
    updatedAt: now,
  };

  agents.push(agent);
  await writeAgents(agents);
  return agent;
}

export async function updateAgent(
  slug: string,
  input: UpdateAgentInput,
): Promise<Agent> {
  const agents = await readAgents();
  const index = agents.findIndex((agent) => agent.slug === slug);
  if (index === -1) {
    throw new Error(`Agent "${slug}" not found`);
  }

  const updated: Agent = {
    ...agents[index],
    ...input,
    id: agents[index].id,
    slug: input.slug ?? agents[index].slug,
    createdAt: agents[index].createdAt,
    updatedAt: new Date().toISOString(),
  };

  agents[index] = updated;
  await writeAgents(agents);
  return updated;
}

export async function deleteAgent(slug: string): Promise<void> {
  const agents = await readAgents();
  const filtered = agents.filter((agent) => agent.slug !== slug);
  if (filtered.length === agents.length) {
    throw new Error(`Agent "${slug}" not found`);
  }
  await writeAgents(filtered);
}

export async function getStoreStats() {
  const agents = await getAllAgentsEnriched();
  return {
    totalAgents: agents.length,
    productionReady: agents.filter((agent) => agent.status === "production").length,
    avgTechnicalScore: agents.length
      ? Math.round(
          agents.reduce((sum, agent) => sum + agent.overallTechnicalScore, 0) /
            agents.length,
        )
      : 0,
    avgEvalPassRate: agents.length
      ? Math.round(
          agents.reduce((sum, agent) => sum + agent.overallEvalPassRate, 0) /
            agents.length,
        )
      : 0,
    avgGTMReadiness: agents.length
      ? Math.round(
          agents.reduce((sum, agent) => sum + agent.gtmReadinessPercent, 0) /
            agents.length,
        )
      : 0,
  };
}
