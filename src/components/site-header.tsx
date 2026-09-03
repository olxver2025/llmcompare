"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import type { ImageModel, Model, VideoModel } from "@/data/types";
import { ModelSearch } from "@/components/model-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { SiteLogo } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const PRIMARY_NAV = [
  { href: "/#catalog", label: "LLMs", match: "/" },
  { href: "/image", label: "Image", match: "/image" },
  { href: "/video", label: "Video", match: "/video" },
  { href: "/benchmarks", label: "Benchmarks", match: "/benchmarks" },
  { href: "/releases", label: "Releases", match: "/releases" },
  { href: "/compare", label: "Compare", match: "/compare" },
] as const;

const SECONDARY_NAV = [
  { href: "/organizations", label: "Organizations" },
  { href: "/api/docs", label: "API" },
] as const;

function navActive(pathname: string, match: string) {
  if (match === "/") return pathname === "/";
  return pathname === match || pathname.startsWith(`${match}/`);
}

function NavLink({
  href,
  match,
  children,
  onClick,
  className,
}: {
  href: string;
  match?: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const active = match ? navActive(pathname, match) : pathname === href;
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "text-sm underline-offset-4 hover:text-foreground",
        active ? "text-foreground" : "text-muted-foreground",
        className
      )}
    >
      {children}
    </Link>
  );
}

function MobileNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton
        className="top-0 left-0 h-dvh max-h-dvh w-72 max-w-[85vw] translate-x-0 translate-y-0 rounded-none border-y-0 border-l-0 sm:max-w-xs data-open:zoom-in-100 data-closed:zoom-out-100"
      >
        <DialogHeader>
          <DialogTitle className="sr-only">Site menu</DialogTitle>
          <SiteLogo />
        </DialogHeader>
        <nav className="flex flex-col gap-1">
          {PRIMARY_NAV.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              match={item.match}
              onClick={close}
              className="px-1 py-2 text-base"
            >
              {item.label}
            </NavLink>
          ))}
          <div className="my-2 border-t border-border" />
          {SECONDARY_NAV.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              onClick={close}
              className="px-1 py-2 text-base"
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </DialogContent>
    </Dialog>
  );
}

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
      <div className="mx-auto flex h-12 max-w-7xl items-center gap-4 px-4 sm:gap-6 sm:px-6">
        <SiteLogo />
        <nav className="hidden items-center gap-3 text-sm md:flex lg:gap-4">
          {PRIMARY_NAV.map((item) => (
            <NavLink key={item.href} href={item.href} match={item.match}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/api/docs"
            className="hidden text-sm text-muted-foreground hover:text-foreground md:inline"
          >
            API
          </Link>
          <ModelSearch
            models={models}
            imageModels={imageModels}
            videoModels={videoModels}
          />
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
