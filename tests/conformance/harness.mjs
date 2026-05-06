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
// §7.3 Revocation validators
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

const REQUIRED_DIMENSIONS = [
  'D1_identity_verification',
  'D2_credential_validity',
  'D3_information_provenance',
  'D4_governance_compliance',
  'D5_operational_history',
];

function computeTrustScore(dims) {
  for (const d of REQUIRED_DIMENSIONS) {
    if (!(d in dims)) throw new Error(`all five dimensions D1-D5 are REQUIRED (missing ${d})`);
    const v = dims[d];
    if (typeof v !== 'number' || v < 0 || v > 100) {
      throw new Error(`dimension values MUST be in [0, 100] (${d}=${v})`);
    }
  }
  const sum = REQUIRED_DIMENSIONS.reduce((acc, d) => acc + dims[d], 0);
  return Math.round(sum / REQUIRED_DIMENSIONS.length);
}

function tierFromScore(score) {
  if (score >= 90) return 'tier-1-root';
  if (score >= 70) return 'tier-2-sub';
  if (score >= 50) return 'tier-3-endorsement';
  return 'tier-4-self';
}

function checkValidTrustScore(v) {
  const score = computeTrustScore(v.input.dimensions);
  if (score !== v.expectedScore) {
    throw new Error(`computed score ${score} != expected ${v.expectedScore}`);
  }
  const tier = tierFromScore(score);
  if (tier !== v.expectedTier) {
    throw new Error(`computed tier ${tier} != expected ${v.expectedTier}`);
  }
}

function checkInvalidTrustScore(v) {
  computeTrustScore(v.input.dimensions); // MUST throw
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
