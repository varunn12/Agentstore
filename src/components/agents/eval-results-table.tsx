import type { EvalSuite } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export function EvalResultsTable({ suites }: { suites: EvalSuite[] }) {
  if (suites.length === 0) {
    return (
      <p className="text-sm text-zinc-500">No eval suites configured yet.</p>
    );
  }

  return (
    <div className="space-y-6">
      {suites.map((suite) => (
        <Card key={suite.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{suite.name}</CardTitle>
                <p className="mt-1 text-sm text-zinc-500">{suite.description}</p>
              </div>
              <Badge
                variant={
                  suite.passRate >= 80
                    ? "success"
                    : suite.passRate >= 60
                      ? "warning"
                      : "danger"
                }
              >
                {suite.passRate}% pass rate
              </Badge>
            </div>
            <div className="mt-3 flex gap-4 text-xs text-zinc-500">
              <span>
                {suite.passedCases}/{suite.totalCases} cases passed
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last run {formatDate(suite.lastRunAt)}
              </span>
            </div>
          </CardHeader>
          {suite.cases.length > 0 && (
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 text-left text-xs text-zinc-500 dark:border-zinc-800">
                      <th className="pb-2 pr-4 font-medium">Case</th>
                      <th className="pb-2 pr-4 font-medium">Category</th>
                      <th className="pb-2 pr-4 font-medium">Score</th>
                      <th className="pb-2 pr-4 font-medium">Latency</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suite.cases.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-zinc-50 dark:border-zinc-800/50"
                      >
                        <td className="py-3 pr-4">
                          <div className="font-medium text-zinc-900 dark:text-zinc-100">
                            {c.name}
                          </div>
                          {c.notes && (
                            <div className="mt-0.5 text-xs text-zinc-500">
                              {c.notes}
                            </div>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant="outline">{c.category}</Badge>
                        </td>
                        <td className="py-3 pr-4 font-mono text-zinc-700 dark:text-zinc-300">
                          {c.score ?? "—"}
                        </td>
                        <td className="py-3 pr-4 font-mono text-zinc-500">
                          {c.latencyMs ? `${c.latencyMs}ms` : "—"}
                        </td>
                        <td className="py-3">
                          {c.passed ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
