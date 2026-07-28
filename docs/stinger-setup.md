# Stinger transition setup (from zero)

Right now both rigs cut scenes with the plain **Fade 300 ms** — the branded
Stinger (navy paw-print wipe with the whoosh) is rendered and ready but not
configured anywhere. This sets it up. ~5 minutes per Mac, do it while **NOT
live** (changing transitions mid-stream shows on stream).

A stinger is a **transition**, not a Media Source — it plays once over every
scene cut, and OBS swaps the scene behind it while the screen is covered.

## Components you need

| # | Thing | Where it comes from |
| - | ----- | ------------------- |
| 1 | OBS Studio 30+ on macOS (both rigs run 32 — fine) | already installed |
| 2 | `stinger-hevc.mov` — the wipe video, HEVC-with-alpha, whoosh SFX **baked in** | release bundle `Stinger/` folder |
| 3 | `stinger.wav` — the bare whoosh (reference copy; NOT needed in OBS, the .mov already carries it) | release bundle `Stinger/` folder |

Getting the bundle (any one of these):

- **Google Drive** (easiest): the `Stinger/` folder inside
  `.../My Drive/MultiMedia Projects/Social Media/Twitch/` next to `Overlays/`
  — if it's there, you're done collecting.
- **Build it**: `make release` in this repo (macOS only) →
  `~/Downloads/OBS-overlays-<date>.zip` → unzip → `Stinger/`.
- **CI**: any published GitHub Release of this repo has the zip attached as an
  asset.

Use the HEVC `.mov`, not a ProRes master — HEVC-alpha hardware-decodes on
every Apple Silicon chip; WebM-alpha isn't shippable here (our ffmpeg builds
drop VP8/VP9 alpha).

## Setup steps (repeat on EACH Mac — transitions live per scene collection)

1. Copy `stinger-hevc.mov` somewhere permanent on that Mac (the Drive
   `Stinger/` folder is fine — OBS just needs a stable path).
2. In OBS, find the **Scene Transitions** dock (bottom middle; View → Docks →
   Scene Transitions if hidden).
3. Click **+** → **Stinger**. Name it `Stinger`.
4. **Video File** → browse to `stinger-hevc.mov`.
5. **Transition Point Type** = **Time**.
6. **Transition Point** = **2000 ms**. The screen is fully covered
   ~1360–2890 ms, so at 2000 ms OBS swaps scenes while nothing shows. The
   value is `STINGER_POINT_MS` in `remotion/src/Stinger.tsx` — if the clip is
   ever re-timed, re-check it.
7. **Audio Fade Style** = **Crossfade** (the whoosh is in the file; nothing
   else to wire).
8. Click OK, then pick **Stinger** in the Scene Transitions dropdown so it's
   the current transition.
9. Test: click between two scenes. You should see the paw-print panel sweep
   in, hold, and sweep out with the whoosh — and the scene changed behind it.

Because transitions are stored **per scene collection**, redo steps 2–8 after
importing a new generated collection (`MBP-Streaming` / `Mini-Streaming`) —
the import ships only Cut + Fade.

## Troubleshooting

- **Black box instead of transparency** → you grabbed a file without alpha;
  use `stinger-hevc.mov` from the bundle's `Stinger/` folder (not an MP4).
- **Scene visibly swaps too early/late** → Transition Point drifted from
  2000 ms, or Transition Point Type is on Frame; set Time + 2000.
- **No sound** → the .mov carries the audio; check the transition's audio
  isn't muted in Advanced Audio Properties and Audio Fade Style is Crossfade.
- **Stutter on the base-model Mini** → confirm it's the HEVC file, not a
  ProRes master (ProRes only hardware-decodes on Pro/Max/Ultra chips).
