import Link from "next/link";
import { DATA_FRESHNESS } from "@/lib/models";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="max-w-xl space-y-1">
          <p>
            <span className="font-semibold text-foreground">LLMcompare</span>
            {" "}
            is a curated static catalog. Data refreshed{" "}
            <time
              dateTime={DATA_FRESHNESS}
              className="font-mono tabular-nums text-foreground/80"
            >
              {DATA_FRESHNESS}
            </time>
            . Scores omitted when unverifiable. Not affiliated with model
            providers.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <Link href="/image" className="hover:text-foreground hover:underline">
            Image models
          </Link>
          <Link href="/video" className="hover:text-foreground hover:underline">
            Video models
          </Link>
          <Link href="/benchmarks" className="hover:text-foreground hover:underline">
            Benchmarks
          </Link>
          <Link href="/releases" className="hover:text-foreground hover:underline">
            Releases
          </Link>
          <Link href="/compare" className="hover:text-foreground hover:underline">
            Compare
          </Link>
          <Link href="/api/docs" className="hover:text-foreground hover:underline">
            API
          </Link>
          <Link href="/terms" className="hover:text-foreground hover:underline">
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="hover:text-foreground hover:underline"
          >
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export function SiteLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-baseline gap-0 font-semibold tracking-tight ${className ?? ""}`}
    >
      <span className="text-foreground">LLM</span>
      <span className="text-open">compare</span>
    </Link>
  );
}
