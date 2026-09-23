// MIT, Copyright (c) 2026 T3 Tools Inc. See LICENSE and docs/provider-provenance.json.
export function parseGenericCliVersion(output: string): string | null {
  // "opencode v2.0.3"-style output: the optional "v" has to be consumed first,
  // since "v2" itself contains no word boundary.
  const match = output.match(/\bv?(\d+\.\d+\.\d+)\b/);
  return match?.[1] ?? null;
}
