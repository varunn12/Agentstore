import type { GTMInfo } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { getScoreBarColor } from "@/lib/scoring";
import { formatDate } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

export function GTMReadiness({ gtm, readinessPercent }: { gtm: GTMInfo; readinessPercent: number }) {
  const completed = gtm.readinessChecklist.filter((i) => i.completed).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>GTM Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              {gtm.tagline}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {gtm.valueProposition}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Target Audience
              </h4>
              <ul className="space-y-1">
                {gtm.targetAudience.map((a) => (
                  <li key={a} className="text-sm text-zinc-700 dark:text-zinc-300">
                    · {a}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Use Cases
              </h4>
              <ul className="space-y-1">
                {gtm.useCases.map((u) => (
                  <li key={u} className="text-sm text-zinc-700 dark:text-zinc-300">
                    · {u}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex gap-6 text-sm">
            {gtm.pricingTier && (
              <div>
                <span className="text-zinc-500">Pricing: </span>
                <span className="font-medium">{gtm.pricingTier}</span>
              </div>
            )}
            {gtm.launchDate && (
              <div>
                <span className="text-zinc-500">Launch: </span>
                <span className="font-medium">{formatDate(gtm.launchDate)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Launch Readiness</CardTitle>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {completed}/{gtm.readinessChecklist.length} complete
            </span>
          </div>
          <ProgressBar
            value={readinessPercent}
            barClassName={getScoreBarColor(readinessPercent)}
            className="mt-3"
          />
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {gtm.readinessChecklist.map((item) => (
              <li key={item.item} className="flex items-center gap-2 text-sm">
                {item.completed ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600" />
                )}
                <span
                  className={
                    item.completed
                      ? "text-zinc-700 dark:text-zinc-300"
                      : "text-zinc-500"
                  }
                >
                  {item.item}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
