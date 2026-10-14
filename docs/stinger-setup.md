# Stinger transition setup

The Stinger is an OBS **scene transition**, not a Media Source. A cratered,
steel-blue full moon lifts out of its usual top-right spot, travels to center,
and pulls a dark night sky across the screen as a soft-edged iris around it.
The sky holds, the moon's halo swells with the whoosh, then the iris contracts
back into the moon as it returns to the corner. Soft crater shading and a
restrained steel rim keep the moon readable without a bright screen wash; the
stars are still and subtle. The night sky is fully opaque on every pixel from
1650 to 2600 ms, with the OBS scene cut at 2000 ms inside that hold. The first
and last frames are fully transparent.
The former paw-swipe remains as `LegacyPawSwipeStingerBackup` in Remotion for
rollback, but it is not included in the previewer or release package.

## Download

Download `OBS-stinger-<version>.zip` from the
[GitHub Releases page](https://github.com/MrDemonWolf/obs-setup/releases).
The separate archive contains:

- `stinger-hevc.mov` — the HEVC-with-alpha transition video with the whoosh
  already embedded.
- `stinger.wav` — the original audio source used to render the embedded whoosh.
- `README.md` — a copy of these install steps.

The overlay and webcam-mask files are in the separate `OBS-overlays-<version>.zip`.
To render both archives locally on macOS, run `make release`; the files appear
in `~/Downloads/` (or in the folder set by `OBS_RELEASE_OUTPUT_DIR`). Set
`OBS_RELEASE_VERSION=v0.1.3` for versioned local archives; otherwise local
builds use the packaging date in their filenames.

## Install in OBS

Repeat these steps for each OBS scene collection. Transitions are stored per
collection.

1. Copy `stinger-hevc.mov` somewhere permanent on the Mac.
2. Open the **Scene Transitions** dock. If it is hidden, use **View → Docks →
   Scene Transitions**.
3. Select **+ → Stinger** and name it `Stinger`.
4. Set **Video File** to `stinger-hevc.mov`.
5. Set **Transition Point Type** to **Time** and **Transition Point** to
   **2000 ms**. This places the scene cut in the covered part of the clip.
6. Set **Audio Fade Style** to **Crossfade**, save, and select `Stinger` in the
   Scene Transitions dropdown.
7. Cut between scenes to check the wipe and embedded whoosh.

Do not add `stinger.wav` as a separate OBS audio source: that would play the
whoosh twice. The WAV is included for the source record and future renders.

## Troubleshooting

- **Black background instead of transparency:** use `stinger-hevc.mov` from the
  Stinger ZIP, not a ProRes master or an MP4.
- **Scene visibly switches before the screen is covered:** set the transition
  type to **Time** and the point to **2000 ms**.
- **No sound:** confirm the transition's audio is enabled and its fade style is
  **Crossfade**. The sound is part of the MOV.
- **Stutter on a base-model Mac:** confirm OBS is using the HEVC `.mov`, not the
  ProRes render master.

The current render is 4 seconds at 60 fps. CI checks that the source WAV remains
byte-for-byte in the ProRes render, that its measured peak reaches the 2000 ms
scene-cut point within one video frame, that the first and last frames are fully
transparent, and that every pixel is opaque across the 1650–2600 ms hold.
