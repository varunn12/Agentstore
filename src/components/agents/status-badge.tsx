import type { AgentStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

const statusVariant: Record<
  AgentStatus,
  "default" | "primary" | "success" | "warning" | "danger"
> = {
  draft: "default",
  beta: "warning",
  production: "success",
  deprecated: "danger",
};

export function StatusBadge({ status }: { status: AgentStatus }) {
  return (
    <Badge variant={statusVariant[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
