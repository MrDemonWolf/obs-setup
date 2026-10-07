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

## MacBook Pro (MBP Streaming layout)

Build this BY HAND in OBS — the tables below are your checklist. The layout
mirrors the Mac Mini's scene flow (same scene names, same wrapper pattern,
same overlay videos) adapted to what travels: ONE webcam — no NDI, no PNG
Tuber, no second cam — so Live fronts the webcam and there is a single
Co-Working scene (the solo layout).

The repo never writes into OBS. Sync goes ONE way, OBS -> repo: run
`obs-backup`, done (see
[backup-guide.md](backup-guide.md)). The generated
`devices/macbook-pro/scenes/MBP-Streaming.json` exists only as an optional
reference / spare copy of this layout — ignore it if you're building by
hand.

### Wrappers (arrive pre-built and colored)

| Wrapper                      | Color        | Sources inside                     |
| ---------------------------- | ------------ | ---------------------------------- |
| [src] Alerts                 | Purple       | Chat Overlay, Sound Alerts, Twitch Alerts |
| [src] Audio                  | Gray (light) | Discord, Google Chrome, Apple Music|
| [src] Wolfathon · Live       | Teal         | Wheel of Dares, Rewards, Timer     |
| [src] Wolfathon · Co-Working | Teal         | Wheel of Dares, Rewards (hidden), Rewards - Right, Timer |

Wolfathon wrappers are PER SCENE — a wrapper's internal layout is shared by
every scene that uses it, so each scene gets its own copy to arrange (the
[Mac Mini section](#per-scene-wolfathon-wrappers-the-point-of-this-layout)
explains why). Open the `[src]` scene, drag once, done.

Each Audio source is **macOS Audio Capture**, Method **Application** (OBS 30+,
macOS 13+, ScreenCaptureKit — no BlackHole or Loopback).
Docs: https://obsproject.com/kb/macos-desktop-audio-capture-guide

For per-source volume levels (Compressor settings per source, target dBFS
lanes), see [audio-levels.md](audio-levels.md).

### Standalone sources

| Source                     | OBS source type      | Color       |
| -------------------------- | -------------------- | ----------- |
| Webcam                     | Video Capture Device | Green       |
| Now Playing                | Browser              | Blue        |
| Co-Working Timer Widget    | Browser              | Teal        |
| Co-Working Tasklist Widget | Browser              | Teal        |
| Starting Soon Video        | Media Source         | Red         |
| Be Right Back Video        | Media Source         | Red         |
| Ending Video               | Media Source         | Red         |
| Background Video           | Media Source         | Gray (dark) |
| Co-Working Solo Video      | Media Source         | Gray (dark) |

### Scenes to sources (top = front)

Opaque full-frame media (the webcam, the standby videos) always sits BELOW
the widget/alert overlays — on top it would hide them.

| Scene         | Sources (top to bottom)                                                        |
| ------------- | ------------------------------------------------------------------------------ |
| Starting Soon | Now Playing, Alerts, Audio, Starting Soon Video                                 |
| Live          | Wolfathon · Live, Alerts, Webcam (full-frame), Audio, Background Video          |
| Co-Working    | Co-Working Timer Widget, Co-Working Tasklist Widget, Now Playing, Alerts, Wolfathon · Co-Working, Webcam (pinned), Audio, Co-Working Solo Video |
| Be Right Back | Alerts, Audio, Be Right Back Video                                              |
| Ending        | Audio, Ending Video                                                             |

### Cam is pre-pinned to the overlay frame

| Scene      | Source | Position | Size       | Mask                  |
| ---------- | ------ | -------- | ---------- | --------------------- |
| Co-Working | Webcam | 64, 136  | 1400 × 788 | `co-working-solo.png` |

Add the Image Mask/Blend filter on the webcam (see `masks/README.md`) to
round its corners into the frame.

### Overlay videos

Same rendered bundle as the Mini, synced to Google Drive:

```
/Users/nathanialhenniges/Library/CloudStorage/GoogleDrive-nathanial.henniges@mrdemonwolf.com/My Drive/MultiMedia Projects/Social Media/Twitch/Overlays
```

`01-starting-soon.mp4`, `04-co-working-solo.mp4`, `06-be-right-back.mp4`,
`07-ending-stream.mp4`, `background.mp4` — all Loop ON. One bundle serves
both Macs: drop a new bundle's `Overlays/` into that folder and every scene
on every device updates at once.

## Notes

- Browser widget URLs ship empty (they hold secret tokens). Paste yours after
  adding. `make backup` scrubs them before git; the full copy stays in the
  Google Drive backup zip only.
- Sync the repo to your real OBS: run `obs-backup` (or `make backup`). That
  captures the live setup (scrubbed), so the previewer and `devices/` match what
  you actually run. The generator (`make gen`) is just the starting seed.
- Yellow (Screen) is reserved for when you add a Display Capture source.

## Mac Mini (Mini Streaming layout)

Same deal: build by hand using the tables below; `make backup` stores what
you built. This is the cleaned-up version of the live rig: typo names fixed
(`Co-workking Main Cam` -> `Main Cam`, `Co-Workng Video` -> `Co-Working Solo
Video`), every item color-coded, and the old empty global `Wolfathon` group
replaced with per-scene wrappers. The generated
`devices/mac-mini/scenes/Mini-Streaming.json` is the optional reference copy
of this layout.

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

Opaque feeds (standby videos, cams, NDI) sit BELOW the widget/alert
overlays, like the live rig — unhiding NDI must never blank chat/alerts.

| Scene              | Sources (top to bottom)                                                        |
| ------------------ | ------------------------------------------------------------------------------ |
| Starting Soon      | Now Playing, Alerts, Audio, Starting Soon Video                                 |
| Live               | Wolfathon · Live, Alerts, PNG Tuber, NDI Source (hidden), Audio, Background Video |
| Co-Working [Solo]  | Co-Working Timer Widget, Co-Working Tasklist Widget, Now Playing, Alerts, Wolfathon · Co-Working Solo, Main Cam, Audio, Co-Working Solo Video |
| Co-Working [Multi] | Co-Working Timer Widget, Co-Working Tasklist Widget, Now Playing, Alerts, Wolfathon · Co-Working Dual, Main Cam, Second Cam, Audio, Co-Working Dual Video |
| Be Right Back      | Alerts, Audio, Be Right Back Video                                              |
| Ending             | Audio, Ending Video                                                             |

The Solo wrapper's contents: Wheel of Dares, Rewards (hidden), Rewards -
Right, Timer.

`[src] Alerts` on the Mini = Chat Overlay + Sound Alerts + Twitch Alerts
(purple). Audio is the same three per-app captures as the MacBook Pro.

### Howlbox chat on standby cards

Add a `Howlbox Chat` browser source manually in OBS for Starting Soon and Be
Right Back. The overlay videos have a larger quiet glass frame at **704 × 320,
x=64, y=720** on the 1920 × 1080 canvas; set the browser source to that size
and position. Keep its background transparent if Howlbox supports it.

Live has no permanent Howlbox frame, so use the lower-right only when the game
leaves that area clear. Co-Working Solo keeps an open right rail. Co-Working
Multi leaves clear forest areas around the cameras for OBS widgets; the video
does not draw widget boxes or labels there.

| Scene | Suggested Howlbox area | Keep the scene calm by… |
| ----- | ---------------------- | ----------------------- |
| Live | Lower-right: **x=1216, y=660, 640 × 360** | Use it only when the game leaves that corner clear. |
| Co-Working [Solo] | Portrait right rail: **x=1488, y=200, 368 × 700** | Use a matching portrait browser source and replace the task list / right-side Rewards. |
| Co-Working [Multi] | Upper-right forest: **x=1280, y=312, 576 × 288** | Add chat or a task list directly over the clear forest above the small camera. |

The dual layout also leaves an open lower band at **x=64, y=826, 1184 × 190**
below the main camera. Place Timer, Tasks, Now Playing, or other OBS browser
sources directly over the forest there; use only the widgets you need so the
layout stays calm. Keep Rewards and Wheel hidden until needed. The standby and
co-working chat placements need browser sources sized to their chosen area.

### Align OBS sources to the overlay frames

The Remotion overlays and bundled masks use these positions. The generated
scene-collection JSON is unchanged, so adjust the corresponding OBS sources
manually to match; these are the current overlay frame coordinates:

| Scene              | Source     | Position   | Size       | Mask                        |
| ------------------ | ---------- | ---------- | ---------- | --------------------------- |
| Co-Working [Solo]  | Main Cam   | 64, 136    | 1400 × 788 | `co-working-solo.png`       |
| Co-Working [Multi] | Main Cam   | 64, 136    | 1184 × 666 | `co-working-dual-big.png`   |
| Co-Working [Multi] | Second Cam | 1280, 628  | 576 × 324  | `co-working-dual-small.png` |
| Just Chatting       | Cam        | 64, 190    | 1232 × 693 | `just-chatting-cam.png`     |
| Just Chatting       | Chat       | 1328, 190  | 528 × 693  | `just-chatting-chat.png`    |

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
