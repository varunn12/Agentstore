"use client";

import { TECH_SCORE_LABELS } from "@/lib/scoring";
import type { TechnicalScores } from "@/lib/types";
import { ProgressBar } from "@/components/ui/progress";
import { getScoreBarColor } from "@/lib/scoring";

export function TechScoreChart({ scores }: { scores: TechnicalScores }) {
  const entries = Object.entries(scores) as [keyof TechnicalScores, number][];

  return (
    <div className="space-y-4">
      {entries.map(([key, value]) => (
        <div key={key}>
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">
              {TECH_SCORE_LABELS[key]}
            </span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {value}
            </span>
          </div>
          <ProgressBar value={value} barClassName={getScoreBarColor(value)} />
        </div>
      ))}
    </div>
  );
}
