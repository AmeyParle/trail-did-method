# TRAIL Protocol — did:trail DID Method

**Trust Registry for AI Identity Layer**

[![W3C DID Core 1.0](https://img.shields.io/badge/W3C-DID%20Core%201.0-blue)](https://www.w3.org/TR/did-core/)
[![VC Data Model 2.0](https://img.shields.io/badge/W3C-VC%202.0-blue)](https://www.w3.org/TR/vc-data-model-2.0/)
[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![License: MIT](https://img.shields.io/badge/Code-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Status: Draft](https://img.shields.io/badge/Status-Draft-orange)](https://github.com/trailprotocol/trail-did-method/issues)

---

## What is TRAIL?

TRAIL (Trust Registry for AI Identity Layer) is an open cryptographic trust protocol for AI systems and autonomous agents operating in B2B commerce environments.

As AI agents increasingly act on behalf of organizations — negotiating contracts, providing advice, executing decisions — there is no infrastructure to answer the fundamental question: **"Can I trust this AI system?"**

TRAIL solves this by providing:
- **Decentralized Identifiers** (`did:trail`) for AI systems and the organizations behind them
- **Verifiable Credentials** attesting to AI identity, policy, and behavior standards
- **Revocation mechanisms** that create real economic consequences for misuse
- **EU AI Act compliance** alignment by design (Articles 13, 14, 26)

**TRAIL is not a blockchain.** It builds on established web infrastructure (W3C DID Core 1.0, VC 2.0, Ed25519) — the same standards that underpin Europe's eIDAS 2.0 digital identity infrastructure.

---

## Quick Example

```
did:trail:org:acme-corp-eu
did:trail:agent:acme-corp-eu-sales-assistant-v2
did:trail:self:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK
```

A `did:trail` DID uniquely identifies either:
- An **organization** (`org`) operating AI systems
- A specific **AI agent** (`agent`) operated by a registered organization
- A **self-signed** identity (`self`) for early adopters and testing

---

## Repository Structure

```
trail-did-method/
├── README.md                    ← This file
├── LICENSE                      ← CC BY 4.0 (spec) + MIT (code)
├── CONTRIBUTING.md              ← How to contribute
├── spec/
│   └── did-method-trail-v1.md  ← Complete DID Method Specification
├── methods/
│   └── trail.json              ← W3C DID Registry submission file
├── examples/
│   ├── org-did-document.json   ← Example org DID Document
│   ├── agent-did-document.json ← Example agent DID Document
│   └── self-did-document.json  ← Example self-signed DID Document
└── .github/
    └── ISSUE_TEMPLATE/         ← Issue templates
```

---

## Specification

The full `did:trail` DID Method Specification is available in [`spec/did-method-trail-v1.md`](spec/did-method-trail-v1.md).

Key sections:
- [DID Method Syntax](spec/did-method-trail-v1.md#4-did-method-syntax)
- [DID Document Structure](spec/did-method-trail-v1.md#5-did-document-structure)
- [CRUD Operations](spec/did-method-trail-v1.md#6-method-operations)
- [Trust Extensions](spec/did-method-trail-v1.md#7-trail-trust-extensions)
- [Security Considerations](spec/did-method-trail-v1.md#8-security-considerations)

---

## W3C Registry Submission

The `methods/trail.json` file in this repository is submitted for inclusion in the [W3C DID Specification Registries](https://github.com/w3c/did-spec-registries).

**Status:** Submission pending (PR to be opened at https://github.com/w3c/did-spec-registries)

---

## Design Principles

1. **Open Protocol** — The protocol itself is free and open. Trust comes from transparency.
2. **Standards-based** — Built on W3C DID Core 1.0, VC 2.0, Ed25519 — no proprietary dependencies.
3. **Regulation-ready** — Designed for EU AI Act (2027) and eIDAS 2.0 compliance.
4. **Complementary, not competitive** — Works alongside OID4VC, did:web, did:key, DIF Universal Resolver.
5. **Self-sovereign entry point** — Start with `did:trail:self:` without any registry. Graduate to full registration when ready.

---

## Prior Art & Related Work

| Standard | Relationship |
|----------|-------------|
| W3C DID Core 1.0 | Foundation — did:trail IS a DID method |
| W3C VC 2.0 | TRAIL issues VCs conforming to this standard |
| OpenID4VC (OID4VC) | Complementary — OID4VC handles credential exchange; TRAIL provides trust layer |
| eIDAS 2.0 / EUDIW | Future integration target — TRAIL credentials can be embedded in EUDIW-compatible wallets |
| EIP-6551 (Token-Bound Accounts) | Optional on-chain anchoring path |
| EU AI Act (2024/1689) | Regulatory driver — Art. 13, 14, 26 transparency requirements |

---

## Roadmap

- [ ] v0.1 — Specification draft (this repository) ← **YOU ARE HERE**
- [ ] v0.1 — W3C DID Registry submission (`trail.json` PR)
- [ ] v0.2 — Reference resolver implementation (Node.js/TypeScript)
- [ ] v0.3 — CLI tooling (`trail did create`, `trail did resolve`)
- [ ] v0.5 — TRAIL Registry alpha (Early Adopter Program)
- [ ] v1.0 — Production registry + independent security audit
- [ ] v1.1 — A2A (Agent-to-Agent) DID extension
- [ ] v2.0 — EUDIW integration + B2C extension

---

## Contribute

We welcome contributions, questions, and challenges. If you find a flaw in the specification — that's exactly what we want to know.

- **Open an issue** for specification questions, security concerns, or improvement suggestions
- **Join the discussion** at the W3C Credentials Community Group: [public-credentials@w3.org](mailto:public-credentials@w3.org)
- **Contact the author:** christian.hommrich@gmail.com

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## Author

**Christian Hommrich**
TRAIL Protocol Initiative
[https://trailprotocol.org](https://trailprotocol.org) *(coming soon)*

---

## License

- **Specification** (all `.md` files in `spec/`): [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/)
- **Reference implementations** (all code): [MIT License](https://opensource.org/licenses/MIT)

---

*First committed: 2026-03-01 — establishing Prior Art for the `did:trail` namespace and TRAIL Protocol concept.*
*This repository constitutes a public timestamp for the TRAIL DID Method specification.*
