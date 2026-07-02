#!/usr/bin/env bash
# Report eval results to Agent Store from your local machine or CI.
#
# Usage:
#   AGENTSTORE_URL=http://localhost:3000 \
#   AGENTSTORE_API_KEY=your-secret \
#   AGENTSTORE_SLUG=agent-ars \
#   ./scripts/report-to-agentstore.sh [eval-results.json]
#
# If no file is passed, only syncManifest is sent (re-reads agent.manifest.json from GitHub).

set -euo pipefail

AGENTSTORE_URL="${AGENTSTORE_URL:?Set AGENTSTORE_URL}"
AGENTSTORE_API_KEY="${AGENTSTORE_API_KEY:?Set AGENTSTORE_API_KEY}"
AGENTSTORE_SLUG="${AGENTSTORE_SLUG:?Set AGENTSTORE_SLUG}"

EVAL_FILE="${1:-}"
PAYLOAD_FILE="$(mktemp)"
trap 'rm -f "$PAYLOAD_FILE"' EXIT

if [ -n "$EVAL_FILE" ] && [ -f "$EVAL_FILE" ]; then
  jq -n \
    --argfile evals "$EVAL_FILE" \
    '{
      evalSuites: $evals.evalSuites,
      technicalScores: ($evals.technicalScores // null),
      scoreNotes: ($evals.scoreNotes // null),
      version: ($evals.version // null),
      syncManifest: true
    } | with_entries(select(.value != null))' > "$PAYLOAD_FILE"
else
  jq -n '{ syncManifest: true }' > "$PAYLOAD_FILE"
fi

curl -sf -X POST \
  -H "Authorization: Bearer ${AGENTSTORE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d @"$PAYLOAD_FILE" \
  "${AGENTSTORE_URL%/}/api/agents/${AGENTSTORE_SLUG}/ci" | jq .
