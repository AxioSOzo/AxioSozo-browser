// MIT, Copyright (c) 2026 T3 Tools Inc. See LICENSE and docs/provider-provenance.json.
export function defaultProviderContinuationIdentity(input: {
  readonly driverKind: string;
  readonly instanceId: string;
}) {
  return {
    driverKind: input.driverKind,
    continuationKey: `${input.driverKind}:instance:${input.instanceId}`,
  };
}
