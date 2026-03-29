# TRAIL Protocol - JavaScript Examples

This directory contains runnable JavaScript examples for the `did:trail` DID method using the `@trailprotocol/core` reference implementation.

## Prerequisites

- Node.js 18 or newer
- npm

## Setup

From this directory:

```bash
npm install
```

## Run the examples

### DID resolution example

```bash
npm run did-resolution
```

This script demonstrates:

- generating an Ed25519 keypair
- creating `did:trail:self`, `did:trail:org`, and `did:trail:agent` identifiers
- building DID Documents
- resolving a `did:trail:self` DID locally, without contacting a registry

### Verifiable Credential example

```bash
npm run vc-verification
```

This script demonstrates:

- issuing a self-signed Verifiable Credential
- inspecting the `DataIntegrityProof`
- verifying the credential signature
- detecting tampering by modifying a signed field and verifying again

Note: the tampered credential is expected to fail verification because the proof no longer matches the modified credential contents.

### HTTP registry resolution example

```bash
npm run resolve-http
```

Or with a custom DID:

```bash
bash resolve-http.sh "did:trail:org:acme-corp-eu-a7f3b2c1e9d04f5a"
```

This demonstrates the HTTP resolution pattern for registry-backed `did:trail` identifiers.

Note: this example documents the expected registry HTTP request pattern. A live response depends on the public registry endpoint being reachable from your current environment.

## Package metadata

The local `package.json` defines:

- `npm run did-resolution`
- `npm run vc-verification`
- `npm run resolve-http`

and requires Node.js `>=18.0.0`.