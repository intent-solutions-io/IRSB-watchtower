#!/bin/bash
# CI-compatible canonical drift check.
# Compares 000-docs/000-*.md files against pinned SHA-256 hashes
# in scripts/canonical-hashes.json (no access to irsb-solver needed).
#
# Usage: ./scripts/check-canonical-ci.sh
# Exit 0 = all hashes match, Exit 1 = drift or missing file.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${SCRIPT_DIR}/.."
HASH_FILE="${SCRIPT_DIR}/canonical-hashes.json"
DOCS_DIR="${REPO_ROOT}/000-docs"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

if [ ! -f "$HASH_FILE" ]; then
  echo -e "${RED}[ERROR]${NC} Hash file not found: $HASH_FILE"
  echo "Run 'pnpm canonical:refresh' to generate it."
  exit 1
fi

has_drift=0
checked=0

echo "Checking canonical doc hashes..."
echo ""

# Parse JSON with basic tools (no jq dependency)
while IFS=: read -r key value; do
  # Strip JSON formatting
  filename=$(echo "$key" | tr -d ' "')
  expected=$(echo "$value" | tr -d ' ",}')

  [ -z "$filename" ] || [ -z "$expected" ] && continue
  [[ "$filename" == "{" ]] || [[ "$filename" == "}" ]] && continue

  local_file="${DOCS_DIR}/${filename}"
  checked=$((checked + 1))

  if [ ! -f "$local_file" ]; then
    echo -e "${RED}[MISSING]${NC} $filename"
    has_drift=1
    continue
  fi

  actual=$(sha256sum "$local_file" | cut -d' ' -f1)

  if [ "$actual" = "$expected" ]; then
    echo -e "${GREEN}[OK]${NC} $filename"
  else
    echo -e "${RED}[DRIFT]${NC} $filename"
    echo "  Expected: ${expected:0:16}..."
    echo "  Actual:   ${actual:0:16}..."
    has_drift=1
  fi
done < "$HASH_FILE"

echo ""
if [ $checked -eq 0 ]; then
  echo -e "${RED}[ERROR]${NC} No entries found in $HASH_FILE"
  exit 1
fi

if [ $has_drift -eq 0 ]; then
  echo -e "${GREEN}All $checked canonical doc(s) match pinned hashes.${NC}"
  exit 0
else
  echo -e "${RED}Drift detected! Update docs from irsb-solver, then run 'pnpm canonical:refresh'.${NC}"
  exit 1
fi
