# OBS Setup - Notes, Backups, and a Color-Coded Previewer

This is the home for my OBS Studio setup: reference notes, per-device
backups, an import-ready color-coded scene collection, and a small HTML
previewer. It exists so I never lose a scene layout again and can rebuild
either Mac from a clean install in minutes.

Two devices live here: my **MacBook Pro** (portable rig) and my
**Mac Mini** (main home setup).

One command to back up. One click to preview. No lost scenes.

## Features

- **Per-device backups** - one command scrubs secrets and files your OBS
  export into the repo under the right device automatically.
- **Secret-safe by default** - browser widget URLs and Twitch stream keys
  are wiped before anything reaches git. The full un-wiped copy is zipped to
  your Downloads folder for Google Drive.
- **Import-ready scenes** - a generated OBS scene collection for the MacBook
  Pro with every source color-coded, ready to import.
- **Consistent color coding** - one palette across scenes and sources, so a
  glance tells you camera vs. alerts vs. screen vs. standby.
- **HTML previewer** - a color-coded map of every scene that runs locally or
  on GitHub Pages, no build step.
- **OBS JSON reference** - what the files contain, how source colors are
  stored, and exactly which fields are secrets.
- **Animated overlays** - Remotion-built scenes with seamless looping motion
  (Starting Soon, Be Right Back, Just Chatting, Streaming, Co-Working, Ending
  Stream, Background), rendered to MP4 for OBS media sources.
- **Live previewer** - a small macOS-style window that plays every overlay
  live, with a button per scene, so you can flip through them before
  rendering.
- **Layout scenes** - **Co-Working** (Solo / Dual) has rounded 16:9 cam frames
  with an open widget band below; **Streaming** and **Background** are just the
  animated background (stack your sources on top). **Just Chatting** is a webcam
  frame + a tall chat frame to embed a real chat over. Rounded [webcam
  masks](masks/) clip a live cam to match the frames.
- **Socials badge** - a standalone transparent overlay that fades through your
  platforms one at a time with real brand logos.

## Getting Started

Full docs live in [`docs/`](docs/):

- [Backup guide](docs/backup-guide.md) - export, back up, and restore.
- [Color coding](docs/color-coding.md) - the palette and what each color means.
- [OBS JSON reference](docs/obs-json-reference.md) - file format and the color field.

Quick start:

1. Clone the repo and `cd` into it.
2. Run `make preview` and open <http://localhost:8000> to see the current
   MacBook Pro layout.
3. In OBS, import the layout: `Scene Collection -> Import ->`
   `devices/macbook-pro/scenes/MBP-Streaming.json`.
4. After import, select your camera device and display, and paste your alert
   and widget URLs (they ship empty on purpose).

## Usage

Everything runs through `make`:

| Command        | What it does                                                        |
| -------------- | ------------------------------------------------------------------- |
| `make backup`  | Zips your `~/Downloads/OBS` export, then files a scrubbed copy into the repo for the current device. |
| `make preview` | Serves the color-coded previewer at <http://localhost:8000>.        |
| `make gen`     | Regenerates the MacBook Pro scene collection JSON.                  |
| `make`         | Lists the available commands.                                       |

Typical backup flow:

1. In OBS: `Scene Collection -> Export` and `Profile -> Export` into
   `~/Downloads/OBS`.
2. Run `make backup`. It detects the Mac by its name, writes
   `~/Downloads/OBS-backups/<Device>-<date>.zip` (upload that to Google
   Drive), and copies a secret-free version into `devices/<device>/`.
3. Review `git status` and commit.

Force the device when auto-detect is wrong:

```bash
DEVICE=mac-mini make backup
```

### Animated overlays

The animated stream scenes live in [`remotion/`](remotion/) as a separate
Node project. See [`remotion/ASSETS.md`](remotion/ASSETS.md) for the asset
drop-in and render details.

```bash
cd remotion
npm install
npm run obs                                   # previewer — a button per scene
npm run dev                                   # Remotion Studio
npm run render:all                            # render everything into out/ (numbered files)
npx remotion render StartingSoon out/01-starting-soon.mp4   # or one at a time
```

Composition ids: `StartingSoon`, `BRB`, `JustChatting`, `Streaming`,
`Coworking`, `EndingStream`, `Background` (full-frame MP4s), plus `Socials` —
a 760×180 transparent badge rendered to `socials.mov` (ProRes 4444) +
`socials.gif`. Add each in OBS as a Media Source with Loop enabled; put the
backgrounds at the bottom of the scene and stack your screen / webcam / widgets
on top.

### Rounded webcam masks

The Just Chatting and Co-Working overlays draw rounded cam frames. To make a live
cam match that rounding, [`masks/`](masks/) has a ready-made alpha mask
per cam (`just-chatting-cam`, `just-chatting-chat`, `co-working-solo`,
`co-working-dual-big`, `co-working-dual-small`). Apply one to the cam source with
an **Image Mask/Blend** filter (Alpha Mask · Alpha Channel) — see
[`masks/README.md`](masks/README.md) for the size/position of each and
the step-by-step. Regenerate with `python3 masks/gen_masks.py` if you retune
a frame.

## Tech Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Scripts      | Python 3 (standard library) + Bash  |
| Task runner  | GNU Make                            |
| Previewer    | Plain HTML, CSS, and JavaScript     |
| Overlays     | Remotion 4 (React 19), Vite previewer with @remotion/player |
| Hosting      | GitHub Pages (serves the repo root) |
| Target       | OBS Studio 30+ on macOS             |

## Development

### Prerequisites

- macOS with the built-in `python3`, `bash`, `zip`, and `make`.
- OBS Studio 30 or newer.

### Setup

Clone the repo:

```bash
git clone git@github.com:MrDemonWolf/obs-setup.git
cd obs-setup
```

No install step. The scripts use only the standard library.

### Development Scripts

- `scripts/gen_scene_collection.py` - builds the MacBook Pro scene collection
  from the layout defined at the top of the file. Run with `make gen`.
- `scripts/sanitize.py` - copies an OBS export into `devices/<slug>/`, wiping
  browser URLs and stream keys. Called by the backup script.
- `scripts/backup.sh` - detects the device, zips the raw export, runs the
  sanitizer. Run with `make backup`.

### Code Quality

- Standard-library Python only, no dependencies to install or update.
- `gen_scene_collection.py` runs a self-check (ABGR color math + every scene
  item references a real source) before it writes anything.

## Project Structure

```text
obs-setup/
├── index.html                # color-coded previewer (also the GitHub Pages site)
├── Makefile                  # backup / preview / gen
├── devices/
│   ├── macbook-pro/          # portable rig
│   │   ├── index.json        # which scene files exist (read by the previewer)
│   │   ├── scenes/           # scene collection JSON (secret-free)
│   │   └── profiles/         # profile settings (stream key wiped)
│   └── mac-mini/             # main home setup (populated on first backup)
├── scripts/
│   ├── gen_scene_collection.py
│   ├── sanitize.py
│   └── backup.sh
├── docs/
│   ├── backup-guide.md
│   ├── color-coding.md
│   └── obs-json-reference.md
├── masks/                   # rounded webcam masks for the cam-frame overlays
│   ├── *.png                 # one alpha mask per cam (named per overlay)
│   ├── gen_masks.py          # regenerate from the frame geometry
│   └── README.md             # OBS Image Mask/Blend steps
└── remotion/                 # animated overlays (separate Node project)
    ├── src/                  # scenes + layers
    │   ├── scenes.ts         # every scene (single source of truth)
    │   ├── Root.tsx          # registers each scene as a composition
    │   ├── Scene.tsx         # card layout; JustChattingScene / StreamFrame / CoworkFrame / BackdropScene / Socials
    │   ├── wolf/             # night ambience (Moon, Starfield, Embers, PawTrail)
    │   └── theme.ts          # palette + seamless-loop helpers
    ├── preview/              # macOS-style previewer (Vite + @remotion/player)
    ├── public/               # mascot SVGs (logo-*.svg) + brands/ (social logos)
    ├── render-all.mjs        # render every scene into out/
    └── ASSETS.md             # asset drop-in + render/OBS instructions
```

## License

![GitHub license](https://img.shields.io/github/license/mrdemonwolf/obs-setup.svg?style=for-the-badge&logo=github)

## Contact

Questions or ideas:

- Discord: [Join my server](https://mrdwolf.net/discord)

---

Made with love by [MrDemonWolf, Inc.](https://www.mrdemonwolf.com)
