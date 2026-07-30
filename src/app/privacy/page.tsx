import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: 2026-07-29</p>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          LLMcompare is a static site. It does not require an account and does
          not collect personal information through forms on these pages.
        </p>
        <p>
          Theme preference may be stored in your browser via{" "}
          <code className="font-mono text-xs">localStorage</code> so light or
          dark mode can persist between visits. That data stays on your device.
        </p>
      </div>
      <p className="mt-10 text-sm">
        <Link href="/" className="text-open underline-offset-4 hover:underline">
          Back to catalog
        </Link>
      </p>
    </div>
  );
}
