# did:trail Method Specification

**Version:** 1.0.0-draft
**Status:** Draft
**Authors:** Christian Hommrich (TRAIL Protocol Initiative)
**Contact:** christian.hommrich@gmail.com
**Repository:** https://github.com/trailprotocol/trail-did-method
**Date:** 2026-03-01
**License:** CC BY 4.0

---

## Abstract

The `did:trail` DID method specifies how Decentralized Identifiers (DIDs) are created, resolved, updated, and deactivated within the TRAIL (Trust Registry for AI Identity Layer) protocol. TRAIL provides a verifiable trust infrastructure for artificial intelligence systems, autonomous agents, and AI-powered services operating in B2B commerce environments.

This specification defines the `did:trail` method conforming to the [W3C DID Core 1.0 specification](https://www.w3.org/TR/did-core/) and the [Verifiable Credentials Data Model 2.0](https://www.w3.org/TR/vc-data-model-2.0/). It enables organizations and AI agents to establish cryptographically verifiable identities, express their AI usage policies, and participate in a trust ecosystem designed for compliance with the EU AI Act (Articles 13, 14, 26) and aligned with eIDAS 2.0.

---

## Status of This Document

This document is a **Draft** specification submitted for registration in the [W3C DID Specification Registries](https://github.com/w3c/did-spec-registries). It is subject to change before finalization. Feedback is welcome via the [TRAIL GitHub repository](https://github.com/trailprotocol/trail-did-method/issues) or the W3C Credentials Community Group mailing list at public-credentials@w3.org.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Conformance](#2-conformance)
3. [The `did:trail` Method](#3-the-didtrail-method)
4. [DID Method Syntax](#4-did-method-syntax)
5. [DID Document Structure](#5-did-document-structure)
6. [Method Operations](#6-method-operations)
   - 6.1 [Create (Register)](#61-create-register)
   - 6.2 [Read (Resolve)](#62-read-resolve)
   - 6.3 [Update](#63-update)
   - 6.4 [Deactivate (Revoke)](#64-deactivate-revoke)
7. [TRAIL Trust Extensions](#7-trail-trust-extensions)
8. [Security Considerations](#8-security-considerations)
9. [Privacy Considerations](#9-privacy-considerations)
10. [Reference Implementation](#10-reference-implementation)
11. [Appendix A — JSON Registry Entry](#appendix-a--json-registry-entry)
12. [Appendix B — Example DID Documents](#appendix-b--example-did-documents)
13. [References](#references)

---

## 1. Introduction

### 1.1 Motivation

Artificial intelligence systems increasingly act as autonomous agents in commercial contexts — drafting contracts, negotiating terms, providing advice, and executing decisions on behalf of organizations. Unlike human actors, AI agents cannot rely on social trust signals (reputation, body language, professional history) that humans use to establish credibility.

TRAIL addresses this gap by providing a **decentralized trust registry** where AI-powered systems can register cryptographically verifiable identities, disclose their operational policies, and obtain tamper-proof credentials attesting to their identity and behavior standards.

The `did:trail` method provides the identity foundation for this ecosystem.

### 1.2 Design Goals

The `did:trail` method is designed to:

- **Be interoperable** with W3C DID Core 1.0 and Verifiable Credentials 2.0
- **Support EU AI Act compliance** (Articles 13, 14, 26 transparency requirements)
- **Enable selective disclosure** — organizations can publish AI identity information without revealing proprietary implementation details
- **Provide revocation** — trust certificates can be revoked with economic consequences for non-compliant actors
- **Scale across B2B commerce** — from SMEs to enterprise deployments
- **Work without a dedicated blockchain** — the TRAIL registry uses established web infrastructure with cryptographic anchoring

### 1.3 Relationship to Other DID Methods

`did:trail` is complementary to, not competitive with, existing DID methods:

| Method | Focus | Relationship to did:trail |
|--------|-------|--------------------------|
| `did:web` | Domain-based identity | did:trail can delegate to did:web for DID Document hosting |
| `did:key` | Ephemeral/self-sovereign keys | did:key can be used for self-signed mode (see §7.2) |
| `did:ethr` | Ethereum-based registry | did:trail can anchor trust records on Ethereum via EIP-6551 |
| `did:ion` | Bitcoin-anchored identity | Future integration path for immutable anchoring |
| OpenID4VC | Credential presentation layer | did:trail provides the trust layer; OID4VC handles credential exchange |

---

## 2. Conformance

The key words MUST, MUST NOT, REQUIRED, SHALL, SHALL NOT, SHOULD, SHOULD NOT, RECOMMENDED, MAY, and OPTIONAL in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

This specification conforms to:
- [W3C DID Core 1.0](https://www.w3.org/TR/did-core/)
- [W3C Verifiable Credentials Data Model 2.0](https://www.w3.org/TR/vc-data-model-2.0/)
- [W3C DID Specification Registries](https://www.w3.org/TR/did-spec-registries/)
- [RFC 8037](https://www.rfc-editor.org/rfc/rfc8037) (CFRG Elliptic Curves — Ed25519)
- [RFC 7517](https://www.rfc-editor.org/rfc/rfc7517) (JSON Web Key)

---

## 3. The `did:trail` Method

### 3.1 Method Name

The method name that SHALL identify this DID method is: **`trail`**

A DID using this method MUST begin with the prefix `did:trail:`. This prefix is case-insensitive in resolution but SHOULD be produced in lowercase.

### 3.2 Target System

The `did:trail` method uses the **TRAIL Registry** as its Verifiable Data Registry (VDR). The TRAIL Registry is an HTTP-based registry infrastructure that:

1. Stores DID Document metadata and resolution endpoints
2. Issues and manages TRAIL Verifiable Credentials (VCs) attesting to AI system identity
3. Manages revocation status via a TRAIL Status List compatible with [W3C VC Status List 2021](https://www.w3.org/TR/vc-status-list/)
4. Provides a public resolution API at `https://registry.trailprotocol.org/1.0/identifiers/`

**Self-Signed Mode:** Before the TRAIL Registry reaches production, DIDs MAY be created in **self-signed mode** (see §7.2). Self-signed `did:trail` DIDs are verifiable without an external registry and serve early adopters before the trust network reaches critical mass.

---

## 4. DID Method Syntax

### 4.1 Method-Specific Identifier

The method-specific identifier (MSI) for `did:trail` has the following ABNF syntax:

```abnf
did-trail          = "did:trail:" trail-identifier
trail-identifier   = trail-mode ":" trail-subject
trail-mode         = "org" / "agent" / "self"
trail-subject      = 1*( ALPHA / DIGIT / "-" / "_" / "." )
```

### 4.2 Identifier Modes

`did:trail` supports three registration modes corresponding to different subject types:

#### `org` — Organization Identity
Identifies a legal entity (company, institution) operating AI systems.

```
did:trail:org:acme-corp-eu
did:trail:org:deutschebank-ai-desk
```

#### `agent` — AI Agent Identity
Identifies a specific AI agent or AI-powered service instance operated by an organization. MUST be associated with a parent `org` DID.

```
did:trail:agent:acme-corp-eu-sales-assistant-v2
did:trail:agent:db-contract-analysis-prod-001
```

#### `self` — Self-Signed Identity (Early Adopter Mode)
For use before TRAIL Registry production launch. DIDs are cryptographically self-contained and verifiable without external registry lookup.

```
did:trail:self:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK
```
*(The subject component in self-mode is a multibase-encoded Ed25519 public key)*

### 4.3 Identifier Constraints

- The `trail-subject` component MUST be globally unique within its mode namespace
- `trail-subject` MUST NOT exceed 128 characters
- `trail-subject` MUST use only URL-safe characters (ALPHA, DIGIT, hyphen, underscore, period)
- Organization identifiers (`org` mode) MUST match a verified legal entity name or registered business identifier

### 4.4 Example DIDs

```
did:trail:org:acme-corp-eu
did:trail:agent:acme-corp-eu-rfq-assistant-v1
did:trail:self:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK
```

---

## 5. DID Document Structure

### 5.1 Core DID Document

A `did:trail` DID Document MUST conform to the W3C DID Core 1.0 DID Document data model. The following is a minimal compliant DID Document:

```json
{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://trailprotocol.org/ns/did/v1"
  ],
  "id": "did:trail:org:acme-corp-eu",
  "verificationMethod": [
    {
      "id": "did:trail:org:acme-corp-eu#key-1",
      "type": "JsonWebKey2020",
      "controller": "did:trail:org:acme-corp-eu",
      "publicKeyJwk": {
        "kty": "OKP",
        "crv": "Ed25519",
        "x": "11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo"
      }
    }
  ],
  "authentication": [
    "did:trail:org:acme-corp-eu#key-1"
  ],
  "assertionMethod": [
    "did:trail:org:acme-corp-eu#key-1"
  ],
  "service": [
    {
      "id": "did:trail:org:acme-corp-eu#trail-registry",
      "type": "TrailRegistryService",
      "serviceEndpoint": "https://registry.trailprotocol.org/1.0/identifiers/did:trail:org:acme-corp-eu"
    },
    {
      "id": "did:trail:org:acme-corp-eu#ai-policy",
      "type": "TrailAIPolicyService",
      "serviceEndpoint": "https://acme-corp.eu/.well-known/trail-ai-policy.json"
    }
  ]
}
```

### 5.2 TRAIL-Specific Context Terms

The `https://trailprotocol.org/ns/did/v1` JSON-LD context defines the following additional terms:

| Term | Type | Description |
|------|------|-------------|
| `TrailRegistryService` | Service type | Link to the TRAIL Registry resolution endpoint |
| `TrailAIPolicyService` | Service type | Link to the AI Policy disclosure document |
| `TrailTrustScore` | Property | Current trust score (0.0–1.0) from TRAIL Registry |
| `TrailCertificationStatus` | Property | Status of TRAIL certification (active / suspended / revoked) |
| `aiSystemType` | Property | Classification of AI system (llm / agent / classifier / other) |
| `euAiActRiskClass` | Property | EU AI Act risk classification (minimal / limited / high / unacceptable) |
| `parentOrganization` | Property | DID of parent org (required for `agent` mode DIDs) |

### 5.3 Extended DID Document (Full Example)

```json
{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://w3id.org/security/suites/jws-2020/v1",
    "https://trailprotocol.org/ns/did/v1"
  ],
  "id": "did:trail:agent:acme-corp-eu-rfq-assistant-v1",
  "controller": "did:trail:org:acme-corp-eu",
  "verificationMethod": [
    {
      "id": "did:trail:agent:acme-corp-eu-rfq-assistant-v1#key-1",
      "type": "JsonWebKey2020",
      "controller": "did:trail:agent:acme-corp-eu-rfq-assistant-v1",
      "publicKeyJwk": {
        "kty": "OKP",
        "crv": "Ed25519",
        "x": "11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo"
      }
    }
  ],
  "authentication": ["did:trail:agent:acme-corp-eu-rfq-assistant-v1#key-1"],
  "assertionMethod": ["did:trail:agent:acme-corp-eu-rfq-assistant-v1#key-1"],
  "service": [
    {
      "id": "did:trail:agent:acme-corp-eu-rfq-assistant-v1#trail-registry",
      "type": "TrailRegistryService",
      "serviceEndpoint": "https://registry.trailprotocol.org/1.0/identifiers/did:trail:agent:acme-corp-eu-rfq-assistant-v1"
    }
  ],
  "trail:aiSystemType": "agent",
  "trail:euAiActRiskClass": "limited",
  "trail:parentOrganization": "did:trail:org:acme-corp-eu",
  "trail:TrailCertificationStatus": "active"
}
```

---

## 6. Method Operations

### 6.1 Create (Register)

#### 6.1.1 Preconditions

To create a `did:trail` DID, a registrant MUST:

1. Possess a valid Ed25519 key pair (the **TRAIL Identity Key**)
2. For `org` mode: provide proof of legal entity (business registration document or eIDAS-compatible identity)
3. For `agent` mode: hold an active `org` mode DID for the parent organization
4. Accept the [TRAIL Participant Agreement](https://trailprotocol.org/legal/participant-agreement)

#### 6.1.2 Creation Steps

**Step 1 — Key Generation**
Generate an Ed25519 key pair using a cryptographically secure random number generator:

```javascript
// Reference implementation (Node.js)
const { generateKeyPair } = require('crypto');
const { privateKey, publicKey } = generateKeyPairSync('ed25519');
```

**Step 2 — DID Construction**
Construct the DID string according to §4:
```
did:trail:org:{organization-slug}
```

The `organization-slug` MUST be derived from the verified legal entity name following the TRAIL Slug Normalization Rules (lowercase, hyphens for spaces, removal of legal suffixes).

**Step 3 — DID Document Construction**
Construct the DID Document as specified in §5, including:
- At minimum one `verificationMethod` entry with the public key in JWK format
- A `TrailRegistryService` endpoint pointing to the TRAIL Registry
- An `TrailAIPolicyService` endpoint (REQUIRED for `org` mode, OPTIONAL for `agent`)

**Step 4 — Registration Request**
Submit the DID Document to the TRAIL Registry via HTTP POST:

```http
POST https://registry.trailprotocol.org/1.0/register
Content-Type: application/json
Authorization: Bearer {TRAIL-API-KEY}

{
  "did": "did:trail:org:acme-corp-eu",
  "didDocument": { ... },
  "proof": {
    "type": "DataIntegrityProof",
    "cryptosuite": "eddsa-2022",
    "created": "2026-03-01T00:00:00Z",
    "verificationMethod": "did:trail:org:acme-corp-eu#key-1",
    "proofPurpose": "assertionMethod",
    "proofValue": "z..."
  }
}
```

**Step 5 — Registry Confirmation**
The TRAIL Registry validates:
- DID Document syntax and required fields
- Cryptographic proof validity
- Identity verification (for `org` mode: KYB check)
- Uniqueness of the requested identifier

Upon successful validation, the Registry returns a signed TRAIL Registration Certificate (a Verifiable Credential).

#### 6.1.3 Self-Signed Mode (No Registry Required)

For early adopters and testing, `did:trail:self:` DIDs can be created without registry registration:

```javascript
// Self-signed mode: DID derived directly from public key
const multibase = require('multibase');
const publicKeyBytes = publicKey.export({ type: 'spki', format: 'der' }).slice(-32);
const encoded = multibase.encode('base58btc', publicKeyBytes);
const did = `did:trail:self:${encoded}`;
```

Self-signed DIDs are resolvable by any resolver that understands the `self` mode — no network request required.

### 6.2 Read (Resolve)

#### 6.2.1 Resolution via TRAIL Registry

A `did:trail` DID resolver MUST perform the following steps:

1. Parse the DID to extract the mode and subject components
2. Dispatch based on mode:
   - `org` / `agent`: Perform HTTP GET to the TRAIL Registry
   - `self`: Reconstruct DID Document from embedded public key

**HTTP Resolution (org/agent mode):**

```http
GET https://registry.trailprotocol.org/1.0/identifiers/did:trail:org:acme-corp-eu
Accept: application/did+ld+json
```

**Response (200 OK):**

```json
{
  "@context": "https://w3id.org/did-resolution/v1",
  "didDocument": { ... },
  "didDocumentMetadata": {
    "created": "2026-03-01T00:00:00Z",
    "updated": "2026-03-01T00:00:00Z",
    "deactivated": false,
    "trailCertificationStatus": "active",
    "trailTrustScore": 0.87,
    "nextUpdate": "2026-06-01T00:00:00Z"
  },
  "didResolutionMetadata": {
    "contentType": "application/did+ld+json"
  }
}
```

#### 6.2.2 Self-Signed Resolution (self mode)

```javascript
function resolveTrailSelf(did) {
  const subject = did.split('did:trail:self:')[1];
  const publicKeyBytes = multibase.decode(subject);
  return {
    "@context": ["https://www.w3.org/ns/did/v1", "https://trailprotocol.org/ns/did/v1"],
    "id": did,
    "verificationMethod": [{
      "id": `${did}#key-1`,
      "type": "JsonWebKey2020",
      "controller": did,
      "publicKeyJwk": {
        "kty": "OKP",
        "crv": "Ed25519",
        "x": Buffer.from(publicKeyBytes).toString('base64url')
      }
    }],
    "authentication": [`${did}#key-1`],
    "assertionMethod": [`${did}#key-1`]
  };
}
```

#### 6.2.3 DID URL Dereferencing

| DID URL | Dereferences to |
|---------|----------------|
| `did:trail:org:acme#key-1` | The verification method with id `#key-1` |
| `did:trail:org:acme#trail-registry` | The TrailRegistryService endpoint |
| `did:trail:org:acme#ai-policy` | The AI Policy service endpoint |
| `did:trail:org:acme?versionId=2026-03-01` | DID Document as of the specified date |

### 6.3 Update

DID Document updates require a signed update request from the DID controller:

```http
PUT https://registry.trailprotocol.org/1.0/identifiers/did:trail:org:acme-corp-eu
Content-Type: application/json
Authorization: Bearer {TRAIL-API-KEY}

{
  "didDocument": { ...updated document... },
  "proof": {
    "type": "DataIntegrityProof",
    "cryptosuite": "eddsa-2022",
    "created": "2026-04-01T00:00:00Z",
    "verificationMethod": "did:trail:org:acme-corp-eu#key-1",
    "proofPurpose": "authentication",
    "proofValue": "z..."
  }
}
```

**Key Rotation:** When rotating the primary identity key, the DID controller MUST include both the old proof (signed with the current key) and the new key material. Key rotation does not change the DID itself.

**Immutable fields:** The `id` field of a DID Document MUST NOT be changed after creation.

### 6.4 Deactivate (Revoke)

A DID MAY be deactivated either by the DID controller (voluntary) or by the TRAIL Registry (revocation due to policy violation).

#### 6.4.1 Controller-Initiated Deactivation

```http
DELETE https://registry.trailprotocol.org/1.0/identifiers/did:trail:org:acme-corp-eu
Authorization: Bearer {TRAIL-API-KEY}
X-Trail-Proof: {signed-deactivation-proof}
```

#### 6.4.2 Registry-Initiated Revocation

The TRAIL Registry MAY revoke a DID under the following conditions:
- Verified misrepresentation of AI system capabilities
- Breach of TRAIL Participant Agreement
- Court order or regulatory requirement
- Sustained pattern of harmful AI behavior (as defined in the TRAIL Conduct Standards)

Revocation follows the TRAIL Revocation Policy (see [trailprotocol.org/legal/revocation-policy](https://trailprotocol.org/legal/revocation-policy)):
1. **Notice:** 14-day written notice before revocation (except in cases of immediate harm)
2. **Appeal:** 30-day appeal window via the TRAIL Dispute Resolution Process
3. **Effect:** Upon revocation, the DID Document is marked `"deactivated": true` and all associated VCs become invalid

#### 6.4.3 Deactivated DID Resolution

Resolving a deactivated DID MUST return the last known DID Document with the following metadata:

```json
{
  "didDocumentMetadata": {
    "deactivated": true,
    "deactivationDate": "2026-09-01T00:00:00Z",
    "deactivationReason": "voluntary"
  }
}
```

---

## 7. TRAIL Trust Extensions

### 7.1 TRAIL Verifiable Credentials

The TRAIL Registry issues Verifiable Credentials (conforming to VC Data Model 2.0) that attest to the identity and trust level of registered subjects:

#### TRAIL Identity Credential
```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://trailprotocol.org/ns/credentials/v1"
  ],
  "type": ["VerifiableCredential", "TrailIdentityCredential"],
  "issuer": "did:trail:org:trail-protocol",
  "issuanceDate": "2026-03-01T00:00:00Z",
  "credentialSubject": {
    "id": "did:trail:org:acme-corp-eu",
    "legalName": "ACME Corporation GmbH",
    "jurisdiction": "DE",
    "euAiActCompliant": true,
    "trailTrustScore": 0.87,
    "certificationLevel": "standard"
  },
  "credentialStatus": {
    "id": "https://registry.trailprotocol.org/1.0/status/2026-03#42",
    "type": "StatusList2021Entry",
    "statusPurpose": "revocation",
    "statusListIndex": "42",
    "statusListCredential": "https://registry.trailprotocol.org/1.0/status/2026-03"
  }
}
```

### 7.2 Self-Signed Mode

In self-signed mode, parties can exchange TRAIL-formatted Verifiable Credentials without requiring TRAIL Registry lookup. Self-signed credentials are signed with the DID controller's private key and verifiable via the public key embedded in the `did:trail:self:` DID.

This mode is intended for:
- Development and testing
- Early adopter usage before registry production launch
- Air-gapped or offline verification scenarios

Self-signed credentials carry reduced trust weight compared to Registry-issued credentials and MUST be clearly marked as `"trailMode": "self-signed"`.

### 7.3 Trust Score Dimensions

The TRAIL Trust Score (0.0–1.0) is computed across 5 dimensions:

| # | Dimension | Weight | Description |
|---|-----------|--------|-------------|
| 1 | **Identity Verification** | 25% | Verified legal entity vs. self-declared |
| 2 | **Track Record** | 25% | Complaint rate over trailing 12 months |
| 3 | **Information Provenance** | 20% | Are AI outputs verifiably sourced? |
| 4 | **Behavioral Consistency** | 20% | AI output vs. declared policy alignment |
| 5 | **Third-Party Attestations** | 10% | Attestations from other TRAIL participants |

Trust Score computation is performed by the TRAIL Registry using a weighted formula documented in the [TRAIL Trust Score Specification v1.0](https://trailprotocol.org/specs/trust-score-v1).

---

## 8. Security Considerations

### 8.1 Key Security

- **Ed25519 key pairs** MUST be generated using a CSPRNG (Cryptographically Secure Pseudo-Random Number Generator)
- Private keys MUST be stored in hardware security modules (HSMs) for production deployments
- RECOMMENDED: key rotation every 12 months or upon suspected compromise
- The TRAIL Protocol RECOMMENDS using PKCS#11-compatible HSMs (e.g., AWS CloudHSM, Azure Dedicated HSM)

### 8.2 PEPPER Management

The TRAIL Registry uses HMAC-SHA256 with a server-side PEPPER for additional integrity protection of DID Documents at rest. PEPPER management requirements:

- PEPPER secrets MUST be stored separately from DID Document data (HSM recommended)
- PEPPER rotation MUST occur every 90 days minimum
- Upon PEPPER rotation, all affected HMAC values MUST be recomputed
- PEPPER recovery procedures MUST be documented and tested quarterly

### 8.3 Registry Availability

The TRAIL Registry is a critical infrastructure component. The following security controls are REQUIRED:
- DDoS protection and rate limiting on the public resolution API
- Geographically distributed read replicas for resolution availability
- Signed registry responses (the Registry MUST sign all resolution responses with its own `did:trail:org:trail-protocol` key)
- Audit logs for all write operations (create, update, deactivate)

### 8.4 Replay Attack Prevention

All signed requests to the TRAIL Registry MUST include a nonce and timestamp. The Registry MUST reject requests with timestamps older than 5 minutes or with previously seen nonces.

### 8.5 Man-in-the-Middle Attacks

All communication with the TRAIL Registry MUST use TLS 1.3 or higher. Certificate pinning is RECOMMENDED for high-value agent deployments.

### 8.6 Revocation Timeliness

Verifiers MUST check credential revocation status at verification time. Cached revocation lists MUST NOT be used for longer than 1 hour for high-stakes verification contexts.

---

## 9. Privacy Considerations

### 9.1 Minimal Disclosure

`did:trail` DID Documents SHOULD contain only the minimum information necessary for the intended use case. Organizations are NOT required to disclose:
- Internal AI model names or versions
- Training data sources
- Proprietary prompt engineering

### 9.2 Public vs. Private Attributes

The AI Policy document (`TrailAIPolicyService` endpoint) SHOULD follow the [TRAIL Selective Disclosure Profile](https://trailprotocol.org/specs/selective-disclosure-v1), which defines:
- **Public attributes** (always disclosed): DID, legal name, jurisdiction, EU AI Act risk class, certification status
- **Restricted attributes** (disclosed on demand with consent): trust score details, complaint history
- **Private attributes** (never disclosed via protocol): training data, system prompts, cost structure

### 9.3 Correlation Risks

Using a single `org` DID across many interactions enables correlation of all those interactions. Organizations with elevated privacy requirements SHOULD:
- Use per-interaction `agent` DIDs with rotating key material
- Implement the TRAIL Pseudonymous Mode (see planned v1.1 specification)

### 9.4 GDPR Compliance

The TRAIL Registry processes personal data (legal entity information) as a Data Processor under GDPR. The Registry:
- Operates under a Data Processing Agreement with all registrants
- Stores PII in EU-jurisdiction data centers only
- Provides DSAR (Data Subject Access Request) capabilities
- Implements right to erasure via the DID deactivation mechanism

### 9.5 Right to Deactivate

Any DID controller MUST be able to deactivate their DID and associated credentials at any time without undue burden. Deactivation takes effect within 1 hour of the request.

---

## 10. Reference Implementation

### 10.1 Resolver

A reference resolver for `did:trail` is available at:

**Repository:** https://github.com/trailprotocol/trail-resolver
**Language:** Node.js (TypeScript)
**Package:** `npm install @trailprotocol/resolver`

```javascript
const { TrailResolver } = require('@trailprotocol/resolver');

const resolver = new TrailResolver({
  registryEndpoint: 'https://registry.trailprotocol.org/1.0',
  // For self-signed mode, no API key required:
  selfSignedMode: true
});

const result = await resolver.resolve('did:trail:org:acme-corp-eu');
console.log(result.didDocument);
```

### 10.2 DID Generation CLI

```bash
npm install -g @trailprotocol/cli

# Generate a new org DID (self-signed mode)
trail did create --mode org --subject acme-corp-eu --output ./did-document.json

# Generate an agent DID
trail did create --mode agent --subject acme-corp-eu-rfq-v1 --parent did:trail:org:acme-corp-eu

# Resolve a DID
trail did resolve did:trail:org:acme-corp-eu
```

### 10.3 Universal Resolver Integration

`did:trail` is designed for integration with the [DIF Universal Resolver](https://resolver.identity.foundation). A Universal Resolver driver for `did:trail` is provided at:

**Docker Image:** `ghcr.io/trailprotocol/universal-resolver-driver-trail:latest`

```yaml
# docker-compose addition for Universal Resolver
did-trail:
  image: ghcr.io/trailprotocol/universal-resolver-driver-trail:latest
  ports:
    - "8080:8080"
  environment:
    - TRAIL_REGISTRY_ENDPOINT=https://registry.trailprotocol.org/1.0
```

---

## Appendix A — JSON Registry Entry

The following JSON file is submitted for inclusion in the [W3C DID Specification Registries](https://github.com/w3c/did-spec-registries/tree/main/methods) as `trail.json`:

```json
{
  "name": "trail",
  "status": "provisional",
  "verifiableDataRegistry": "TRAIL Registry (https://registry.trailprotocol.org)",
  "specification": "https://trailprotocol.org/specs/did-method-v1",
  "contactName": "Christian Hommrich",
  "contactEmail": "christian.hommrich@gmail.com",
  "contactWebsite": "https://trailprotocol.org"
}
```

---

## Appendix B — Example DID Documents

### B.1 Minimal Organization DID Document

```json
{
  "@context": ["https://www.w3.org/ns/did/v1", "https://trailprotocol.org/ns/did/v1"],
  "id": "did:trail:org:example-gmbh-de",
  "verificationMethod": [{
    "id": "did:trail:org:example-gmbh-de#key-1",
    "type": "JsonWebKey2020",
    "controller": "did:trail:org:example-gmbh-de",
    "publicKeyJwk": {
      "kty": "OKP", "crv": "Ed25519",
      "x": "11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo"
    }
  }],
  "authentication": ["did:trail:org:example-gmbh-de#key-1"],
  "assertionMethod": ["did:trail:org:example-gmbh-de#key-1"]
}
```

### B.2 AI Agent DID Document

```json
{
  "@context": ["https://www.w3.org/ns/did/v1", "https://trailprotocol.org/ns/did/v1"],
  "id": "did:trail:agent:example-gmbh-de-support-bot-v2",
  "controller": "did:trail:org:example-gmbh-de",
  "trail:aiSystemType": "agent",
  "trail:euAiActRiskClass": "minimal",
  "trail:parentOrganization": "did:trail:org:example-gmbh-de",
  "verificationMethod": [{
    "id": "did:trail:agent:example-gmbh-de-support-bot-v2#key-1",
    "type": "JsonWebKey2020",
    "controller": "did:trail:agent:example-gmbh-de-support-bot-v2",
    "publicKeyJwk": {
      "kty": "OKP", "crv": "Ed25519",
      "x": "SL0q3Ldb2_XtIiR2fwWoXL97uZa5tKdXxO__fwXBmxM"
    }
  }],
  "authentication": ["did:trail:agent:example-gmbh-de-support-bot-v2#key-1"],
  "assertionMethod": ["did:trail:agent:example-gmbh-de-support-bot-v2#key-1"],
  "service": [{
    "id": "did:trail:agent:example-gmbh-de-support-bot-v2#trail-registry",
    "type": "TrailRegistryService",
    "serviceEndpoint": "https://registry.trailprotocol.org/1.0/identifiers/did:trail:agent:example-gmbh-de-support-bot-v2"
  }]
}
```

### B.3 Self-Signed DID Document

```json
{
  "@context": ["https://www.w3.org/ns/did/v1", "https://trailprotocol.org/ns/did/v1"],
  "id": "did:trail:self:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
  "trail:trailMode": "self-signed",
  "verificationMethod": [{
    "id": "did:trail:self:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK#key-1",
    "type": "JsonWebKey2020",
    "controller": "did:trail:self:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
    "publicKeyJwk": {
      "kty": "OKP", "crv": "Ed25519",
      "x": "z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK"
    }
  }],
  "authentication": ["did:trail:self:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK#key-1"]
}
```

---

## References

### Normative References

- [DID-CORE] W3C. *Decentralized Identifiers (DIDs) v1.0*. https://www.w3.org/TR/did-core/
- [VC-DATA-MODEL-2.0] W3C. *Verifiable Credentials Data Model v2.0*. https://www.w3.org/TR/vc-data-model-2.0/
- [DID-SPEC-REGISTRIES] W3C. *DID Specification Registries*. https://www.w3.org/TR/did-spec-registries/
- [RFC8037] IETF. *CFRG Elliptic Curves for JOSE and COSE*. https://www.rfc-editor.org/rfc/rfc8037
- [RFC7517] IETF. *JSON Web Key (JWK)*. https://www.rfc-editor.org/rfc/rfc7517
- [RFC2119] IETF. *Key words for use in RFCs*. https://www.rfc-editor.org/rfc/rfc2119
- [STATUS-LIST-2021] W3C CCG. *Status List 2021*. https://www.w3.org/TR/vc-status-list/

### Informative References

- [EU-AI-ACT] European Parliament. *Regulation (EU) 2024/1689 on Artificial Intelligence*. https://eur-lex.europa.eu/eli/reg/2024/1689/oj
- [EIDAS-2] European Parliament. *Regulation (EU) 2024/1183 (eIDAS 2.0)*. https://eur-lex.europa.eu/eli/reg/2024/1183/oj
- [EIP-6551] Ethereum. *Token Bound Accounts*. https://eips.ethereum.org/EIPS/eip-6551
- [OID4VC] OpenID Foundation. *OpenID for Verifiable Credentials*. https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html
- [TRAIL-WHITEPAPER] Hommrich, C. *TRAIL Protocol Whitepaper v1.0*. 2026. https://trailprotocol.org/whitepaper
- [TRAIL-BLUEPRINT-1] Hommrich, C. *TRAIL Protocol Blueprint Part 1*. 2026. https://trailprotocol.org/blueprint/part1
- [TRAIL-BLUEPRINT-2] Hommrich, C. *TRAIL Protocol Blueprint Part 2*. 2026. https://trailprotocol.org/blueprint/part2

---

*© 2026 Christian Hommrich / TRAIL Protocol Initiative. Licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).*
*This specification is submitted to the W3C Credentials Community Group for review.*
*Repository: https://github.com/trailprotocol/trail-did-method*
