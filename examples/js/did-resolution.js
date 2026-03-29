#!/usr/bin/env node

/**
 * TRAIL Protocol - DID Resolution Example
 *
 * Demonstrates how to:
 * 1. Generate an Ed25519 keypair
 * 2. Create did:trail DIDs in self, org, and agent modes
 * 3. Build DID Documents
 * 4. Resolve a did:trail:self DID locally (offline)
 *
 * Prerequisites:
 *   npm install @trailprotocol/core
 *
 * Run:
 *   node did-resolution.js
 */

const {
  generateKeyPair,
  createSelfDid,
  createOrgDid,
  createAgentDid,
  createDidDocument,
  TrailResolver,
} = require('@trailprotocol/core');

async function main() {
  // -------------------------------------------------------
  // Step 1: Generate an Ed25519 keypair
  // -------------------------------------------------------
  // This keypair is the cryptographic root of the DID identity.
  const keys = generateKeyPair();
  console.log('=== Key Generation ===');
  console.log('Public key (multibase):', keys.publicKeyMultibase);
  console.log('Public key (JWK):', JSON.stringify(keys.publicKeyJwk, null, 2));
  console.log();

  // -------------------------------------------------------
  // Step 2: Create DIDs in all three TRAIL modes
  // -------------------------------------------------------
  const selfDid = createSelfDid(keys.publicKeyMultibase);
  const orgDid = createOrgDid('Acme Corporation', keys.publicKeyMultibase);
  const agentDid = createAgentDid('Sales Assistant', keys.publicKeyMultibase);

  console.log('=== DID Creation ===');
  console.log('Self DID: ', selfDid);
  console.log('Org DID:  ', orgDid);
  console.log('Agent DID:', agentDid);
  console.log();

  console.log('Mode summary:');
  console.log('  self  -> local/offline identity using embedded public key');
  console.log('  org   -> organization identifier format for registry-backed use');
  console.log('  agent -> agent/service identifier format, typically linked to a parent org');
  console.log();

  // -------------------------------------------------------
  // Step 3: Build DID Documents
  // -------------------------------------------------------
  // A DID Document describes the public keys, verification methods,
  // and optional services associated with a DID.
  console.log('=== DID Documents ===');

  // Self DID Document: simplest form, suitable for local/offline verification.
  const selfDoc = createDidDocument(selfDid, keys, { mode: 'self' });
  console.log('Self DID Document:');
  console.log(JSON.stringify(selfDoc, null, 2));
  console.log();

  // Agent DID Document: includes a parent organization reference and registry service.
  const agentDoc = createDidDocument(agentDid, keys, {
    mode: 'agent',
    parentOrganization: orgDid,
    aiSystemType: 'agent',
  });
  console.log('Agent DID Document:');
  console.log(JSON.stringify(agentDoc, null, 2));
  console.log();

  // -------------------------------------------------------
  // Step 4: Resolve a self DID (offline resolution)
  // -------------------------------------------------------
  // Self-mode DIDs can be resolved without a registry because the
  // public key is embedded directly in the DID identifier.
  console.log('=== DID Resolution ===');
  const resolver = new TrailResolver();
  const result = await resolver.resolve(selfDid);

  console.log('Resolution result:');
  console.log('  DID:', result.didDocument.id);
  console.log('  Content-Type:', result.didResolutionMetadata.contentType);
  console.log('  Verification Method:', result.didDocument.verificationMethod[0].type);
  console.log('  Trust Tier:', result.didDocument['trail:trailTrustTier']);
  console.log();

  // Registry-based resolution for org/agent DIDs is typically performed
  // via the TRAIL registry HTTP API rather than offline reconstruction.
  console.log('Done. All examples completed successfully.');
}

main().catch(console.error);