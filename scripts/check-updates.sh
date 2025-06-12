#!/bin/bash

# Configuration
REPO_PATH="/Users/ronellbradley/Desktop/Bradley-Health"
LOG_FILE="$REPO_PATH/scripts/auto-update.log"

echo "=== Auto-Update Status ==="
echo "Last run: $(stat -f "%Sm" "$LOG_FILE" 2>/dev/null || echo "Never")"
echo
echo "=== Recent Log Entries ==="
tail -n 20 "$LOG_FILE" 2>/dev/null || echo "No log entries found"
echo
echo "=== Git Status ==="
cd "$REPO_PATH" && git status 