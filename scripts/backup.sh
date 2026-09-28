#!/usr/bin/env bash
# Back up the live OBS setup on macOS.
#
#   1. detects which Mac this is (ComputerName), override with DEVICE=...
#   2. zips the FULL raw scenes/profiles snapshot -> Google Drive/Backups/OBS/<Label>-<timestamp>.zip
#      (keeps stream keys + widget URLs; never committed)
#   3. copies a SCRUBBED version into devices/<slug>/ for git
#
# Usage:  make backup            (or)   bash scripts/backup.sh
#         bash scripts/backup.sh setup
#         DEVICE=mac-mini make backup   (force the device)
set -euo pipefail

SCRIPT_PATH="$(python3 -c 'import os,sys; print(os.path.realpath(sys.argv[1]))' "${BASH_SOURCE[0]}")"
SCRIPT_DIR="$(dirname "$SCRIPT_PATH")"
SCRIPT_REPO="$(cd "$SCRIPT_DIR/.." && pwd)"
SANITIZER="${OBS_SANITIZER:-$SCRIPT_DIR/sanitize.py}"
DEFAULT_REPO="$HOME/Developer/mrdemonwolf/obs-setup"
if [ ! -d "$DEFAULT_REPO/.git" ]; then DEFAULT_REPO="$SCRIPT_REPO"; fi
DEFAULT_BACKUP_DIR="$HOME/Library/CloudStorage/GoogleDrive-nathanial.henniges@mrdemonwolf.com/My Drive/Backups/OBS"
PREFS="com.mrdemonwolf.obs-backup"
if [ "${1:-}" = setup ]; then
  read -r -p "Backup folder [$DEFAULT_BACKUP_DIR]: " chosen_dir
  chosen_dir="${chosen_dir:-$DEFAULT_BACKUP_DIR}"
  if [ ! -d "$chosen_dir" ]; then
    echo "Folder not found: $chosen_dir" >&2
    exit 1
  fi
  read -r -p "Repo folder [$DEFAULT_REPO]: " chosen_repo
  chosen_repo="${chosen_repo:-$DEFAULT_REPO}"
  if [ ! -f "$SANITIZER" ] || [ ! -d "$chosen_repo/.git" ]; then
    echo "OBS setup repo not found: $chosen_repo" >&2
    exit 1
  fi
  defaults write "$PREFS" BackupDirectory "$chosen_dir"
  defaults write "$PREFS" RepoDirectory "$chosen_repo"
  if ! command -v obs-backup >/dev/null 2>&1; then
    mkdir -p "$HOME/.local/bin"
    if [ -e "$HOME/.local/bin/obs-backup" ] && [ ! -L "$HOME/.local/bin/obs-backup" ]; then
      echo "Command already exists: $HOME/.local/bin/obs-backup" >&2
      exit 1
    fi
    ln -sfn "$SCRIPT_PATH" "$HOME/.local/bin/obs-backup"
    echo "Installed at ~/.local/bin/obs-backup. Add ~/.local/bin to PATH if needed."
  fi
  echo "Saved. Run obs-backup anytime."
  exit 0
fi
if [ "${1:-}" != "" ]; then
  echo "Usage: obs-backup [setup]" >&2
  exit 1
fi
REPO="${OBS_REPO_DIR:-$(defaults read "$PREFS" RepoDirectory 2>/dev/null || echo "$SCRIPT_REPO")}"
SRC="${OBS_EXPORT_DIR:-$HOME/Library/Application Support/obs-studio/basic}"
BACKUP_DIR="${OBS_BACKUP_DIR:-$(defaults read "$PREFS" BackupDirectory 2>/dev/null || echo "$DEFAULT_BACKUP_DIR")}"
STAMP="$(date +%F-%H%M%S)"

# --- which device? -----------------------------------------------------------
# ponytail: substring match on ComputerName; add a case if you get a 3rd Mac.
name="${DEVICE:-$(scutil --get ComputerName)}"
name_lower="$(printf '%s' "$name" | tr '[:upper:]' '[:lower:]')"
case "$name_lower" in
  macbook-pro|*macbook*) SLUG="macbook-pro"; LABEL="MacBook Pro" ;;
  mac-mini|*mini*)       SLUG="mac-mini";    LABEL="Mac Mini" ;;
  *) echo "Unknown device: '$name'"; echo "Re-run with: DEVICE=macbook-pro make backup"; exit 1 ;;
esac

# --- OBS data must exist ------------------------------------------------------
if [ ! -d "$SRC" ] || [ -z "$(ls -A "$SRC" 2>/dev/null)" ]; then
  echo "Nothing to back up in: $SRC"
  echo "Install OBS or set OBS_EXPORT_DIR to an OBS export folder."
  exit 1
fi
if [ ! -f "$SANITIZER" ] || [ ! -d "$REPO/.git" ]; then
  echo "OBS setup repo not found: $REPO; run obs-backup setup" >&2
  exit 1
fi

# --- 1) full raw zip for Google Drive ----------------------------------------
if [ ! -d "$BACKUP_DIR" ]; then
  echo "Google Drive backup folder not available: $BACKUP_DIR" >&2
  exit 1
fi
ZIP="$BACKUP_DIR/${LABEL// /-}-$STAMP.zip"
if [ -e "$ZIP" ]; then
  echo "Backup already exists: $ZIP" >&2
  exit 1
fi
TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/obs-backup.XXXXXX")"
trap 'rm -rf "$TMP_DIR"' EXIT
ditto "$SRC" "$TMP_DIR/snapshot"
( cd "$TMP_DIR/snapshot" && zip -r -q "$TMP_DIR/backup.zip" . -x '.DS_Store' )
OBS_REPO_DIR="$REPO" python3 "$SANITIZER" "$TMP_DIR/snapshot" "$SLUG" "$LABEL"
mv "$TMP_DIR/backup.zip" "$ZIP"
echo "zip:  $ZIP"

echo
echo "Done. Review and commit:"
echo "  git -C \"$REPO\" status"
echo "  git -C \"$REPO\" add devices/$SLUG"
echo "  git -C \"$REPO\" diff --cached -- devices/$SLUG"
echo "  git -C \"$REPO\" commit -m \"backup($SLUG): $STAMP\" -- devices/$SLUG"
