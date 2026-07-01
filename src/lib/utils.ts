import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export const CATEGORY_LABELS: Record<string, string> = {
  "customer-support": "Customer Support",
  sales: "Sales & GTM",
  engineering: "Engineering",
  ops: "Operations",
  research: "Research",
  internal: "Internal Tools",
};

export const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  beta: "Beta",
  production: "Production",
  deprecated: "Deprecated",
};
