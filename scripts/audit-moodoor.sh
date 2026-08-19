#!/usr/bin/env bash
set -euo pipefail
WORK=/home/ubuntu/moodoor-merge
ARCHIVE="$WORK/archive"
mkdir -p "$ARCHIVE"
unzip -q -o /home/ubuntu/upload/moodoor-studio.zip -d "$ARCHIVE"
REPORT="$WORK/archive-audit.md"
: > "$REPORT"
printf '# Moodoor Studio Archive Audit\n\n' >> "$REPORT"
printf '## File Inventory\n' >> "$REPORT"
find "$ARCHIVE" -maxdepth 3 -type f | sed "s|$ARCHIVE/||" | sort >> "$REPORT"
printf '\n## Package Manifest\n' >> "$REPORT"
sed -n '1,220p' "$ARCHIVE/package.json" >> "$REPORT"
printf '\n## Client Source Directories\n' >> "$REPORT"
find "$ARCHIVE/client" -maxdepth 3 -type f | sed "s|$ARCHIVE/||" | sort >> "$REPORT"
printf '\n## Server Source Directories\n' >> "$REPORT"
find "$ARCHIVE/server" -maxdepth 3 -type f | sed "s|$ARCHIVE/||" | sort >> "$REPORT"
printf '\n## Moodoor References\n' >> "$REPORT"
grep -RIn --exclude-dir=node_modules --exclude-dir=dist -E 'moodoor|Moodoor|quiz|story.?drop|match' "$ARCHIVE/client" "$ARCHIVE/server" "$ARCHIVE/shared" 2>/dev/null | head -240 >> "$REPORT" || true
printf '\n## Environment and API References\n' >> "$REPORT"
grep -RIn --exclude-dir=node_modules --exclude-dir=dist -E 'process\.env|VITE_|DATABASE_URL|OPENAI|GEMINI|FIREBASE|STRIPE|API_KEY' "$ARCHIVE" 2>/dev/null | head -160 >> "$REPORT" || true
wc -l "$REPORT"
sed -n '1,280p' "$REPORT"
