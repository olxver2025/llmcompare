import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: 2026-08-14</p>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          LLMcompare is a static reference site. Content is provided for
          informational and educational purposes only. Benchmark scores and prices change often;
          verify critical numbers with primary sources before you rely on them.
        </p>
        <p>
          The site uses aggregate, cookie-free analytics to measure traffic.
          Browsing the site constitutes consent to that tracking; see the{" "}
          <Link href="/privacy" className="text-open underline-offset-4 hover:underline">
            Privacy Policy
          </Link>{" "}
          for details.
        </p>
        <p>
          You may browse and share links to pages on this site. You may not
          scrape the site in a way that impairs availability, or misrepresent
          the data as an official statement from any model provider.
        </p>
        <p>
          The site is not affiliated with OpenAI, Anthropic, Google, xAI, Meta,
          Cursor, or any other provider listed in the catalog.
        </p>
        <p>
          The software and dataset are offered as-is, without warranty of any
          kind. We are not liable for decisions you make based on this catalog.
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
