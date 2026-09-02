import aider from "./aider.mjs";
import swebench from "./swebench.mjs";
import sweRebench from "./swe-rebench.mjs";
import { adapters as localAdapters } from "./local.mjs";

// `llm` adapters fetch live leaderboards and run by default; `local` adapters read
// snapshots under benchmarks/ and must be selected explicitly with --source.
export const adapters = [aider, swebench, sweRebench, ...localAdapters];

export function getAdapters(names = []) {
  if (names.length === 0) return adapters.filter((adapter) => adapter.catalog === "llm");
  const unknown = names.filter((name) => !adapters.some((adapter) => adapter.name === name));
  if (unknown.length > 0) {
    throw new Error(
      `Unknown source(s): ${unknown.join(", ")}. Available: ${adapters.map((adapter) => adapter.name).join(", ")}`
    );
  }
  return adapters.filter((adapter) => names.includes(adapter.name));
}
