#!/usr/bin/env bash

# TRAIL Protocol - curl/HTTP DID Resolution Example
#
# Demonstrates the HTTP resolution pattern for registry-backed
# did:trail identifiers (typically org/agent mode).
#
# Usage:
#   ./resolve-http.sh "did:trail:org:acme-corp-eu-a7f3b2c1e9d04f5a"

# Note:
# This example demonstrates the expected HTTP request format for
# registry-backed DID resolution. A successful live response depends
# on the public registry endpoint being reachable from your environment.


set -euo pipefail

DID="${1:-did:trail:org:acme-corp-eu-a7f3b2c1e9d04f5a}"
BASE_URL="https://registry.trailprotocol.org/1.0/identifiers"

echo "Resolving DID via TRAIL registry API..."
echo "DID: $DID"
echo

curl -sS \
  -H "Accept: application/did+ld+json" \
  "${BASE_URL}/${DID}"

echo