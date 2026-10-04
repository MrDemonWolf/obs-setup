# Stinger transition setup

The Stinger is an OBS **scene transition**, not a Media Source. It plays over
scene changes and swaps scenes while the frame is covered.

## Download

Download `OBS-stinger-<date>.zip` from the
[GitHub Releases page](https://github.com/MrDemonWolf/obs-setup/releases).
The separate archive contains:

- `stinger-hevc.mov` — the HEVC-with-alpha transition video with the whoosh
  already embedded.
- `stinger.wav` — the original audio source used to render the embedded whoosh.
- `README.md` — a copy of these install steps.

The overlay and webcam-mask files are in the separate `OBS-overlays-<date>.zip`.
To render both archives locally on macOS, run `make release`; the files appear
in `~/Downloads/` (or in the folder set by `OBS_RELEASE_OUTPUT_DIR`).

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
byte-for-byte in the ProRes render and that its measured peak reaches the
2000 ms scene-cut point within one video frame.
