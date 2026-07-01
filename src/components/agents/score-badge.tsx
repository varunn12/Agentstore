import { getScoreGrade } from "@/lib/scoring";
import { cn } from "@/lib/utils";

export function ScoreBadge({
  score,
  size = "md",
  label,
}: {
  score: number;
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const { grade, color } = getScoreGrade(score);
  const sizes = {
    sm: "h-10 w-10 text-sm",
    md: "h-14 w-14 text-lg",
    lg: "h-20 w-20 text-2xl",
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "flex items-center justify-center rounded-full border-2 font-bold",
          sizes[size],
          score >= 80
            ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950"
            : score >= 60
              ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
              : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950",
          color,
        )}
      >
        {score}
      </div>
      {label && (
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
      )}
      <span className={cn("text-xs font-medium", color)}>Grade {grade}</span>
    </div>
  );
}
