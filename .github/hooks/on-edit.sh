#!/bin/sh
# Reads PostToolUse stdin JSON and, when the tool was a file edit,
# injects a system message reminding Copilot to offer release-manager tasks.

INPUT=$(cat)

# Match any file-writing tool
case "$INPUT" in
  *'"toolName":"replace_string_in_file"'*|\
  *'"toolName":"multi_replace_string_in_file"'*|\
  *'"toolName":"create_file"'*|\
  *'"toolName":"edit_notebook_file"'*)
    printf '{"systemMessage":"Files were just modified. Remind the user they can run @release-manager to bump the version, update the README, update the CHANGELOG, and sync the GitHub project. Only mention this once — do not repeat on every message."}'
    ;;
  *)
    printf '{}'
    ;;
esac
