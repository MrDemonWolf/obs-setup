# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Personal OBS Studio config store for two Macs — **MacBook Pro** (`macbook-pro`,
portable) and **Mac Mini** (`mac-mini`, main home rig). It holds reference
docs, per-device backups, an import-ready color-coded scene collection, and a
static HTML previewer. No app to run; it's tooling around OBS's own JSON.

There are no external dependencies — Python 3 standard library, Bash, and Make
only. No package manager, no build step, no test framework.

## Commands

```bash
make gen      # regenerate devices/macbook-pro/scenes/MBP-Streaming.json (+ index.json)
make backup   # zip ~/Downloads/OBS export, then file a scrubbed copy into devices/<slug>/
make preview  # serve the previewer at http://localhost:8000 (python3 -m http.server)
make          # list targets
```

- **Tests:** there is no test framework. `scripts/gen_scene_collection.py`
  runs an inline `selfcheck()` (ABGR color math + every scene item references a
  real source) on each run — `make gen` fails loudly if it breaks. To exercise
  the sanitizer, point it at a throwaway export dir and a temp slug:
  `python3 scripts/sanitize.py <export_dir> testdev "Test Dev"` then delete
  `devices/testdev/`.
- **Force a device** when `make backup` mis-detects:
  `DEVICE=mac-mini make backup`. Change the export folder with
  `OBS_EXPORT_DIR=... make backup`.

## Architecture

Three pieces, joined by a few conventions that must stay in sync.

### 1. Scene generation (`scripts/gen_scene_collection.py`)
Data-driven: the `LAYOUT` blocks (`LEAVES`, `SRC_SCENES`, `MAIN_SCENES`,
`DIVIDERS`, `SCENE_ORDER`) and `PALETTE` at the top of the file are the source
of truth for the MacBook Pro setup. Editing those + `make gen` rewrites the
importable collection. UUIDs are deterministic (`uuid5`) so regenerating
produces no spurious diffs.

The non-obvious part is **color**: OBS stores a source's list color on the
*scene item* at `private_settings.color`, as a **signed 32-bit ABGR integer**
(`0xAABBGGRR`, red is the low byte). `abgr()` encodes it; the previewer's
`abgrToCss()` decodes it. See `docs/obs-json-reference.md`.

### 2. Backup pipeline (`scripts/backup.sh` → `scripts/sanitize.py`)
`backup.sh` detects the device from `scutil --get ComputerName` (substring
`MacBook`/`Mini`), zips the **full raw** export to
`~/Downloads/OBS-backups/<Label>-<date>.zip` (for Google Drive — keeps
secrets, never git), then calls `sanitize.py` to mirror the export into
`devices/<slug>/` and write that device's `index.json`.

**Secret boundary — the critical invariant:** two fields are secrets and are
wiped to `""` before anything reaches git:
- browser source `settings.url` in scene collections (widget tokens), and
- `settings.key` in a profile's `service.json` (Twitch stream key).
Only the Downloads `.zip` keeps them. Do not weaken this in `sanitize.py`.

### 3. Previewer (`index.html`, repo root)
Self-contained (inline CSS+JS, no build). Also the GitHub Pages site — Pages
serves the repo root, so the previewer `fetch()`es `devices/<slug>/index.json`
and the scene files by relative path. A drag-drop fallback handles `file://`
(where fetch is blocked). Renders scenes in `scene_order`, coloring each item
from its `private_settings.color`; empty dash-named scenes render as dividers.

## Keep these in sync when editing

- **Palette:** `PALETTE` (generator) ↔ `LEGEND` (`index.html`) ↔
  `docs/color-coding.md`. Three copies of the same 7 colors, by design (no
  build to share them).
- **Devices:** adding a Mac means a new `case` in `scripts/backup.sh`, a new
  slug in `DEVICES` in `index.html`, and a `devices/<slug>/` folder.
- **OBS source ids** in the generator (`av_capture_input`, `screen_capture`,
  `browser_source`, `text_ft2_source`) are macOS/OBS-version specific; OBS
  flags a source to reconfigure rather than failing import if one is off.
