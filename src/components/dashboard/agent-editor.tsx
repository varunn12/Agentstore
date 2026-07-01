"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Agent, CreateAgentInput, TechnicalScores, GTMInfo } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TECH_SCORE_LABELS } from "@/lib/scoring";
import { Save, Loader2 } from "lucide-react";

function toFormState(source?: Agent | CreateAgentInput) {
  return {
    name: source?.name ?? "",
    description: source?.description ?? "",
    longDescription: source?.longDescription ?? "",
    category: source?.category ?? "internal",
    status: source?.status ?? "draft",
    version: source?.version ?? "0.1.0",
    owner: source?.owner ?? "",
    team: source?.team ?? "",
    tags: source?.tags?.join(", ") ?? "",
    icon: source?.icon ?? "🤖",
    repoUrl: source?.repoUrl ?? "",
    technicalScores: source?.technicalScores ?? {
      reliability: 70,
      latency: 70,
      toolUse: 70,
      safety: 70,
      maintainability: 70,
      documentation: 70,
    },
    gtm: source?.gtm ?? {
      tagline: "",
      valueProposition: "",
      targetAudience: [],
      useCases: [],
      readinessChecklist: [],
    },
  };
}

export function AgentEditor({
  agent,
  initial,
  mode = "edit",
}: {
  agent?: Agent;
  initial?: CreateAgentInput;
  mode?: "create" | "edit";
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState(() => toFormState(agent ?? initial));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      ...(mode === "create" && initial?.slug ? { slug: initial.slug } : {}),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      gtm: {
        ...form.gtm,
        targetAudience: (form.gtm.targetAudience as unknown as string)
          ? typeof form.gtm.targetAudience === "string"
            ? (form.gtm.targetAudience as unknown as string).split(",").map((s) => s.trim()).filter(Boolean)
            : form.gtm.targetAudience
          : [],
        useCases: (form.gtm.useCases as unknown as string)
          ? typeof form.gtm.useCases === "string"
            ? (form.gtm.useCases as unknown as string).split(",").map((s) => s.trim()).filter(Boolean)
            : form.gtm.useCases
          : [],
      },
      evalSuites: agent?.evalSuites ?? initial?.evalSuites ?? [],
    };

    try {
      const url =
        mode === "create"
          ? "/api/agents"
          : `/api/agents/${agent!.slug}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }
      const saved = await res.json();
      router.push(`/agents/${saved.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function updateScore(key: keyof TechnicalScores, value: number) {
    setForm((f) => ({
      ...f,
      technicalScores: { ...f.technicalScores, [key]: value },
    }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Basic Info</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Icon (emoji)" value={form.icon} onChange={(v) => setForm({ ...form, icon: v })} />
          <Field label="Version" value={form.version} onChange={(v) => setForm({ ...form, version: v })} />
          <Field label="Owner" value={form.owner} onChange={(v) => setForm({ ...form, owner: v })} />
          <Field label="Team" value={form.team} onChange={(v) => setForm({ ...form, team: v })} />
          <Field label="Tags (comma-separated)" value={form.tags} onChange={(v) => setForm({ ...form, tags: v })} />
          <div className="sm:col-span-2">
            <Field
              label="Repository URL"
              value={form.repoUrl}
              onChange={(v) => setForm({ ...form, repoUrl: v })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as Agent["category"] })}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="customer-support">Customer Support</option>
              <option value="sales">Sales & GTM</option>
              <option value="engineering">Engineering</option>
              <option value="ops">Operations</option>
              <option value="research">Research</option>
              <option value="internal">Internal Tools</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Agent["status"] })}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="draft">Draft</option>
              <option value="beta">Beta</option>
              <option value="production">Production</option>
              <option value="deprecated">Deprecated</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <Field label="Short Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Long Description</label>
            <textarea
              value={form.longDescription}
              onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Technical Scores (0–100)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {(Object.keys(TECH_SCORE_LABELS) as (keyof TechnicalScores)[]).map((key) => (
            <div key={key}>
              <label className="mb-1 flex justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <span>{TECH_SCORE_LABELS[key]}</span>
                <span>{form.technicalScores[key]}</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={form.technicalScores[key]}
                onChange={(e) => updateScore(key, Number(e.target.value))}
                className="w-full"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GTM Info</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Field
            label="Tagline"
            value={form.gtm.tagline}
            onChange={(v) => setForm({ ...form, gtm: { ...form.gtm, tagline: v } })}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Value Proposition</label>
            <textarea
              value={form.gtm.valueProposition}
              onChange={(e) => setForm({ ...form, gtm: { ...form.gtm, valueProposition: e.target.value } })}
              rows={2}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <Field
            label="Target Audience (comma-separated)"
            value={Array.isArray(form.gtm.targetAudience) ? form.gtm.targetAudience.join(", ") : ""}
            onChange={(v) =>
              setForm({
                ...form,
                gtm: { ...form.gtm, targetAudience: v.split(",").map((s) => s.trim()).filter(Boolean) as unknown as GTMInfo["targetAudience"] },
              })
            }
          />
          <Field
            label="Use Cases (comma-separated)"
            value={Array.isArray(form.gtm.useCases) ? form.gtm.useCases.join(", ") : ""}
            onChange={(v) =>
              setForm({
                ...form,
                gtm: { ...form.gtm, useCases: v.split(",").map((s) => s.trim()).filter(Boolean) as unknown as GTMInfo["useCases"] },
              })
            }
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Save Agent
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
    </div>
  );
}
