import type { Metadata } from "next";
import Link from "next/link";
import { API_BASE_PATH, API_VERSION } from "@/lib/api";
import { DATA_FRESHNESS } from "@/lib/models";

export const metadata: Metadata = {
  title: "API Documentation",
  description:
    "Read-only REST API for the LLMcompare catalog: models, image and video models, benchmarks, releases, organizations, and comparisons.",
};

const codeInline = "font-mono text-xs";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-16">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto border border-border bg-muted/40 p-3 font-mono text-xs leading-relaxed text-foreground">
      {children}
    </pre>
  );
}

function DocTable({
  head,
  rows,
}: {
  head: [string, string];
  rows: [React.ReactNode, React.ReactNode][];
}) {
  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {head[0]}
            </th>
            <th className="px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {head[1]}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map(([first, second], i) => (
            <tr key={i}>
              <td className="px-3 py-2 align-top font-mono text-xs text-foreground">
                {first}
              </td>
              <td className="px-3 py-2 align-top text-muted-foreground">
                {second}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EndpointGroup({
  title,
  endpoints,
}: {
  title: string;
  endpoints: [string, string][];
}) {
  return (
    <div>
      <h3 className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="mt-2">
        <DocTable
          head={["Endpoint", "Description"]}
          rows={endpoints.map(([path, description]) => [
            <span key={path} className="whitespace-nowrap">
              <span className="mr-2 text-muted-foreground">GET</span>
              {path}
            </span>,
            description,
          ])}
        />
      </div>
    </div>
  );
}

export default function ApiDocsPage() {
  const envelopeExample = `{
  "data": [ … ],
  "meta": {
    "apiVersion": "${API_VERSION}",
    "dataFreshness": "${DATA_FRESHNESS}",
    "page": 1,
    "limit": 50,
    "total": …,
    "pageCount": …,
    "hasNextPage": true,
    "hasPreviousPage": false,
    "query": { … },
    "facets": { … }
  }
}`;

  const errorExample = `{
  "error": {
    "code": "NOT_FOUND",
    "message": "Model 'gpt-99' was not found.",
    "details": { "resource": "model", "value": "gpt-99" }
  },
  "meta": {
    "apiVersion": "${API_VERSION}",
    "dataFreshness": "${DATA_FRESHNESS}"
  }
}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">API Documentation</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        LLMcompare exposes the catalog as a read-only REST API. It serves the
        same curated data as the site: model specifications, pricing, context
        windows, benchmarks, releases, organizations, and comparisons.
      </p>

      <div className="mt-10 space-y-10">
        <Section id="overview" title="Overview">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Read-only: <span className={codeInline}>GET</span>,{" "}
              <span className={codeInline}>HEAD</span>, and{" "}
              <span className={codeInline}>OPTIONS</span> only. No
              authentication or API keys required.
            </li>
            <li>
              CORS is open: responses are sent with{" "}
              <span className={codeInline}>Access-Control-Allow-Origin: *</span>{" "}
              so you can call the API from any client.
            </li>
            <li>
              Responses are cacheable for 60 seconds in browsers and one hour in
              shared caches, with one day of stale-while-revalidate.
            </li>
            <li>
              The catalog is a static, hand-curated snapshot. Every response
              carries <span className={codeInline}>meta.dataFreshness</span>,
              the date the data was last refreshed.
            </li>
          </ul>
        </Section>

        <Section id="base-url" title="Base URL">
          <p>
            All versioned endpoints live under{" "}
            <span className={codeInline}>{API_BASE_PATH}</span>:
          </p>
          <CodeBlock>{API_BASE_PATH}</CodeBlock>
          <p>
            The machine-readable index at{" "}
            <span className={codeInline}>{API_BASE_PATH}</span> lists every
            endpoint with catalog statistics, and{" "}
            <a
              href="/api/openapi.json"
              className="text-open underline-offset-4 hover:underline"
            >
              <span className={codeInline}>/api/openapi.json</span>
            </a>{" "}
            serves an OpenAPI 3.1 description of the API.
          </p>
        </Section>

        <Section id="envelope" title="Response envelope">
          <p>
            Every successful response is wrapped in a common envelope:{" "}
            <span className={codeInline}>data</span> holds the payload and{" "}
            <span className={codeInline}>meta</span> holds API version, data
            freshness, and endpoint-specific fields.
          </p>
          <CodeBlock>{envelopeExample}</CodeBlock>
          <p>
            For list endpoints, <span className={codeInline}>meta</span> also
            includes pagination, an echo of the applied query, and filter
            facets:
          </p>
          <DocTable
            head={["meta field", "Meaning"]}
            rows={[
              [
                "page, limit, total, pageCount",
                "Pagination state. Defaults: page 1, limit 50 (maximum 250).",
              ],
              [
                "hasNextPage, hasPreviousPage",
                "Convenience flags for walking pages.",
              ],
              [
                "query",
                "Echo of the applied filters, sort, and order.",
              ],
              [
                "facets",
                "Available filter values: organizations, families, modalities, and benchmarks for models; organizations for image and video models.",
              ],
              [
                "related",
                "On GET /models/{slug} only: same-family models, newest first.",
              ],
            ]}
          />
        </Section>

        <Section id="errors" title="Errors">
          <p>
            Errors use a parallel envelope with an{" "}
            <span className={codeInline}>error</span> object instead of{" "}
            <span className={codeInline}>data</span>. Validation failures return
            400; unknown slugs or IDs return 404.
          </p>
          <CodeBlock>{errorExample}</CodeBlock>
          <DocTable
            head={["code", "Status and meaning"]}
            rows={[
              [
                "INVALID_QUERY",
                "400 — a query parameter failed validation; details names the offending parameter.",
              ],
              [
                "MISSING_QUERY",
                "400 — a required query parameter is missing (compare endpoints).",
              ],
              [
                "INVALID_COMPARE",
                "400 — an image or video comparison mixed catalogs; both slugs must belong to the same kind.",
              ],
              [
                "NOT_FOUND",
                "404 — the requested slug, benchmark ID, or comparison does not exist.",
              ],
              [
                "INTERNAL_ERROR",
                "500 — an unexpected server failure.",
              ],
            ]}
          />
        </Section>

        <Section id="endpoints" title="Endpoints">
          <p>
            Paths below are relative to{" "}
            <span className={codeInline}>{API_BASE_PATH}</span>. Braces mark
            path parameters.
          </p>
          <div className="space-y-6">
            <EndpointGroup
              title="Models"
              endpoints={[
                ["/models", "List models with search, filters, sorting, and pagination."],
                ["/models/{slug}", "One model, including specs, pricing, and benchmark scores; meta.related lists same-family models."],
                ["/models/{slug}/related", "The related models array only."],
              ]}
            />
            <EndpointGroup
              title="Image models"
              endpoints={[
                ["/image-models", "List image models with search, filters, sorting, and pagination."],
                ["/image-models/{slug}", "One image model."],
                ["/image-models/compare?a={slug}&b={slug}", "Compare two image models. Both slugs must be image models; mixed kinds return 400."],
                ["/image-models/compare/{a}-vs-{b}", "The same comparison addressed by its canonical slug."],
              ]}
            />
            <EndpointGroup
              title="Video models"
              endpoints={[
                ["/video-models", "List video models with search, filters, sorting, and pagination."],
                ["/video-models/{slug}", "One video model."],
                ["/video-models/compare?a={slug}&b={slug}", "Compare two video models. Both slugs must be video models; mixed kinds return 400."],
                ["/video-models/compare/{a}-vs-{b}", "The same comparison addressed by its canonical slug."],
              ]}
            />
            <EndpointGroup
              title="Benchmarks"
              endpoints={[
                ["/benchmarks", "Every benchmark with methodology, category, metric, top models, and scored counts."],
                ["/benchmarks/{id}", "One benchmark with its top-10 ranking."],
              ]}
            />
            <EndpointGroup
              title="Organizations and releases"
              endpoints={[
                ["/organizations", "Organization summaries derived from the catalog."],
                ["/releases", "Models sorted by release date (newest first by default); accepts the same query parameters as /models."],
              ]}
            />
            <EndpointGroup
              title="Comparisons"
              endpoints={[
                ["/compare?a={slug}&b={slug}", "Compare two models: verdict and per-dimension breakdown."],
                ["/compare/{a}-vs-{b}", "The same comparison addressed by its canonical slug."],
              ]}
            />
            <EndpointGroup
              title="Index and schema"
              endpoints={[
                [`${API_BASE_PATH}`, "Machine-readable index with catalog statistics and endpoint paths."],
                ["/api/openapi.json", "OpenAPI 3.1 description of the API."],
              ]}
            />
          </div>
        </Section>

        <Section id="query-parameters" title="Query parameters">
          <p>
            <span className={codeInline}>/models</span> and{" "}
            <span className={codeInline}>/releases</span> accept:
          </p>
          <DocTable
            head={["parameter", "Meaning"]}
            rows={[
              [
                "q",
                "Free-text search across name, organization, slug, and summary. Maximum 200 characters.",
              ],
              [
                "organization (alias: org)",
                "Exact organization name, e.g. Google. See meta.facets.organizations for valid values.",
              ],
              [
                "family",
                "Product-line family ID, e.g. gemini. See meta.facets.families.",
              ],
              [
                "openSource",
                "true or false (1 and 0 are accepted). license=open and license=closed are aliases.",
              ],
              [
                "modality",
                "text, image, audio, or video; matches input or output modalities.",
              ],
              [
                "benchmark",
                "A benchmark ID, e.g. swe-bench-verified. Keeps only models that have a score for it.",
              ],
              [
                "minScore",
                "Numeric floor applied to the benchmark parameter. Requires benchmark to be set.",
              ],
              [
                "sort",
                "name, organization, releaseDate, contextWindow, inputPrice, outputPrice, tokensPerSec, slug, or any benchmark ID. Defaults to lmarena-elo. Models without a value sort last.",
              ],
              ["order", "asc or desc. Defaults to desc."],
              ["page", "Page number, starting at 1."],
              ["limit", "Results per page, between 1 and 250. Defaults to 50."],
            ]}
          />
          <p>
            <span className={codeInline}>/image-models</span> and{" "}
            <span className={codeInline}>/video-models</span> accept a smaller
            set:
          </p>
          <DocTable
            head={["parameter", "Meaning"]}
            rows={[
              [
                "q",
                "Free-text search across name, organization, slug, and summary.",
              ],
              [
                "organization (alias: org)",
                "Exact organization name. See meta.facets.organizations.",
              ],
              [
                "openSource",
                "true or false, with the same license aliases as /models.",
              ],
              [
                "sort",
                "name, organization, releaseDate, slug, price, or elo. Defaults to elo.",
              ],
              ["order", "asc or desc. Defaults to desc."],
              ["page, limit", "Same pagination behavior as /models."],
            ]}
          />
        </Section>

        <Section id="examples" title="Examples">
          <CodeBlock>{`# Five highest-scoring models on SWE-bench Verified
GET ${API_BASE_PATH}/models?benchmark=swe-bench-verified&limit=5

# Open-weight Google models, largest context window first
GET ${API_BASE_PATH}/models?organization=Google&openSource=true&sort=contextWindow

# One model, with same-family related models in meta
GET ${API_BASE_PATH}/models/claude-opus-5

# Compare two models, or address the comparison by canonical slug
GET ${API_BASE_PATH}/compare?a=claude-opus-5&b=gpt-5-6-sol
GET ${API_BASE_PATH}/compare/claude-opus-5-vs-gpt-5-6-sol`}</CodeBlock>
          <p>
            The same calls work from a local dev server with curl, for example:
          </p>
          <CodeBlock>{`curl -s "http://localhost:3000${API_BASE_PATH}/models?benchmark=swe-bench-verified&limit=5"`}</CodeBlock>
        </Section>

        <Section id="data-notes" title="Data notes">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Values that cannot be verified from a trustworthy source are
              omitted rather than estimated. Treat absent fields as unknown,
              never as zero.
            </li>
            <li>
              Benchmark scores keep each benchmark&apos;s native metric and
              version, so scores with the same name are not always comparable
              across benchmark variants. Check the benchmark metadata returned
              by <span className={codeInline}>/benchmarks</span> before
              comparing.
            </li>
            <li>
              Some coding benchmarks evaluate an agent system (scaffold, tools,
              harness) rather than a raw model; the benchmark metadata notes
              this where relevant.
            </li>
            <li>
              Prices and specifications are point-in-time observations. Verify
              critical numbers with the provider before relying on them.
            </li>
          </ul>
        </Section>
      </div>

      <p className="mt-12 text-sm">
        <Link href="/" className="text-open underline-offset-4 hover:underline">
          Back to catalog
        </Link>
      </p>
    </div>
  );
}
