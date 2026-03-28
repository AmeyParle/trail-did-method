# TRAIL Protocol - Examples

Working examples demonstrating how to use the `did:trail` DID method in practice.

## Sample DID Documents

| File | Description |
|------|-------------|
| `self-did-document.json` | Self-issued DID (Tier 0) - no registry, local trust only |
| `org-did-document.json` | Organization DID with KYB attestation (Tier 1) |
| `agent-did-document.json` | AI Agent DID with full trust chain (Tier 2) |

## Code Examples

> Coming soon - contributions welcome! See [Issue #4](https://github.com/trailprotocol/trail-did-method/issues/4).

Planned examples:

- **JavaScript/Node.js** - DID resolution, VC verification
- More languages welcome via PR

## Reference Implementation

The [`@trailprotocol/core`](https://www.npmjs.com/package/@trailprotocol/core) npm package provides the full reference implementation:

- DID generation and resolution
- JSON Canonicalization (JCS, RFC 8785)
- DataIntegrityProof (`eddsa-jcs-2023`)
- Verifiable Credential issuance and verification

```bash
npm install @trailprotocol/core
```

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines. `examples/` is a great entry point for first-time contributors.
