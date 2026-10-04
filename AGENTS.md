# AGENTS.md

Guidance for agents working in this repository.

## What this repo is

Personal OBS Studio config store for two Macs — **MacBook Pro** (`macbook-pro`,
portable) and **Mac Mini** (`mac-mini`, main home rig). It holds reference
docs, per-device backups, an import-ready color-coded scene collection, and a
static HTML previewer. No app to run; it's tooling around OBS's own JSON.

The backup, scene generator, and HTML preview use Python 3's standard library,
Bash, and Make. The separate `remotion/` project uses Node/npm and Remotion to
render the animated overlays and stinger; CI runs the associated checks.

## Commands

```bash
make gen      # regenerate BOTH device scene collections (+ index.json each):
              #   devices/macbook-pro/scenes/MBP-Streaming.json
              #   devices/mac-mini/scenes/Mini-Streaming.json
make backup   # zip live macOS OBS settings, then file a scrubbed copy into devices/<slug>/
make preview  # serve the previewer at http://localhost:8000 (python3 -m http.server)
make release  # render assets + package separate overlay and stinger ZIPs in ~/Downloads
make          # list targets
```

- **Tests:** run `python3 -m unittest discover -s tests -v` for sanitizer,
  stinger timing, and archive-content checks. `scripts/validate_stinger.py`
  checks the WAV peak and, when given rendered files, the exact embedded PCM
  and encoded stream metadata. `scripts/gen_scene_collection.py` also runs an
  inline `selfcheck()` (ABGR color math + every scene item references a real
  source) on each run — `make gen` fails loudly if it breaks.
- **Force a device** when `make backup` mis-detects:
  `DEVICE=mac-mini make backup`. Override the OBS data folder with
  `OBS_EXPORT_DIR=... make backup`. Run `obs-backup setup` once to write
  `~/.config/obs-backup/config`. Homebrew installs the standalone command.

## Architecture

Three pieces, joined by a few conventions that must stay in sync.

### 1. Scene generation (`scripts/gen_scene_collection.py`)
Data-driven: one layout dict per device (`MACBOOK_PRO`, `MAC_MINI` — listed in
`DEVICES`), each holding `leaves` / `src_scenes` / `main_scenes` / `dividers` /
`scene_order`, plus the shared `PALETTE`. Editing those + `make gen` rewrites
both importable collections. UUIDs are deterministic (`uuid5`, per-device
namespace) so regenerating produces no spurious diffs. Scene items accept
`(name, cat)` tuples or dicts with `pos`/`bounds` (Scale-to-inner, pins cams
into the overlay frames) and `visible`.

Two non-obvious parts. **Color**: OBS stores a source's list color on the
*scene item* at `private_settings.color`, as a **signed 32-bit ABGR integer**
(`0xAABBGGRR`, red is the low byte). `abgr()` encodes it; the previewer's
`abgrToCss()` decodes it. See `docs/obs-json-reference.md`. **Layer order**:
OBS renders the scene-item JSON array first→last, so the FIRST element is the
BOTTOM layer; layouts are authored top→bottom (like the OBS Sources panel) and
`scene_source()` reverses on write. The Mac Mini layout's headline feature is
PER-SCENE `[src] Wolfathon · <scene>` wrappers — a wrapper/group's internal
layout is global, so per-scene arrangements need per-scene wrappers (same
three widget sources inside each).

### 2. Backup pipeline (`scripts/backup.sh` → `scripts/sanitize.py`)
`backup.sh` detects the device from `scutil --get ComputerName` (substring
`MacBook`/`Mini`), snapshots OBS's live macOS `basic` directory, then zips
the **full raw** snapshot to
`~/Library/CloudStorage/GoogleDrive-nathanial.henniges@mrdemonwolf.com/My Drive/Backups/OBS/<LocalHostName>/<Label>-<timestamp>.zip` (keeps
secrets, never git), then calls `sanitize.py` to mirror the snapshot into
`devices/<slug>/` and write that device's `index.json` (built from everything
in `scenes/`, so generated + backed-up collections coexist — keep in sync with
`write_index()` in the generator).

The git copy includes scene collections and profile `basic.ini`/`service.json`.
Other export files remain in the raw ZIP and are reported as skipped.

**Secret boundary — the critical invariant:** URL, key, token, password, and
cookie fields are wiped before anything reaches git. This includes browser
source URLs, `service.json` stream keys, and profile `basic.ini` OAuth tokens.
Only the Google Drive backup `.zip` keeps them. Do not weaken this in `sanitize.py`.

### 3. Previewer (`index.html`, repo root)
Self-contained (inline CSS+JS, no build; the only external ref is a Google
Fonts link that degrades to system fonts offline). Device tabs (Mac Mini
default / MacBook Pro, plus Dropped for drag-dropped files; persisted in
localStorage), click-to-copy on every
scene/source name + media path chip (toast feedback), and OBS-Sources-panel
styling: color-tinted rows, and `[src]` wrapper references render as
expandable folders (native `<details>`) showing their contents inline, like
OBS groups. NO layout/position preview — deliberately sources-and-folders
only, per user. Also the GitHub Pages site — Pages
serves the repo root, so the previewer `fetch()`es `devices/<slug>/index.json`
and the scene files by relative path. A drag-drop fallback handles `file://`
(where fetch is blocked). Renders scenes in `scene_order`, coloring each item
from its `private_settings.color`; empty dash-named scenes render as dividers.

## Keep these in sync when editing

- **Palette:** `PALETTE` (generator) ↔ `LEGEND` (`index.html`) ↔
  `docs/color-coding.md`. Three copies of OBS's 8 preset colors, one per
  category, by design (no build to share them). Full scene / group / source
  table with the color per item lives in `docs/adhd-setup-guide.md`. Overlay
  and standby videos come from `OVERLAY_VIDEOS` (a Google Drive path set in
  the generator; this-Mac only) — one rendered bundle serves BOTH devices.
- **Devices:** adding a Mac means a new `case` in `scripts/backup.sh`, a new
  slug in `DEVICES` in `index.html`, and a `devices/<slug>/` folder.
- **OBS source ids** in the generator (`macos-avcapture`, `browser_source`,
  `sck_audio_capture`, `ffmpeg_source`, `ndi_source`, `syphon-input`) are
  macOS/OBS-version specific; OBS flags a source to reconfigure rather than
  failing import if one is off. Per-app audio (Discord/Chrome/Apple Music) uses newest OBS (30+)
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
npm run lint        # eslint + tsc for src and preview
npm run render:all  # render every scene into out/ (see render-all.mjs)
# one at a time (comp ids):
npx remotion render <CompId> out/<name>.mp4
#   StartingSoon | BRB | JustChatting | JustChattingVtuber
#   CoworkingSolo | CoworkingDual | EndingStream | Background | Socials
#   Countdown | Countdown10 | LoadingBarks | Stinger
```

Architecture:

- **`src/scenes.ts` is the single source of truth** for the **13** scenes, each
  with `id`, `label`, `component`, `props`, and optional `width`/`height`.
  `src/Root.tsx` registers a `<Composition>` per scene (applying per-scene
  `width ?? VIDEO.width` / `height ?? VIDEO.height` — transparent widgets use
  compact panel bounds (`Socials` 720×140, countdowns 820×500, LoadingBarks
  1080×420); the stream screens and Stinger remain 1920×1080.
  `preview/ObsPreview.tsx`
  (button-per-scene switcher) imports the same list. Add a scene there once.
- **`PawLoader`** (`PawLoader.tsx`) = reusable row of paws pulsing in a
  traveling wave (seamless via integer `harmonic`). Used inside `Countdown`
  (with `harmonic={1}` — at 60fps that matches the 30fps scenes' sweep rate).
  Reuses `Paw` (wolf print: ONE smooth rounded pad + splayed toes — the old
  3-lobe pad read as "bites" at large sizes — shared with `PawTrail`, the
  LoadingBarks fill-edge rider, the TitleChip corner mark, and the Stinger).
- **`Countdown` / `Countdown10`** (`Countdown.tsx`) = transparent standalone timer chips
  (`HOWLING IN` + `M:SS` + `PawLoader`). Counts `from`s → 0 over the comp
  duration then holds at 00:00. **The one intentional non-loop** — render it out
  and set the OBS media source to play ONCE (loop OFF), start on going live.
  Panel-sized 820×500 compositions with room for the glass shadow; position the
  media source wherever the timer should appear.
  Registered at 5:00 (`from:300`, **18060f**) and 10:00 (`from:600`,
  **36060f**) at 60fps. Each duration includes the extra held 00:00 second; at
  `from`×fps the last frame still reads 00:01. Per-comp
  `fps:60` in `scenes.ts`, motion reads `useVideoConfig().fps`; the glow runs a
  local 8s wave, NOT `loopSin`, whose 240f period would double the rate at 60fps);
  **kept out of `render:all`** (too heavy). Render
  manually as `Countdown` → `out/countdown.mov` or `Countdown10` →
  `out/countdown-10m.mov` with ProRes 4444.
- **`LoadingBarks`** (`LoadingBarks.tsx`) = a transparent 1080×420 glass status
  panel (900px card) with ten short wolf-tech jokes. Each phrase has a headline and a
  punchline. A **seeded module-load schedule** (LCG, loop-safe — no per-frame
  random) gives each phrase a random 20–40s hold; within EACH phrase the bar
  fills 0→100% (per-phrase `CURVES`, random uneven spurts) and maxes at 100 right
  before the next phrase starts fresh. Three paw marks show progress milestones
  and a bright `Paw` rides the fill edge; fixed-width `%` never reflows. The
  0.45s crossfade wraps the headline, punchline, bar, and percentage so the
  one-frame bar reset stays invisible. The glow runs an integer number of
  cycles over the comp (`GLOW_CYCLES`) so the loop seam stays smooth.
  `durationInFrames = LOADING_BARKS_DURATION` (sum of holds, about 4.7 min over
  10 phrases) built at `LOADING_BARKS_FPS` (**60**; per-comp `fps` in
  `scenes.ts`). **Heavy → NOT in `render:all`**, render manually. Edit
  `BARKS`/seed to taste.
- **`Stinger`** (`Stinger.tsx`) = the OBS **stinger transition** (a transition,
  NOT a Media Source): 4s @60fps full-frame alpha wipe. Navy panel (leading edge
  welded FLUSH, ordered navy → cerulean → thin WHITE outermost tip — matches the
  original stinger) sweeps in L→R → holds fully covered ~1.5s (OBS swaps scenes
  behind it; Transition Point 2000ms = `STINGER_POINT_MS`, mid-hold) → exits
  right with a back-loaded snap. Paw prints are
  **painted ON the panel** (children of the moving layer, counter-skewed
  `skewX(9)`) so they ride the sweep — stamp in on a slow L→R march
  (`STAMP_FIRST/LAST`), hold through the full cover, then fade out L→R deep into
  the exit (`UNSTAMP_FIRST/LAST`) so the swoosh carries the last prints off. The
  real whoosh SFX is baked in via `<Audio>` (`public/stinger.wav`,
  from `reference/Stringer.wav` — gitignored local drop folder), delayed so its
  impact lands on the cover. Plays ONCE (like Countdown, plain `interpolate`,
  no loop helpers). Panel sized in **composition px** (`useVideoConfig().width`),
  NEVER `vw` — in the Player preview `vw` = browser viewport ≠ canvas and the
  cover visibly fails. NOT in `render:all`; `release.sh` renders it (ProRes
  4444 → HEVC-alpha) into the bundle's own `Stinger/` folder. WebM-alpha would
  be the portable stinger format but Homebrew/CI ffmpeg lacks libvpx-alpha
  (VP8/VP9 silently drop alpha) → ship HEVC-alpha `.mov` (fine on macOS OBS).
- **Card scenes** (`StartingSoon`, `BRB`, `EndingStream`) use `src/Scene.tsx`,
  which layers the shared forest `Background` (including the left-to-right
  white paw trail) with an optional `ChatBoxFrame` and `TitleChip`. The title
  cards are logo-free; the small `mrdemonwolf.com` label in the glass title bar
  carries the creator identity without adding another focal point. All card
  scenes use the Night Forest Walk system documented in
  `docs/overlay-design-system.md`. Starting Soon / BRB copy lives in `scenes.ts`
  so the composition stays reusable.
- **Card chip: FIXED `CHIP_WIDTH` 1160px, left-aligned, glass-not-flat.** The
  glass uses a static vertical gradient + diagonal sheen + 1.5px top bevel
  (fakes macOS glass without `backdrop-filter`). Traffic lights use TRUE macOS
  hexes (`#FF5F57/#FEBC2E/#28C840`) via the shared `WindowChrome`
  (`MAC_DOT` + `WindowDots`). The card renders `WindowChrome.WindowTitleBar`
  with a `mrdemonwolf.com` tag and no logo badge. Display text stays
  left-aligned and shrinks for longer headlines. Only the glass edge pulses;
  the title and status remain still. The transparent overlays
  (Countdown/LoadingBarks/Socials) use
  `WindowDots` only, pinned to the top-left corner (`top:26,left:30`; Socials
  `top:16,left:18` for its 10px dots), with no domain tag. Chip is pinned at
  `left: 64`; its cerulean edge glow pulses gently while its content stays
  still.
- **`JustChatting`** = `JustChattingScene.tsx`: `forest` `Background` (moon parked
  LEFT, `{x:300}` — only x is passed; the shared `MOON_Y` 108 keeps it in the
  198px top band, clear of the cam frame) + a 16:9 `CamFrame` + a tall chat
  `CamFrame` (staggered glow
  phases 0.4/0.73). No mascot, no widgets — you embed your real cam + chat over
  the frames. **`JustChattingVtuber`** = the same scene with `hideCam` — the
  cam frame drops (VTuber model goes full-screen) but the chat frame stays.
  (A plain-gameplay "Streaming" scene was removed — use `Background` instead;
  it's the same animated bg to stack game capture / cam / widgets over.)
- **Co-Working** = one data-driven `Cowork` comp (`CoworkFrame.tsx`):
  `Background variant="forest"` + baked **16:9** `CamFrame`(s) from
  `COWORK_LAYOUTS` (no bar, no widget boxes — the open space is for timer /
  tasks / chat / now-playing OBS sources). Both layouts share ONE top-left pin
  (`x64,y136` — nudged down from the old y40 to open a wider bottom widget
  band), but the main cam JUMPS size switching solo↔dual (accepted trade-off
  for bigger cams both ways): `solo` = one **1400×788** hero; `dual` = a
  **1152×648** hero + a smaller **576×324** second (true 16:9) pinned to the
  **right** (`x=1280, y=628`) — diagonally opposite the hero, opening an
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
- **`Background`** = `BackdropScene.tsx` → the shared forest photograph, sky
  stars, moon, and soft rightward paw trail; no handle or widget boxes. The most
  flexible overlay.
- **`Socials`** = `Socials.tsx` `SocialsScene` (720×140, transparent) that fades
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
  forest/night/glow/minimal — `forest` = photo + sky stars + moon + paw trail;
  `glow` = aurora + moon, no starfield/embers;
  optional `moon={x}` repositions the moon into clear sky on frame scenes. Size
  (`MOON_R`) AND height (`MOON_Y`) are shared — the moon sits at ONE altitude on
  every scene and only its LEFT/RIGHT x changes (300 left / 1568 right); don't
  re-add per-scene `r` or `y`. Only the moon's HALO breathes — the body stays still (a body throb
  read wrong on a celestial object). Starfield stars carry seeded integer
  harmonics 2–4 so they twinkle at varied rates instead of one shared breath.
  `PawTrail` runs inside the shared `Background` on the full forest scenes, so
  its timing and soft-white color stay consistent across cards, live layouts,
  and the flexible Background composition.
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
  scenes (`Socials`, both `Countdown` options, and `LoadingBarks`) render to **ProRes 4444 `.mov`
  as the alpha master**, but ProRes only hardware-decodes on M1/M2 **Pro/Max/Ultra**
  — a base M1/M2 Mac Mini software-decodes it and can stutter in OBS. **For the
  actual OBS media source, transcode the master to HEVC-with-alpha (`hvc1`) via
  `./to-hevc.sh out/<name>.mov`** — HEVC hardware-decodes on EVERY Apple Silicon
  chip and is a fraction of the size. (`Socials` also ships a GIF.) Glass elements
  use plain translucent fills, not `backdrop-filter` (expensive to render);
  overlays that sit OVER live gameplay (countdowns/`LoadingBarks`/`Socials`)
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
  gitignored). `Socials` is omitted from the 8-id MP4 array; both `Countdown`
  options (5 and 10 min) + `LoadingBarks` (~4.7 min) are compact transparent
  panel ProRes 4444 outputs (multi-GB, slow) → omitted from `render:all`,
  rendered manually.
- **`release.sh`** (repo root, `make release`) runs the pipeline end to end:
  `render:all` → render both Countdown options + LoadingBarks ProRes (reused if
  a master already exists, `--force` to re-render) → render the Stinger ProRes → encode
  the five transparent masters as HEVC-alpha → validate the WAV timing and
  rendered streams → regenerate `masks/` → make separate dated downloads:
  `OBS-overlays-<date>.zip` (12 scene videos + masks + setup README) and
  `OBS-stinger-<date>.zip` (HEVC-alpha transition + source WAV + setup README).
  The stinger whoosh is embedded in the MOV; its sample-accurate WAV offset is
  checked in the ProRes render. `OBS_RELEASE_OUTPUT_DIR` changes the download
  directory from `~/Downloads`.
- **CI** (`.github/workflows/ci.yml`) runs Python, Remotion lint/type checks,
  and a Remotion-rendered stinger audio-timing check. **Release CI**
  (`.github/workflows/release.yml`) renders both packages on macOS, attaches
  both ZIPs to each published GitHub Release, and uploads them as separate
  artifacts on `workflow_dispatch`. macOS is mandatory because HEVC-alpha uses
  `hevc_videotoolbox`, which is Apple-only.
