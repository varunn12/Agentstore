import Link from "next/link";
import {
  LayoutGrid,
  BarChart3,
  GitCompare,
  Plus,
  BookOpen,
  Bot,
  Trophy,
  Info,
} from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            AS
          </div>
          <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Agent Store
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <LayoutGrid className="h-4 w-4" />
            Catalog
          </Link>
          <Link
            href="/compare"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <GitCompare className="h-4 w-4" />
            Compare
          </Link>
          <Link
            href="/builders"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <Trophy className="h-4 w-4" />
            Builders
          </Link>
          <Link
            href="/about"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <Info className="h-4 w-4" />
            About
          </Link>
          <Link
            href="/what-is-an-agent"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <Bot className="h-4 w-4" />
            What is an Agent?
          </Link>
          <Link
            href="/scoring"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <BookOpen className="h-4 w-4" />
            Scoring
          </Link>
          <Link
            href="/agents/add"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
          >
            <Plus className="h-4 w-4" />
            Add Agent
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
