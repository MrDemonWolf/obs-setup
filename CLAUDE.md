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
  `docs/color-coding.md`. Three copies of OBS's 8 preset colors, one per
  category, by design (no build to share them). Full scene / group / source
  table with the color per item lives in `docs/adhd-setup-guide.md`. Background
  and standby images come from `SCENES_IMAGES` (a Google Drive path set in the
  generator; this-Mac only).
- **Devices:** adding a Mac means a new `case` in `scripts/backup.sh`, a new
  slug in `DEVICES` in `index.html`, and a `devices/<slug>/` folder.
- **OBS source ids** in the generator (`av_capture_input`, `browser_source`,
  `sck_audio_capture`, `image_source`, `ffmpeg_source`) are macOS/OBS-version
  specific; OBS flags a source to reconfigure rather than failing import if one
  is off. Per-app audio (Discord/Chrome/Apple Music) uses newest OBS (30+)
  "macOS Audio Capture" = `sck_audio_capture` (ScreenCaptureKit, macOS 13+), set
  to Application mode. Ref: obsproject.com/kb/macos-desktop-audio-capture-guide.

## Animated overlays (`remotion/`)

A **separate Node project** (Remotion 4, React 19) — the only part of the repo
with a package manager and build step. Renders looping animated stream scenes
(Starting Soon / BRB / Just Chatting / Co-Working / Ending Stream) to MP4 for
OBS media sources. Run everything from inside `remotion/`:

```bash
npm install
npm run obs      # OBS-style previewer at http://localhost:5178 (Vite + @remotion/player)
npm run dev      # Remotion Studio
npm run lint     # eslint src + tsc (src only; preview/ has its own tsconfig)
npx remotion render <CompId> out/<name>.mp4   # StartingSoon | BRB | JustChatting | Coworking | EndingStream
```

Architecture:

- **`src/scenes.ts` is the single source of truth** for the 5 scenes (id +
  props). Both `src/Root.tsx` (registers a `<Composition>` per scene) and
  `preview/ObsPreview.tsx` (the OBS mockup) import it — add a scene there once.
- **`src/Scene.tsx`** composes three toggleable layers: `Background`
  (`showBackground`), `TitleChip` (`showTitle`, a frosted macOS-glass panel —
  title + one mono status line), `Mascot` (`showMascot`). `preview/` is a
  simple macOS-window scene switcher (button per scene) built on
  `@remotion/player`.
- **Seamless loop is the invariant.** All motion is `theme.ts`'s `loopSin()`
  (a `sin()` over the full `durationInFrames`), so frame 0 flows into the last
  frame with no jump. Do NOT add entrance-once animations or `Math.random()` /
  `Date` per frame — both break the loop / determinism. The starfield uses a
  seeded LCG computed once at module load.
- **Assets are drop-in via `public/`** and referenced with `staticFile()`.
  `Mascot`/`Background` use `<Img onError>` fallbacks, so a missing
  `logo-main.svg` or optional `bg.png` renders a placeholder instead of
  crashing. The Vite previewer sets `publicDir` to `../public` so `staticFile`
  assets resolve inside `<Player>`.
- CSS transitions/animations and Tailwind animation classes do **not** render
  in Remotion — animate with `useCurrentFrame()` + `interpolate()` only.
- **Layout overlays** (`Streaming`, `Coworking`) are simple outline scenes:
  `SimpleBg` (light gradient + glow + static grid, **no filter blur**) +
  `FrameBar` + `Frame` outlines (labelled zones with corner brackets). The
  operator stacks OBS sources on top; region labels only show when `guides` is
  set (previewer sets it; renders don't). `Background` = `<Background/>` (aurora
  + grid + drifting paw prints) + a corner handle.
- **Perf:** all scenes render to opaque MP4 (H.264 → hardware-decoded in OBS on
  Apple Silicon). Glass elements use plain translucent fills, not
  `backdrop-filter` (which is very expensive to render). `fonts.ts` loads only
  the weights/subset used (avoids ~96 font requests per render). `npm run
  render:all` renders every id + zips to `out/overlays.zip` — keep the id list
  in `render-all.mjs` in sync with `src/scenes.ts`.
- **Wolf ambience** lives in `src/wolf/` (`Moon`, `Starfield`, `HowlRings`,
  `Embers`, `PawTrail`; barrel `wolf/index.ts`) + `Background.tsx` (`variant`:
  night/ember/minimal). `JustChatting` is its own layout
  (`JustChattingScene.tsx`: cam/chat/events/social/now-playing + talking
  mascot). Mascot mouth: `logo-main.svg` open (lively), `logo-mouth-closed.svg`
  closed (calm), `Mascot talking` swaps them. Everything is `loopSin`/`loopTri`
  periodic → seamless.
