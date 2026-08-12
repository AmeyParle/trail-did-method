# Contributing to did:trail

Thank you for your interest in contributing to the TRAIL Protocol DID Method specification. This is an open standard and we welcome all forms of contribution - especially critical feedback.

## Why Contribute to TRAIL?

- **Co-Author Credit on W3C DID Method** - Significant contributions are credited in the specification itself, registered at the W3C DID Method Registry.
- **Influence on an Emerging Identity Standard** - TRAIL is early-stage. Your input shapes how AI agent identity works globally - before the architecture is locked.
- **Potential Role at TrailSign AI** - TrailSign AI (TSAI) is the commercial entity building on TRAIL. Outstanding contributors may be invited to advisory or technical roles.
- **Early Access to TRAIL Ecosystem** - Contributors get early access to reference implementations, SDKs, and the trust registry infrastructure as it rolls out.

## Getting Started

New here? These are the best entry points:

- **"Good First Issue" Label** - Browse issues tagged [`good first issue`](https://github.com/trailprotocol/trail-did-method/labels/good%20first%20issue) for scoped, beginner-friendly tasks (e.g., adding DID resolution examples, documentation improvements).
- **Architecture Reviews** - We actively seek external critique of core design decisions. Look for [`architecture-review`](https://github.com/trailprotocol/trail-did-method/labels/architecture-review) issues - these are RFCs where your expertise has direct impact.
- **Security Audits** - Cryptographic protocol review, threat modeling, key rotation semantics. See [`security`](https://github.com/trailprotocol/trail-did-method/labels/security) labeled issues.
- **DID Resolution Examples** - Write practical examples showing how to resolve `did:trail` DIDs in different languages and frameworks. Great way to learn the spec by documenting it.

## What We're Looking For

We especially value contributors with experience in:

- **DID / SSI / Verifiable Credentials** - If you've worked with `did:web`, `did:ion`, `did:key`, or Verifiable Credential ecosystems, you understand the landscape TRAIL operates in.
- **Protocol Design** - Federation models, trust propagation, conflict resolution in distributed systems.
- **Security & Cryptography** - EdDSA, JSON Canonicalization Scheme (JCS), key rotation, revocation mechanisms, threat modeling.
- **AI Agent Development** - If you build with LangChain, CrewAI, AutoGen, or similar frameworks, you know the identity gaps TRAIL aims to fill.
- **Regulated or administrative practice** - If you operate a register, issue certifications, run identity or eligibility checks, or work inside a supervisory regime, you hold knowledge this specification cannot obtain by reasoning about it. Several open sections exist precisely because that knowledge is missing.

You don't need all of these. Deep expertise in any one area is valuable, and domain practice counts as expertise.

## Scope of Contributions

Being explicit about scope saves everyone time.

**In scope**

- The `did:trail` method specification: syntax, operations, federation, trust model, credential types.
- Roles the specification references but does not define. These are the most valuable contributions available, because they need practitioner knowledge rather than protocol knowledge.
- Security analysis, threat models, and concrete attacks against the specification as written.
- Reference implementation (`packages/trail-core`): conformance to the specification, test vectors, interoperability fixes.
- Interoperability with other identifier methods and credential ecosystems.

**Out of scope**

- A policy or authorization language. TRAIL supplies verifiable input to an authorization decision; enforcement stays with the verifier. This is a deliberate boundary, not an oversight.
- Registry operator business terms, pricing, or commercial arrangements.
- Recognition of any credential, register, or authority in a given legal system. The specification does not and cannot confer legal effect.

**Already decided**

Some questions are settled and reopening them needs new evidence rather than a new preference: Ed25519 with JCS canonicalization as the baseline cryptosuite, no blockchain dependency, a federated model without a single root, and verifier-side trust anchor selection. Each is documented with its rationale in the specification changelog.

## Co-Authorship and Attribution

Contributions that add or materially reshape a specification section are credited in the section itself and in the changelog entry, under the contributor's own name and affiliation if they want one shown.

If you bring domain knowledge but do not want to write specification prose, that works too. Describe the practice and its constraints in an issue; we draft, you review until it matches reality, and you are credited as co-author of the result. The knowledge is the contribution, not the markdown.

## How to Contribute

### Specification Feedback

Open an issue if you have:
- Questions about the specification
- Security concerns or vulnerabilities
- Suggestions for improvement
- Objections to design decisions

Use the issue templates provided in `.github/ISSUE_TEMPLATE/`.

### Challenge the Specification

We actively invite challenges to the specification. If you can find a flaw, we want to know about it before deployment. Label your issue with `challenge` and we will respond within 7 days.

Successful challenges that lead to specification improvements will be acknowledged in the specification document.

### W3C Credentials Community Group

Discussion of the `did:trail` method in the context of W3C standards is welcome at:
- Credentials Community Group: public-credentials@w3.org · [archive](https://lists.w3.org/Archives/Public/public-credentials/)
- Agent Identity Community Group: public-agent-identity@w3.org · [archive](https://lists.w3.org/Archives/Public/public-agent-identity/)

The Agent Identity group is where questions specific to agent identity, resolution dependency and trust profiles are currently being worked out, including by projects other than this one.

### Pull Requests

For substantive specification changes, please:
1. Open an issue first to discuss the proposed change
2. Fork the repository
3. Create a branch: `spec/your-change-description`
4. Submit a Pull Request referencing the issue

For minor fixes (typos, formatting), direct PRs are welcome.

## Code of Conduct

This project has its own [Code of Conduct](CODE_OF_CONDUCT.md) adapted from the Contributor Covenant with AI-specific extensions. By participating, you agree to uphold its principles.

In short: Be constructive. Technical disagreement is welcome; personal attacks are not. Assume good intent. Report violations to conduct@trailprotocol.org.

We also adhere to the [DIF Code of Conduct](https://github.com/decentralized-identity/org/blob/master/code-of-conduct.md) when participating in DIF community spaces.

## Ethics and Governance

TRAIL Protocol maintains explicit ethical principles and a governance model:

- **[ETHICS.md](ETHICS.md)** - The ethical principles that guide protocol design decisions
- **[GOVERNANCE.md](GOVERNANCE.md)** - How decisions are made, roles, and dispute resolution

All contributions are evaluated against these principles. Please review them before submitting substantial proposals.

## Community

TRAIL is developed in coordination with:

- **[Decentralized Identity Foundation (DIF)](https://identity.foundation)** - Join the [DIF Discord](https://discord.gg/decentralized-identity) to connect with other contributors. Relevant channels: `#did-methods`, TAAWG working group channels.
- **[W3C Credentials Community Group (CCG)](https://www.w3.org/community/credentials/)** - Mailing list: [public-credentials@w3.org](mailto:public-credentials@w3.org). Archive: [lists.w3.org](https://lists.w3.org/Archives/Public/public-credentials/)

## Branch Naming

When submitting PRs, please use one of these branch prefixes:

- `spec/` - Specification changes (e.g., `spec/add-key-rotation-section`)
- `feat/` - New features or examples (e.g., `feat/python-resolution-example`)
- `fix/` - Bug fixes (e.g., `fix/typo-in-did-syntax`)
- `docs/` - Documentation improvements (e.g., `docs/update-roadmap`)

## Licensing

By contributing, you agree that your contributions will be licensed under the project's dual license:
- **Specification contributions** (`.md` files in `spec/`): [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- **Code contributions**: [MIT License](https://opensource.org/licenses/MIT)

## Contact

Christian Hommrich - christian.hommrich@trailprotocol.org
