#!/bin/sh
# PostToolUse hook: fires after every file edit.
# Captures the current git diff and injects it as a system message so
# @release-manager and @change-detector always have live context.

INPUT=$(cat)
REPO="$HOME/Desktop/process-mapper"

case "$INPUT" in
  *'"toolName":"replace_string_in_file"'*|\
  *'"toolName":"multi_replace_string_in_file"'*|\
  *'"toolName":"create_file"'*|\
  *'"toolName":"edit_notebook_file"'*)

    # Collect change snapshot
    STAT=$(git -C "$REPO" diff HEAD --stat 2>/dev/null | tail -5)
    UNTRACKED=$(git -C "$REPO" ls-files --others --exclude-standard 2>/dev/null | head -10)
    VERSION=$(node -e "const p=require('$REPO/package.json');process.stdout.write(p.version)" 2>/dev/null)

    MSG="[Change Detector] Files were just modified in process-mapper (v${VERSION}).

Staged/unstaged diff stat:
${STAT:-  (no tracked changes yet)}

New untracked files:
${UNTRACKED:-  (none)}

The @change-detector subagent can produce a full structured diff report. The @release-manager agent can bump the version, update CHANGELOG, README, and push a GitHub release. Mention these options once."

    # Escape for JSON string: replace newlines with \n, backslashes, and double-quotes
    JSON_MSG=$(printf '%s' "$MSG" | python3 -c "import sys,json;print(json.dumps(sys.stdin.read()))" 2>/dev/null || printf '%s' "$MSG" | sed 's/\\/\\\\/g; s/"/\\"/g; s/$/\\n/g' | tr -d '\n')

    printf '{"systemMessage":%s}' "$JSON_MSG"
    ;;
  *)
    printf '{}'
    ;;
esac
