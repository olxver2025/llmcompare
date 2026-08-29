import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { ImageModel, Model, VideoModel } from "@/data/types";
import { ModelSearch } from "@/components/model-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { SiteLogo } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SiteHeader({
  models,
  imageModels,
  videoModels,
}: {
  models: Model[];
  imageModels?: ImageModel[];
  videoModels?: VideoModel[];
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-12 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <SiteLogo />
        <nav className="hidden items-center gap-4 text-sm md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-auto gap-1 px-0 py-0 text-sm font-normal text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                Catalog
                <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <Link href="/#catalog">LLMs</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/image">Image</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/video">Video</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link
            href="/benchmarks"
            className="text-muted-foreground hover:text-foreground"
          >
            Benchmarks
          </Link>
          <Link
            href="/organizations"
            className="text-muted-foreground hover:text-foreground"
          >
            Organizations
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
          <Link
            href="/api/docs"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            API
          </Link>
          <ModelSearch
            models={models}
            imageModels={imageModels}
            videoModels={videoModels}
          />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
