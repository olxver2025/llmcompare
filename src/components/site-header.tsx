import Link from "next/link";
import type { Model } from "@/data/types";
import { ModelSearch } from "@/components/model-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { SiteLogo } from "@/components/site-footer";

export function SiteHeader({ models }: { models: Model[] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-12 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <SiteLogo />
        <nav className="hidden items-center gap-4 text-sm md:flex">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            Catalog
          </Link>
          <Link
            href="/benchmarks"
            className="text-muted-foreground hover:text-foreground"
          >
            Benchmarks
          </Link>
          <Link
            href="/releases"
            className="text-muted-foreground hover:text-foreground"
          >
            Releases
          </Link>
          <Link
            href="/compare"
            className="text-muted-foreground hover:text-foreground"
          >
            Compare
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ModelSearch models={models} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
