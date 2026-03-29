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

You don't need all of these. Deep expertise in any one area is valuable.

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
- Mailing list: public-credentials@w3.org
- Archive: https://lists.w3.org/Archives/Public/public-credentials/

### Pull Requests

For substantive specification changes, please:
1. Open an issue first to discuss the proposed change
2. Fork the repository
3. Create a branch: `spec/your-change-description`
4. Submit a Pull Request referencing the issue

For minor fixes (typos, formatting), direct PRs are welcome.

## Code of Conduct

This project adheres to the [DIF Code of Conduct](https://github.com/decentralized-identity/org/blob/master/code-of-conduct.md). By participating, you agree to uphold its principles of open, inclusive, and collaborative engagement.

In short: Be constructive. Technical disagreement is welcome; personal attacks are not. Assume good intent. If conflicts arise, follow the [DIF escalation process](https://github.com/decentralized-identity/org/blob/master/code-of-conduct.md#reporting-guidelines).

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
