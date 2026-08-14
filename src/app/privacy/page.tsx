import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: 2026-08-14</p>
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
        <p>
          Aggregate web traffic is measured with{" "}
          <a
            href="https://vercel.com/docs/analytics"
            className="text-open underline-offset-4 hover:underline"
          >
            Vercel Web Analytics
          </a>
          , which runs without cookies. It records anonymous, aggregated
          statistics about visits, such as pages viewed, referrer, approximate
          geographic region, device type, and browser/operating system. Visitors
          are identified by a hashed identifier that is valid for a single day
          and is not linked across days or across websites; no personal
          identifiers or IP addresses are associated with individual visitors.
          You can read the{" "}
          <a
            href="https://vercel.com/legal/privacy-policy"
            className="text-open underline-offset-4 hover:underline"
          >
            Vercel privacy notice
          </a>{" "}
          for details.
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
