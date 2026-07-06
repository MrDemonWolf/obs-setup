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
make release  # render all overlays + package a dated OBS bundle .zip in ~/Downloads
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
#   StartingSoon | BRB | JustChatting | JustChattingVtuber
#   CoworkingSolo | CoworkingDual | EndingStream | Background | Socials
```

Architecture:

- **`src/scenes.ts` is the single source of truth** for the **11** scenes, each
  with `id`, `label`, `component`, `props`, and optional `width`/`height`.
  `src/Root.tsx` registers a `<Composition>` per scene (applying per-scene
  `width ?? VIDEO.width` / `height ?? VIDEO.height` — so `Socials` is 760×180,
  the rest 1920×1080). `preview/ObsPreview.tsx`
  (button-per-scene switcher) imports the same list. Add a scene there once.
- **`PawLoader`** (`PawLoader.tsx`) = reusable row of paws pulsing in a
  traveling wave (seamless via integer `harmonic`). Used inside `Countdown`
  (with `harmonic={1}` — at 60fps that matches the 30fps scenes' sweep rate).
  Reuses `Paw` (realistic wolf print: 3-lobe pad + splayed toes, shared with
  `PawTrail`, the LoadingBarks fill-edge rider, and the TitleChip corner mark).
- **`Countdown`** (`Countdown.tsx`) = transparent standalone timer chip
  (`HOWLING IN` + `M:SS` + `PawLoader`). Counts `from`s → 0 over the comp
  duration then holds at 00:00. **The one intentional non-loop** — render it out
  and set the OBS media source to play ONCE (loop OFF), start on going live.
  Full-frame 1920×1080 (chip centered) so it drops in without repositioning.
  Registered at 5:00 (`from:300`, **(300+1)×60 = 18060f @60fps** — the +1s is
  the held 00:00 frame; at `from`×fps the last frame still reads 00:01. Per-comp
  `fps:60` in `scenes.ts`, motion reads `useVideoConfig().fps`; the glow runs a
  local 8s wave, NOT `loopSin`, whose 240f period would double the rate at 60fps);
  **kept out of `render:all`** (too heavy). Render
  manually: `npx remotion render Countdown out/countdown.mov --codec=prores
  --prores-profile=4444 --image-format=png --pixel-format=yuva444p10le --log=error`.
- **`LoadingBarks`** (`LoadingBarks.tsx`) = transparent full-frame fake
  loading-bar overlay cycling wolf puns (`Loading barks…`, `Fur real, almost
  there…`, …). A **seeded module-load schedule** (LCG, loop-safe — no per-frame
  random) gives each phrase a random 20–40s hold; within EACH phrase the bar
  fills 0→100% (per-phrase `CURVES`, random uneven spurts) and maxes at 100 right
  before the next phrase starts fresh. A `Paw` rides the fill edge; bar corners
  are macOS-rounded (`8`, not a pill); fixed-width `%` never reflows. The 0.45s
  crossfade wraps the WHOLE content (text + bar + %) so the one-frame bar reset
  at each swap happens invisibly, and the glow runs an integer number of cycles
  over the comp (`GLOW_CYCLES`) — plain `loopSin` popped at the loop seam
  (13572 % 240 ≠ 0). `durationInFrames = LOADING_BARKS_DURATION`
  (sum of holds, ~9 min over 18 phrases) built at `LOADING_BARKS_FPS` (**60**; per-comp `fps` in
  `scenes.ts`). **Heavy → NOT in `render:all`**, render manually. Edit
  `BARKS`/seed to taste.
- **Card scenes** (`StartingSoon`, `BRB`, `EndingStream`) use `src/Scene.tsx`,
  which layers `Background` → `PawTrail` (walking footsteps) → `TitleChip`
  (glass panel: title + status line ending in a blinking cerulean `▊` cursor —
  ONE metaphor per row, no LED dot) → `Mascot`. All three cards share ONE cool
  `night` background — there is no per-scene mood/ember grade (an earlier warm
  "ember" wind-down on EndingStream read as a jarring different color and was
  removed). The mascot mouth is a static `mascotSrc` in
  `scenes.ts` (`logo-main.svg` open / `logo-mouth-closed.svg` closed). The
  `Mascot talking` mouth-swap prop exists but no registered scene uses it, and
  the mascot has **no** glow/spotlight.
- **Card chip: FIXED `CHIP_WIDTH` 1160px, left-aligned, glass-not-flat.** All
  three cards are the same size (sized to "The Pack Gathers" at 108px); short
  titles just leave some open space on the right (a paw glyph used to fill it but
  read wrong and was removed). Fill is a static vertical gradient +
  diagonal sheen + 1.5px top bevel (fakes macOS glass without `backdrop-filter`).
  Traffic lights use TRUE macOS hexes (`#FF5F57/#FEBC2E/#28C840`) via the shared
  `WindowChrome` (`MAC_DOT` + `WindowDots`; theme.red/amber/green stay for the
  mascot). The CARD chip renders `WindowChrome.WindowTitleBar` = dots + a
  `mrdemonwolf.com` tag on one row (it's the branded window). The transparent
  overlays (Countdown/LoadingBarks/Socials) are just widgets — `WindowDots` only,
  pinned to the top-left corner (`top:26,left:30`; Socials `top:16,left:18` for
  its 10px dots), NO domain tag. Title tracks -1.5
  (display-size extrabold). Chip never translates — it breathes in place
  (`1 + 0.007 * loopBreathe(frame, 2)`, under the mascot's amplitude). Chip is
  pinned at `left: 64` (the standard margin). The `Mascot` is pinned to ONE
  constant spot on every card scene — right-anchored (`right: 0`), vertically
  centred (`top: 50%`), `heightPct: 76`. The 76% (down from 82) is deliberate:
  right-anchored, a smaller wolf sits its LEFT edge clear of the chip so the
  title is never hidden behind it. **If you lengthen a title past "The Pack
  Gathers" bump `CHIP_WIDTH`, and enlarging the mascot creeps it left over the
  text — re-check the chip/wolf overlap either way.**
- **`JustChatting`** = `JustChattingScene.tsx`: `glow` `Background` (moon placed
  in the 198px top band, `{x:300,y:108}` — the default y sat half-inside the cam
  frame) + a 16:9 `CamFrame` + a tall chat `CamFrame` (staggered glow
  phases 0.4/0.73). No mascot, no widgets — you embed your real cam + chat over
  the frames. **`JustChattingVtuber`** = the same scene with `hideCam` — the
  cam frame drops (VTuber model goes full-screen) but the chat frame stays.
  (A plain-gameplay "Streaming" scene was removed — use `Background` instead;
  it's the same animated bg to stack game capture / cam / widgets over.)
- **Co-Working** = one data-driven `Cowork` comp (`CoworkFrame.tsx`):
  `Background variant="glow"` + baked **16:9** `CamFrame`(s) from
  `COWORK_LAYOUTS` (no bar, no widget boxes — the open space is for timer /
  tasks / chat / now-playing OBS sources). Solo + dual share ONE `HERO` cam box
  (`1152×648 @ x64,y40`, pinned up top) so the primary cam never moves switching
  solo↔dual in OBS. `solo` = just the hero; `dual` = hero top-left + a smaller
  **576×324** second (true 16:9) pinned to the **bottom-right corner** (`x=1280,
  y=692`, 64px right+bottom margins) — diagonally opposite the hero, opening an
  L-shaped widget band. Both scenes park the moon on the RIGHT
  (`{x:1568}`) — only its x is passed; height/size are the shared `MOON_Y`/`MOON_R`
  (the `Background` default y would sit inside the cam frames, where OBS's live
  feed clips it). `CamFrame.tsx` = soft
  rounded (or `shape="circle"`) cerulean border + gentle glow (staggered
  `phase` per frame — lockstep pulses read mechanical), transparent centre.
  Add/tweak layouts in `COWORK_LAYOUTS`. **A live OBS cam has square corners →
  clip it to the frame with a mask from `masks/`** (one alpha PNG per cam,
  named per overlay; `masks/README.md` has the Image Mask/Blend steps,
  `gen_masks.py` regenerates them from these coords + `radius.card`).
- **`Background`** = `BackdropScene.tsx` → just `<Background/>` (aurora +
  starfield + full moon + drifting embers + dot grid); no handle, no paw prints.
  The most flexible overlay.
- **`Socials`** = `Socials.tsx` `SocialsScene` (760×180, transparent) that fades
  through brand logos one at a time, in their **real brand colors** (no recolor
  filter; dark marks like x/instagram/tiktok's note are whitened in the SVG files
  themselves). Each handle holds a random **15–30s** (seeded schedule →
  `SOCIALS_DURATION`, the comp's registered duration). Badge has macOS
  window-style **16px** corners (not a pill; `radius.card` 30 read too round on
  the short badge). Logos in `public/brands/`; edit the platform
  list/handles in `Socials.tsx`. Rendered as `socials.mov` (ProRes 4444, alpha)
  + `socials.gif`.
- **Wolf ambience** lives in `src/wolf/` (`Moon`, `Starfield`, `Embers`,
  `PawTrail`; barrel `wolf/index.ts`) + `Background.tsx` (`variant`:
  night/glow/minimal — `glow` = aurora + moon, no starfield/embers;
  optional `moon={x}` repositions the moon into clear sky on frame scenes. Size
  (`MOON_R`) AND height (`MOON_Y`) are shared — the moon sits at ONE altitude on
  every scene and only its LEFT/RIGHT x changes (300 left / 1568 right); don't
  re-add per-scene `r` or `y`. Only the moon's HALO breathes — the body stays still (a body throb
  read wrong on a celestial object). Starfield stars carry seeded integer
  harmonics 2–4 so they twinkle at varied rates instead of one shared breath.
  `PawTrail` runs only on card scenes (via `Scene.tsx`),
  not in the shared `Background`.
- **Seamless loop is the invariant.** All motion is `loopSin`/`loopTri`/
  `loopBreathe` (from `theme.ts`) over the full `durationInFrames`, so frame 0
  flows into the last frame with no jump. Do NOT add entrance-once animations or
  `Math.random()` / `Date` per frame — both break the loop / determinism. The
  starfield/embers use a seeded LCG computed once at module load. **Gotcha:**
  the `loop*` helpers divide by `VIDEO.durationInFrames` (240) — in a comp whose
  duration isn't a multiple of 240 (LoadingBarks) or whose fps isn't 30, use a
  local wave with an INTEGER number of cycles over the comp instead.
- **Assets** are drop-in via `public/` and referenced with `staticFile()`;
  `Mascot`/brand logos use `<Img onError>` fallbacks. The Vite previewer sets
  `publicDir` to `../public` so `staticFile` assets resolve inside `<Player>`.
- CSS transitions/animations and Tailwind animation classes do **not** render
  in Remotion — animate with `useCurrentFrame()` + `interpolate()` only.
- **Perf / formats:** opaque scenes render to H.264 MP4 (hardware-decoded in
  OBS on Apple Silicon — the lightest option; a GIF is heavier). Transparent
  scenes (`Socials`, `Countdown`, `LoadingBarks`) render to **ProRes 4444 `.mov`
  as the alpha master**, but ProRes only hardware-decodes on M1/M2 **Pro/Max/Ultra**
  — a base M1/M2 Mac Mini software-decodes it and can stutter in OBS. **For the
  actual OBS media source, transcode the master to HEVC-with-alpha (`hvc1`) via
  `./to-hevc.sh out/<name>.mov`** — HEVC hardware-decodes on EVERY Apple Silicon
  chip and is a fraction of the size. (`Socials` also ships a GIF.) Glass elements
  use plain translucent fills, not `backdrop-filter` (expensive to render);
  overlays that sit OVER live gameplay (`Countdown`/`LoadingBarks`/`Socials`)
  share `theme.glassPanel` (dot grid + `glassSheen` + `glassDense` 0.84) +
  `glassPanelShadow` + `WindowDots` (corner-pinned, no domain tag — just widgets),
  so they read as the same little macOS window
  as the card chip — `glassFill` 0.66 washes out over bright footage and drops
  secondary text below 3:1.
  Fonts (`fonts.ts`) match mrdemonwolf.com: **Montserrat** (`display`,
  headings — the site's header font) + **Open Sans** (`body`, status lines /
  labels / digits — the site's body font; tabular-nums + fixed-width boxes keep
  numbers from reflowing), loading only the weights/subset used.
  `render-all.mjs` renders the 8 full-frame ids to MP4, then `Socials` to
  `.mov` + `.gif` and a bonus `Background.gif`, into `out/` (which is
  gitignored). `Socials` is omitted from the 8-id MP4 array; `Countdown`
  (5 min) + `LoadingBarks` (~9 min) are transparent full-frame ProRes 4444
  (multi-GB, slow) → omitted from `render:all` entirely, rendered manually.
- **`release.sh`** (repo root, `make release`) runs the whole pipeline end to
  end: `render:all` → render Countdown + LoadingBarks ProRes (reused if the
  master already exists, `--force` to re-render) → `to-hevc.sh` the three
  transparent masters → regen `masks/` → assemble a dated OBS bundle
  (`videos/opaque` MP4s + `videos/transparent` HEVC-alpha `.mov` + `masks/` +
  a generated `README.md`) and zip it to `~/Downloads/OBS-overlays-<date>.zip`
  for copying to Google Drive. The bundle README carries the file→scene→loop
  table + the webcam-placement coords (keep those in sync with `gen_masks.py`).
