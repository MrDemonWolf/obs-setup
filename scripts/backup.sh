#!/usr/bin/env bash
# Back up the OBS export you dumped into ~/Downloads/OBS.
#
#   1. detects which Mac this is (ComputerName), override with DEVICE=...
#   2. zips the FULL raw export -> ~/Downloads/OBS-backups/<Label>-<date>.zip
#      (for Google Drive; keeps stream keys + widget URLs; never committed)
#   3. copies a SCRUBBED version into devices/<slug>/ for git
#
# Usage:  make backup            (or)   bash scripts/backup.sh
#         DEVICE=mac-mini make backup   (force the device)
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="${OBS_EXPORT_DIR:-$HOME/Downloads/OBS}"
BACKUP_DIR="$HOME/Downloads/OBS-backups"
DATE="$(date +%F)"

# --- which device? -----------------------------------------------------------
# ponytail: substring match on ComputerName; add a case if you get a 3rd Mac.
name="${DEVICE:-$(scutil --get ComputerName)}"
case "$name" in
  macbook-pro|*MacBook*) SLUG="macbook-pro"; LABEL="MacBook Pro" ;;
  mac-mini|*Mini*)       SLUG="mac-mini";    LABEL="Mac Mini" ;;
  *) echo "Unknown device: '$name'"; echo "Re-run with: DEVICE=macbook-pro make backup"; exit 1 ;;
esac

# --- the export must exist ----------------------------------------------------
if [ ! -d "$SRC" ] || [ -z "$(ls -A "$SRC" 2>/dev/null)" ]; then
  echo "Nothing to back up in: $SRC"
  echo "In OBS: Scene Collection -> Export  and  Profile -> Export  into that folder first."
  exit 1
fi

# --- 1) full raw zip for Google Drive ----------------------------------------
mkdir -p "$BACKUP_DIR"
ZIP="$BACKUP_DIR/${LABEL// /-}-$DATE.zip"
( cd "$SRC" && zip -r -q "$ZIP" . -x '.DS_Store' )
echo "zip:  $ZIP"

# --- 2) scrubbed copy into the repo ------------------------------------------
python3 "$REPO/scripts/sanitize.py" "$SRC" "$SLUG" "$LABEL"

echo
echo "Done. Review and commit:"
echo "  git -C \"$REPO\" status"
echo "  git -C \"$REPO\" add devices/$SLUG && git commit -m \"backup($SLUG): $DATE\""
