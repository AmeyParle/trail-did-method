# TRAIL Conformance Test Suite

Portable JSON test vectors + a self-contained Node.js harness that lets external
implementers verify that their `did:trail` implementation matches the
[TRAIL DID Method Specification](../../spec/did-method-trail-v1.md).

## Scope

| Directory | Spec Section | What it checks |
|-----------|--------------|----------------|
| `did-creation/` | §4 (DID Method Syntax), §4.5 (Identifier Normalization) | DID syntax, slug normalization, 16-hex `trail-hash` derivation |
| `did-resolution/` | §6.2 (Read/Resolve) | Resolution result envelope, `@context` ordering, error codes |
| `revocation/` | §8.7 (Status List) | `BitstringStatusListEntry` shape, `statusPurpose` enum, bit semantics (0=active, 1=revoked) |
| `trust-score/` | §7.3 (Trust Score), §7.2.5 (Probationary Tier) | Weighted aggregation over the five §7.3.1 dimensions, maturity multiplier, anomaly penalty and flag threshold, probationary cap |

## Layout

```
tests/conformance/
├── harness.mjs                     # Node.js runner, no external deps
├── README.md                       # this file
├── did-creation/{valid,invalid}/   # JSON test vectors
├── did-resolution/{valid,invalid}/
├── revocation/{valid,invalid}/
└── trust-score/{valid,invalid}/
```

### Relationship to `validation/fixtures/`

The repository holds test vectors in two places. The split is deliberate:

| | `tests/conformance/` (this directory) | `validation/fixtures/` |
|---|---|---|
| **Purpose** | Spec vectors — check that an implementation follows the normative rules | Implementation vectors — check that `trail-core` produces and verifies real artifacts |
| **What it needs** | Nothing but Node built-ins | Signature verification, therefore a crypto implementation |
| **Runner** | `harness.mjs`, which reimplements the spec rules independently | The `trail-core` test suite, which exercises the library itself |
| **Layout** | `<scope>/{valid,invalid}/` | flat |

The separation is the point: the harness validates the specification *without*
importing `trail-core`, so an implementation bug cannot make the conformance
suite agree with it. Anything requiring signature verification belongs in
`validation/fixtures/` and the implementation suite, not here — putting it here
would mean importing `trail-core` (losing that independence) or reimplementing
JCS and Ed25519 inside the harness.

Each vector is a single JSON file with at least:

```json
{
  "scope": "<scope-name>",
  "section": "§X.Y reference into spec",
  "expected": "valid" | "invalid",
  "description": "human-readable explanation",
  "input": { /* implementation input */ },
  "output": { /* expected output, valid only */ } |
  "expectedError": { /* expected error envelope, invalid only */ }
}
```

## Running the Suite

From the repository root:

```bash
node tests/conformance/harness.mjs
```

Run a single scope:

```bash
node tests/conformance/harness.mjs --scope=did-creation
```

The harness exits `0` if every vector passes and `1` if any fails. It uses only
Node built-ins (`node:crypto`, `node:fs`, `node:path`) and works on any
Node ≥ 18.

## Test Semantics

- **`valid/*`** — When you feed `input` into your implementation, it MUST produce
  exactly `output`. Any deviation (different slug, different hash, missing
  context) is a conformance violation.
- **`invalid/*`** — Your implementation MUST reject `input` with the documented
  `expectedError`. Accepting a non-conformant input or returning a different
  error code is a conformance violation.

### Documentation-Only Vectors

Two `did-resolution/invalid/` vectors document expected error responses that
depend on registry state (e.g. `notFound`). The harness verifies the
well-formedness of the documented error envelope but cannot exercise the
runtime behaviour without a live registry. Implementers SHOULD mirror the same
behaviour in their integration tests.

## Reference Behaviour

The harness implements one reference path per scope, derived directly from the
spec:

- **DID creation** — slug normalization, SHA-256(slug + ':' + publicKeyMultibase),
  16-hex truncation, regex-validated DID string.
- **DID resolution** — `@context` array shape, `verificationMethod` cardinality,
  resolution metadata `contentType`.
- **Revocation** — required fields enumerated in §8.7,
  `statusPurpose ∈ {revocation, suspension}`, bit-at-index → revoked boolean.
- **Trust Score** — the §7.3.2 aggregation pipeline in full:
  `S_raw = Σ(wi × di) / 100` over the five §7.3.1 dimensions with the normative
  integer weights (25 / 25 / 20 / 20 / 10), the §7.3.8 maturity multiplier
  `m = min(1, age_days / 180)`, the §7.3.7 anomaly penalty `p = min(1, Σ contributions)`
  with the `p ≥ 0.5` flagging threshold, and the §7.2.5 probationary cap
  `round(50 + 50 × min(1, verified_interactions / 100))`, which lifts only when the
  DID has both ≥ 100 verified interactions and ≥ 30 days of age. Dimension scores
  are range-checked on `[0, 100]`, required to be integers, and the §7.3.1 dimension
  names are treated as normative. Per §7.3.10, Tier 0 DIDs do not participate in the
  trust score system, so a Tier 0 subject carrying a score is rejected.

  Published trust score values are integers on 0–100 (§7.3.2, following the §14.5
  numeric constraint). Aggregation runs over the **published** integer dimension
  scores, not the unrounded ratios, so a verifier recomputing from §7.3.3 metadata
  reproduces the published `overall` exactly; only the maturity and anomaly
  multiplication is carried at full precision and rounded half-up once at the end.

## Spec-Versions Notes

These vectors target spec **v1.3.0-draft** (current). If you find a vector that
disagrees with a published normative statement of the spec, please open an
issue — the spec is authoritative, the suite is illustrative.

The trust score moved from a 0.0–1.0 fraction to an integer on 0–100 in
v1.3.0-draft. Three arithmetic defects in the examples were fixed in the same
change, all of them surfaced by this harness once it was reconciled with §7.3 and
put under CI: `overall: 0.87` was not reachable from the dimension scores shown
beside it, `identityVerification: 0.95` was not reachable from the D1 formula at
all, and the §7.2.5 probationary example showed a cap its own formula does not
produce. `trust-score/invalid/05-fractional-dimension.json` keeps the old
fractional shape as a rejection case.

## Adding New Vectors

1. Place a new JSON file under the appropriate scope and `valid/` or `invalid/`
   subfolder.
2. Re-run the harness; ensure all checks pass.
3. Update this README's table if you are adding a new scope.

## License

Vectors and harness are released under the same license as the rest of the
repository (see [LICENSE](../../LICENSE)).
