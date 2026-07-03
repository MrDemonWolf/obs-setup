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
with a package manager and build step. Renders seamless-looping stream scenes
to video for OBS media sources. Run everything from inside `remotion/`:

```bash
npm install
npm run obs         # macOS-style previewer at http://localhost:5178 (Vite + @remotion/player)
npm run dev         # Remotion Studio
npm run lint        # eslint src + tsc
npm run render:all  # render every scene into out/ (see render-all.mjs)
# one at a time (comp ids):
npx remotion render <CompId> out/<name>.mp4
#   StartingSoon | BRB | JustChatting | Streaming | CoworkingSolo | CoworkingDual | EndingStream | Background | Socials
```

Architecture:

- **`src/scenes.ts` is the single source of truth** for the **9** scenes, each
  with `id`, `label`, `component`, `props`, and optional `width`/`height`.
  `src/Root.tsx` registers a `<Composition>` per scene (applying per-scene
  `width ?? VIDEO.width` / `height ?? VIDEO.height` — so `Socials` is 760×180,
  the rest 1920×1080). `preview/ObsPreview.tsx` (button-per-scene switcher)
  imports the same list. Add a scene there once.
- **Card scenes** (`StartingSoon`, `BRB`, `EndingStream`) use `src/Scene.tsx`,
  which layers `Background` → `PawTrail` (walking footsteps) → `TitleChip`
  (glass panel: title + mono status line) → `Mascot`. `mood` picks the vibe:
  `hero` (open-mouth mascot) / `calm` / `ember` (warm wind-down embers). Only
  `ember` changes the background; the mascot mouth is a static `mascotSrc` in
  `scenes.ts` (`logo-main.svg` open / `logo-mouth-closed.svg` closed). The
  `Mascot talking` mouth-swap prop exists but no registered scene uses it, and
  the mascot has **no** glow/spotlight.
- **`JustChatting`** = `JustChattingScene.tsx`: a `night` `Background` + a
  webcam frame outline + an empty CHAT panel. No mascot, no widgets — you embed
  your real cam + chat over the boxes.
- **`Streaming`** (`StreamFrame.tsx`) = just `<Background variant="glow" />` —
  clean animated bg, no bar, no zones. Stack game capture / cam / widgets on top.
- **Co-Working** = two comps in `CoworkFrame.tsx`, both `Background variant="glow"`
  + baked `CamFrame` cam zone(s) only (no bar, no widget boxes — place timer /
  tasks / chat / now-playing OBS sources in the open space):
  **`CoworkingSolo`** = one cam frame bottom-left; **`CoworkingDual`** = big hero
  cam (left) + small circular facecam (top-right PiP). `CamFrame.tsx` = soft
  rounded (or `shape="circle"`) cerulean border + gentle glow, transparent
  centre. Tweak cam positions by editing the `CamFrame` coords.
- **`Background`** = `BackdropScene.tsx` → just `<Background/>` (aurora +
  starfield + full moon + drifting embers + dot grid); no handle, no paw prints.
  The most flexible overlay.
- **`Socials`** = `Socials.tsx` `SocialsScene` (760×180, transparent) that fades
  through brand logos one at a time. Logos in `public/brands/`; edit the
  platform list/handles in `Socials.tsx`. Rendered as `socials.mov` (ProRes
  4444, alpha) + `socials.gif`.
- **Wolf ambience** lives in `src/wolf/` (`Moon`, `Starfield`, `Embers`,
  `PawTrail`; barrel `wolf/index.ts`) + `Background.tsx` (`variant`:
  night/ember/glow/minimal — `glow` = aurora + moon, no starfield/embers).
  `PawTrail` runs only on card scenes (via `Scene.tsx`),
  not in the shared `Background`.
- **Seamless loop is the invariant.** All motion is `loopSin`/`loopTri` (from
  `theme.ts`) over the full `durationInFrames`, so frame 0 flows into the last
  frame with no jump. Do NOT add entrance-once animations or `Math.random()` /
  `Date` per frame — both break the loop / determinism. The starfield/embers use
  a seeded LCG computed once at module load.
- **Assets** are drop-in via `public/` and referenced with `staticFile()`;
  `Mascot`/brand logos use `<Img onError>` fallbacks. The Vite previewer sets
  `publicDir` to `../public` so `staticFile` assets resolve inside `<Player>`.
- CSS transitions/animations and Tailwind animation classes do **not** render
  in Remotion — animate with `useCurrentFrame()` + `interpolate()` only.
- **Perf / formats:** opaque scenes render to H.264 MP4 (hardware-decoded in
  OBS on Apple Silicon — the lightest option; a GIF is heavier). Transparent
  `Socials` → ProRes 4444 `.mov` (hardware-decoded alpha) + GIF. Glass elements
  use plain translucent fills, not `backdrop-filter` (expensive to render).
  Fonts (`fonts.ts`) = **Montserrat** (free Proxima Nova stand-in; `display` and
  `mono` are the same family), loading only the weights/subset used.
  `render-all.mjs` renders the 8 full-frame ids to MP4, then `Socials` to
  `.mov` + `.gif` and a bonus `Background.gif`, into `out/` (which is
  gitignored). `Socials` is intentionally omitted from the 8-id array.
