# OBS setup: scenes, sources, colors

One rule: color = category. In OBS, right-click a source or a group, pick
Color, click the swatch. Only the 8 built-in OBS colors are used.

Two devices, two collections: the MacBook Pro tables are first, the
[Mac Mini section](#mac-mini-mini-streaming-collection) is at the bottom.

## Colors to category

| OBS color    | Category                          |
| ------------ | --------------------------------- |
| Green        | Cam feeds (webcam, NDI, PNG Tuber)|
| Purple       | Alerts (Chat Overlay + Sound Alerts + Twitch Alerts) |
| Teal         | Wolfathon widgets (wheel/rewards/timer) |
| Blue         | Now Playing (WolfWave)            |
| Yellow       | Screen / display (when you add it)|
| Red          | Standby videos (Starting Soon / Be Right Back / Ending) |
| Gray (light) | Audio (Discord / Chrome / Apple Music) |
| Gray (dark)  | Background image / overlay-frame videos |

## Groups (build once, color the group)

Select the sources, right-click, Group Selected Items, name it, then right-click
the group and pick Color.

| Group    | Color        | Sources inside                     |
| -------- | ------------ | ---------------------------------- |
| Alerts   | Purple       | Sound Alerts, Twitch Alerts        |
| Wolfathon| Teal         | Wheel of Dares, Rewards, Timer     |
| Audio    | Gray (light) | Discord, Google Chrome, Apple Music|

For each Audio source: Add Source, pick **macOS Audio Capture**, set Method to
**Application**, choose the app. That is the newest-OBS way (OBS 30+, macOS 13+,
ScreenCaptureKit) and needs no BlackHole or Loopback.
Docs: https://obsproject.com/kb/macos-desktop-audio-capture-guide

For per-source volume levels (Compressor settings per source, target dBFS
lanes), see [audio-levels.md](audio-levels.md).

## Standalone sources

| Source              | OBS source type      | Color       |
| ------------------- | -------------------- | ----------- |
| Webcam              | Video Capture Device | Green       |
| Now Playing         | Browser              | Blue        |
| Starting Soon Video | Media Source         | Red         |
| Be Right Back Video | Media Source         | Red         |
| Background          | Image                | Gray (dark) |

## Scenes to sources

Top of the list = front. Bottom = behind. Background always last.

| Scene         | Sources (top to bottom)                                          |
| ------------- | ---------------------------------------------------------------- |
| Starting Soon | Starting Soon Video, Alerts, Audio, Background                    |
| Be Right Back | Be Right Back Video, Alerts, Audio, Background                    |
| Live          | Webcam, Now Playing, Wolfathon, Alerts, Audio, Background         |
| Co-Working    | Webcam, Now Playing, Wolfathon, Alerts, Audio, Background         |

## Background and standby images

Both the Background image and the Starting Soon / BRB video live in this folder:

```
/Users/nathanialhenniges/Library/CloudStorage/GoogleDrive-nathanial.henniges@mrdemonwolf.com/My Drive/MultiMedia Projects/Social Media/Twitch/Scenes Images
```

Point the Image / Media source at the file you want from that folder. This path
is this Mac only (Google Drive mount); the Mac Mini has its own path.

## Notes

- Browser widget URLs ship empty (they hold secret tokens). Paste yours after
  adding. `make backup` scrubs them before git; the full copy stays in the
  `~/Downloads` zip only.
- Sync the repo to your real OBS: export from OBS, then `make backup`. That
  captures the live setup (scrubbed), so the previewer and `devices/` match what
  you actually run. The generator (`make gen`) is just the starting seed.
- Yellow (Screen) is reserved for when you add a Display Capture source.

## Mac Mini (Mini Streaming collection)

Import `devices/mac-mini/scenes/Mini-Streaming.json`. It is the cleaned-up
version of the live rig: typo names fixed (`Co-workking Main Cam` ->
`Main Cam`, `Co-Workng Video` -> `Co-Working Solo Video`), every item
color-coded, and the old empty global `Wolfathon` group replaced with
per-scene wrappers.

### Per-scene Wolfathon wrappers (the point of this layout)

A group's or wrapper's internal layout is SHARED by every scene that uses it —
that is why the widgets kept fighting across scenes (and why a duplicate
`Rewards - Right` source existed just to get a second position). Now each
scene has its own wrapper holding the SAME three widget sources:

| Wrapper                            | Used by            |
| ---------------------------------- | ------------------ |
| `[src] Wolfathon · Live`           | Live               |
| `[src] Wolfathon · Co-Working Solo`| Co-Working [Solo]  |
| `[src] Wolfathon · Co-Working Dual`| Co-Working [Multi] |

Arrange the widgets inside each wrapper once (open the `[src]` scene, drag);
the other scenes never move.

**Position variants are intentional.** `Rewards` and `Rewards - Right` are
the SAME widget as two sources — one placed left-focus, one right-focus.
Toggle their visibility to switch which side of the screen the widget sits
on, depending on what else is up. The Solo wrapper ships with `Rewards`
hidden and `Rewards - Right` visible (matching the live rig). Add more
`<Widget> - Right` / `- Left` variants the same way when a widget needs a
second home.

### Scenes to sources (top = front)

| Scene              | Sources (top to bottom)                                                        |
| ------------------ | ------------------------------------------------------------------------------ |
| Starting Soon      | Starting Soon Video, Now Playing, Alerts, Audio                                 |
| Live               | PNG Tuber, NDI Source (hidden), Wolfathon · Live, Alerts, Audio, Background Video |
| Co-Working [Solo]  | Main Cam, Now Playing, Wolfathon · Co-Working Solo, Alerts, Audio, Co-Working Solo Video |
| Co-Working [Multi] | Main Cam, Second Cam, Now Playing, Wolfathon · Co-Working Dual, Alerts, Audio, Co-Working Dual Video |
| Be Right Back      | Be Right Back Video, Alerts, Audio                                              |
| Ending             | Ending Video, Audio                                                             |

The Solo wrapper's contents: Wheel of Dares, Rewards (hidden), Rewards -
Right, Timer.

`[src] Alerts` on the Mini = Chat Overlay + Sound Alerts + Twitch Alerts
(purple). Audio is the same three per-app captures as the MacBook Pro.

### Cams are pre-pinned to the overlay frames

The import already places cams exactly inside the overlay cam frames
(Scale-to-inner-bounds), matching `masks/` and the bundle README:

| Scene              | Source     | Position   | Size       | Mask                        |
| ------------------ | ---------- | ---------- | ---------- | --------------------------- |
| Co-Working [Solo]  | Main Cam   | 64, 136    | 1400 × 788 | `co-working-solo.png`       |
| Co-Working [Multi] | Main Cam   | 64, 136    | 1152 × 648 | `co-working-dual-big.png`   |
| Co-Working [Multi] | Second Cam | 1280, 628  | 576 × 324  | `co-working-dual-small.png` |

Add the Image Mask/Blend filter per cam (see `masks/README.md`) and you are
done.

### Overlay videos

The Mini's media sources point at the rendered bundle synced to Google Drive:

```
.../My Drive/MultiMedia Projects/Social Media/Twitch/Overlays/
```

`01-starting-soon.mp4`, `04-co-working-solo.mp4`, `05-co-working-dual.mp4`,
`06-be-right-back.mp4`, `07-ending-stream.mp4`, `background.mp4` — all Loop ON.
Drop the newest bundle's `Overlays/` contents into that Drive folder to update
every scene at once.
