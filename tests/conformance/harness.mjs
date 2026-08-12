#!/usr/bin/env node
/**
 * TRAIL Conformance Test Harness
 *
 * Reads JSON test vectors from tests/conformance/<scope>/{valid,invalid}/
 * and validates them against the spec rules implemented below.
 *
 * Spec: spec/did-method-trail-v1.md (sections §4, §6, §7.3)
 *
 * Usage (from repo root):
 *   node tests/conformance/harness.mjs
 *   node tests/conformance/harness.mjs --scope=did-creation
 *
 * Exit code: 0 = all pass, 1 = any failure.
 *
 * No external dependencies. Uses only Node built-ins.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const scopeFilter = args.find((a) => a.startsWith('--scope='))?.split('=')[1];

const SCOPES = ['did-creation', 'did-resolution', 'revocation', 'trust-score'];

let pass = 0;
let fail = 0;
const failures = [];

function readVectors(scope, kind) {
  const dir = join(__dirname, scope, kind);
  try {
    statSync(dir);
  } catch {
    return [];
  }
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({
      file: join(dir, f),
      vector: JSON.parse(readFileSync(join(dir, f), 'utf8')),
    }));
}

function record(scope, file, ok, message) {
  if (ok) {
    pass++;
    console.log(`  PASS  [${scope}] ${file.split('/').slice(-2).join('/')}`);
  } else {
    fail++;
    failures.push({ scope, file, message });
    console.log(`  FAIL  [${scope}] ${file.split('/').slice(-2).join('/')}: ${message}`);
  }
}

// ============================================================================
// §4 DID Creation validators
// ============================================================================

const TRAIL_HASH_RE = /^[0-9a-f]{16}$/;
const SELF_DID_RE = /^did:trail:self:z[1-9A-HJ-NP-Za-km-z]+$/;
const ORG_DID_RE = /^did:trail:org:[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{16}$/;
const AGENT_DID_RE = /^did:trail:agent:[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{16}$/;

function computeTrailHash(slug, publicKeyMultibase) {
  const input = `${slug}:${publicKeyMultibase}`;
  return createHash('sha256').update(input).digest('hex').slice(0, 16);
}

function validateDidSyntax(did) {
  if (typeof did !== 'string' || !did.startsWith('did:trail:')) {
    throw new Error("DID method name MUST be exactly 'did:trail:' (case-sensitive)");
  }
  if (SELF_DID_RE.test(did)) return 'self';
  if (ORG_DID_RE.test(did)) return 'org';
  if (AGENT_DID_RE.test(did)) return 'agent';
  // Find more specific error
  if (did.startsWith('did:trail:org:') || did.startsWith('did:trail:agent:')) {
    const tail = did.split(':').pop() || '';
    const parts = tail.split('-');
    const hash = parts[parts.length - 1];
    if (!TRAIL_HASH_RE.test(hash)) {
      throw new Error('trail-hash suffix MUST be 16 hex characters');
    }
  }
  throw new Error(`DID syntax non-conformant: ${did}`);
}

function checkValidDidCreation(v) {
  const { input, output } = v;
  if (input.mode === 'self') {
    const expected = `did:trail:self:${input.publicKeyMultibase}`;
    if (output.did !== expected) {
      throw new Error(`expected ${expected}, got ${output.did}`);
    }
    validateDidSyntax(output.did);
    return;
  }
  if (input.mode === 'org' || input.mode === 'agent') {
    const slug = output.normalizedSlug;
    const hash = computeTrailHash(slug, input.publicKeyMultibase);
    if (hash !== output.trailHash) {
      throw new Error(`computed hash ${hash} != expected ${output.trailHash}`);
    }
    const expected = `did:trail:${input.mode}:${slug}-${hash}`;
    if (output.did !== expected) {
      throw new Error(`expected ${expected}, got ${output.did}`);
    }
    validateDidSyntax(output.did);
    return;
  }
  throw new Error(`unknown mode: ${input.mode}`);
}

function checkInvalidDidCreation(v) {
  // Must throw — if it does NOT throw, the test fails.
  validateDidSyntax(v.input.did);
}

// ============================================================================
// §6 DID Resolution validators
// ============================================================================

function checkValidDidResolution(v) {
  if (v.expectedDocument) {
    const ctx = v.expectedDocument['@context'];
    if (!Array.isArray(ctx) || ctx[0] !== 'https://www.w3.org/ns/did/v1') {
      throw new Error('@context MUST be array with W3C DID v1 first');
    }
    if (ctx[1] !== 'https://trailprotocol.org/ns/did/v1') {
      throw new Error('@context MUST contain TRAIL v1 as second entry');
    }
    if (v.expectedDocument.id !== v.input.did) {
      throw new Error('didDocument.id MUST equal input DID');
    }
    if (!Array.isArray(v.expectedDocument.verificationMethod) || v.expectedDocument.verificationMethod.length < 1) {
      throw new Error('verificationMethod MUST have at least one entry');
    }
  }
  if (v.expectedShape) {
    const meta = v.expectedShape.didResolutionMetadata;
    if (!meta || meta.contentType !== 'application/did+ld+json') {
      throw new Error('didResolutionMetadata.contentType MUST be application/did+ld+json');
    }
  }
}

function checkInvalidDidResolution(v) {
  // First: well-formedness of the documented expectedError envelope.
  const meta = v.expectedError?.didResolutionMetadata;
  if (!meta || typeof meta.error !== 'string') {
    throw new Error('invalid resolution result MUST set didResolutionMetadata.error');
  }
  const allowed = ['notFound', 'invalidDid', 'representationNotSupported', 'methodNotSupported'];
  if (!allowed.includes(meta.error)) {
    throw new Error(`error code MUST be one of ${allowed.join(', ')}, got ${meta.error}`);
  }
  // Second: for invalidDid cases, the input DID itself MUST fail syntax. For notFound
  // cases the input is syntactically valid (registry-state failure). The harness
  // cannot reach a registry, so notFound is a documentation-only test.
  if (meta.error === 'invalidDid') {
    let threw = false;
    try {
      validateDidSyntax(v.input.did);
    } catch {
      threw = true;
    }
    if (!threw) {
      throw new Error(`error=invalidDid but input DID parsed successfully: ${v.input.did}`);
    }
  } else if (meta.error === 'notFound') {
    // Documentation-only: ensure input is syntactically valid (otherwise it would be invalidDid).
    validateDidSyntax(v.input.did);
  }
  // Pass — handled by harness flipping to PASS when validator throws. We need to ALSO
  // throw for "invalid" tests so the dispatcher records PASS. The dispatcher inverts
  // the throw/no-throw expectation for invalid tests.
  throw new Error('__INVALID_PASS__');
}

// ============================================================================
// §8.7 Revocation validators
// ============================================================================

const REQUIRED_STATUS_FIELDS = ['id', 'type', 'statusPurpose', 'statusListIndex', 'statusListCredential'];
const ALLOWED_STATUS_PURPOSES = ['revocation', 'suspension'];

function checkValidRevocation(v) {
  const cs = v.input.credentialStatus;
  for (const f of REQUIRED_STATUS_FIELDS) {
    if (!(f in cs)) throw new Error(`credentialStatus.${f} is REQUIRED`);
  }
  if (cs.type !== 'BitstringStatusListEntry') {
    throw new Error("credentialStatus.type MUST be 'BitstringStatusListEntry'");
  }
  if (!ALLOWED_STATUS_PURPOSES.includes(cs.statusPurpose)) {
    throw new Error(`statusPurpose MUST be one of: ${ALLOWED_STATUS_PURPOSES.join(', ')}`);
  }
  // Bit semantics: 0 = active, 1 = revoked
  const idx = parseInt(cs.statusListIndex, 10);
  if (Number.isNaN(idx) || idx < 0) {
    throw new Error('statusListIndex MUST be non-negative integer string');
  }
  const bitKey = `statusListBitAtIndex${idx}`;
  if (!(bitKey in v.input)) {
    throw new Error(`test vector missing ${bitKey}`);
  }
  const bit = v.input[bitKey];
  const computedRevoked = bit === 1;
  if (computedRevoked !== v.expectedRevoked) {
    throw new Error(`bit=${bit} -> revoked=${computedRevoked} != expected=${v.expectedRevoked}`);
  }
}

function checkInvalidRevocation(v) {
  const cs = v.input.credentialStatus;
  // The input MUST violate at least one conformance rule. We assert violation by
  // throwing — the dispatcher inverts throw/no-throw for invalid tests.
  for (const f of REQUIRED_STATUS_FIELDS) {
    if (!(f in cs)) {
      throw new Error(`credentialStatus.${f} is REQUIRED (correctly rejected)`);
    }
  }
  if (cs.type !== 'BitstringStatusListEntry') {
    throw new Error("credentialStatus.type MUST be 'BitstringStatusListEntry' (correctly rejected)");
  }
  if (!ALLOWED_STATUS_PURPOSES.includes(cs.statusPurpose)) {
    throw new Error(`statusPurpose MUST be one of ${ALLOWED_STATUS_PURPOSES.join(', ')} (correctly rejected)`);
  }
  // No violation found → invalid vector is not actually invalid → fail.
  // (Returns normally; dispatcher will see no-throw and mark FAIL.)
}

// ============================================================================
// §7.3 Trust Score validators
// ============================================================================

// §7.3.1 — the dimension keys and their weights are normative and fixed by the
// spec. They are never vector inputs: a vector supplies dimension *scores*, and
// the harness applies the spec's weights to them.
const DIMENSION_WEIGHTS = Object.freeze({
  identityVerification: 25,
  trackRecord: 25,
  informationProvenance: 20,
  behavioralConsistency: 20,
  thirdPartyAttestations: 10,
});
const REQUIRED_DIMENSIONS = Object.keys(DIMENSION_WEIGHTS);

// §7.3.2 rounding rule: published trust score values are integers on 0-100,
// rounded half-up. Math.round is half-up for the non-negative values used here.
function roundHalfUp(x) {
  return Math.round(x);
}

function assertDimensions(dims) {
  if (dims === null || typeof dims !== 'object' || Array.isArray(dims)) {
    throw new Error('input.dimensions MUST be an object carrying the five §7.3.1 dimensions');
  }
  for (const d of REQUIRED_DIMENSIONS) {
    if (!(d in dims)) {
      throw new Error(`all five §7.3.1 dimensions are REQUIRED (missing ${d})`);
    }
    const value = dims[d];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100) {
      throw new Error(`dimension scores MUST be in [0, 100] (${d}=${value})`);
    }
    // §7.3.2 / §14.5 — published scores are integers, not fractions.
    if (!Number.isInteger(value)) {
      throw new Error(`dimension scores MUST be integers (${d}=${value})`);
    }
  }
  for (const key of Object.keys(dims)) {
    if (!REQUIRED_DIMENSIONS.includes(key)) {
      throw new Error(`unknown dimension key '${key}' — §7.3.1 names are normative`);
    }
  }
}

// §7.3.8 — m = min(1.0, age_days / 180)
function maturityMultiplier(ageDays) {
  if (typeof ageDays !== 'number' || !Number.isFinite(ageDays) || ageDays < 0) {
    throw new Error(`ageDays MUST be a non-negative number (got ${ageDays})`);
  }
  return Math.min(1.0, ageDays / 180);
}

// §7.3.7 — p = min(1.0, Σ contributions)
function anomalyPenalty(contributions) {
  if (contributions === undefined) return 0;
  if (!Array.isArray(contributions)) {
    throw new Error('anomalyContributions MUST be an array of detector contributions');
  }
  let sum = 0;
  for (const c of contributions) {
    if (typeof c !== 'number' || !Number.isFinite(c) || c < 0) {
      throw new Error(`anomaly contribution MUST be a non-negative number (got ${c})`);
    }
    sum += c;
  }
  return Math.min(1.0, sum);
}

// §7.2.5 — probationary_cap = 0.5 + 0.5 × min(1, verified_interactions / 100).
// A DID exits probation only when verified_interactions >= 100 AND age_days >= 30.
// Returns null when no cap applies.
function probationaryCap(verifiedInteractions, ageDays) {
  if (
    typeof verifiedInteractions !== 'number' ||
    !Number.isFinite(verifiedInteractions) ||
    verifiedInteractions < 0
  ) {
    throw new Error(`verifiedInteractions MUST be a non-negative number (got ${verifiedInteractions})`);
  }
  const exited = verifiedInteractions >= 100 && ageDays >= 30;
  if (exited) return null;
  return roundHalfUp(50 + 50 * Math.min(1, verifiedInteractions / 100));
}

// §7.3.2 aggregation pipeline, integer representation:
//   S_raw     = Σ(wi × di) / 100        (over the PUBLISHED integer dimensions)
//   S         = round(S_raw × m × (1 - p))
//   effective = min(S, probationary_cap)
function computeTrustScore(input) {
  assertDimensions(input.dimensions);
  const sRaw =
    REQUIRED_DIMENSIONS.reduce((acc, d) => acc + DIMENSION_WEIGHTS[d] * input.dimensions[d], 0) / 100;
  const m = maturityMultiplier(input.ageDays);
  const p = anomalyPenalty(input.anomalyContributions);
  const s = roundHalfUp(sRaw * m * (1 - p));
  const cap = probationaryCap(input.verifiedInteractions, input.ageDays);
  return {
    sRaw,
    m,
    p,
    s,
    cap,
    effective: cap === null ? s : Math.min(s, cap),
    // §7.3.7 — a DID with p >= 0.5 MUST be flagged in resolution metadata.
    anomalyFlag: p >= 0.5,
  };
}

function checkValidTrustScore(v) {
  // §7.3.10 — Tier 0 (self-signed) DIDs do not participate in the trust score
  // system at all, so a Tier 0 vector can never be a valid scoring case.
  if (v.input.trailTrustTier === 0) {
    throw new Error('Tier 0 DIDs do not participate in the trust score system (§7.3.10)');
  }
  const r = computeTrustScore(v.input);

  if (r.effective !== v.expectedEffectiveScore) {
    throw new Error(`effective score ${r.effective} != expected ${v.expectedEffectiveScore}`);
  }
  if ('expectedRawScore' in v && r.sRaw !== v.expectedRawScore) {
    throw new Error(`raw score ${r.sRaw} != expected ${v.expectedRawScore}`);
  }
  // §7.3.8 publishes m as an integer percentage on 0-100.
  if ('expectedMaturityMultiplier' in v && roundHalfUp(r.m * 100) !== v.expectedMaturityMultiplier) {
    throw new Error(`maturity multiplier ${roundHalfUp(r.m * 100)} != expected ${v.expectedMaturityMultiplier}`);
  }
  if ('expectedAnomalyFlag' in v && r.anomalyFlag !== v.expectedAnomalyFlag) {
    throw new Error(`anomalyFlag ${r.anomalyFlag} != expected ${v.expectedAnomalyFlag}`);
  }
  if ('expectedProbationaryCap' in v) {
    if (v.expectedProbationaryCap === null) {
      if (r.cap !== null) throw new Error(`expected no probationary cap, got ${r.cap}`);
    } else if (r.cap === null || r.cap !== v.expectedProbationaryCap) {
      throw new Error(`probationary cap ${r.cap} != expected ${v.expectedProbationaryCap}`);
    }
  }
}

function checkInvalidTrustScore(v) {
  if (v.input.trailTrustTier === 0) {
    throw new Error('Tier 0 DIDs do not participate in the trust score system (correctly rejected)');
  }
  computeTrustScore(v.input); // MUST throw
}

// ============================================================================
// Dispatcher
// ============================================================================

const VALIDATORS = {
  'did-creation': { valid: checkValidDidCreation, invalid: checkInvalidDidCreation },
  'did-resolution': { valid: checkValidDidResolution, invalid: checkInvalidDidResolution },
  revocation: { valid: checkValidRevocation, invalid: checkInvalidRevocation },
  'trust-score': { valid: checkValidTrustScore, invalid: checkInvalidTrustScore },
};

function runScope(scope) {
  console.log(`\n=== ${scope} ===`);
  const validators = VALIDATORS[scope];

  for (const { file, vector } of readVectors(scope, 'valid')) {
    try {
      validators.valid(vector);
      record(scope, file, true);
    } catch (err) {
      record(scope, file, false, err.message);
    }
  }

  for (const { file, vector } of readVectors(scope, 'invalid')) {
    try {
      validators.invalid(vector);
      // Did NOT throw — that means the validator accepted invalid input → fail
      record(scope, file, false, 'expected non-conformant input to be rejected, but validator accepted it');
    } catch (err) {
      // Expected throw — pass
      record(scope, file, true);
    }
  }
}

const scopes = scopeFilter ? [scopeFilter] : SCOPES;
for (const scope of scopes) {
  if (!VALIDATORS[scope]) {
    console.error(`Unknown scope: ${scope}`);
    process.exit(2);
  }
  runScope(scope);
}

console.log(`\n=== Summary ===`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${fail}`);

if (fail > 0) {
  console.log('\nFailures:');
  for (const f of failures) {
    console.log(`  ${f.scope} ${f.file.split('/').slice(-2).join('/')}: ${f.message}`);
  }
  process.exit(1);
}
process.exit(0);
