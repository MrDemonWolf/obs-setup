# OBS setup: scenes, sources, colors

One rule: color = category. In OBS, right-click a source or a group, pick
Color, click the swatch. Only the 8 built-in OBS colors are used.

## Colors to category

| OBS color    | Category                          |
| ------------ | --------------------------------- |
| Green        | Webcam (you, live)                |
| Purple       | Alerts (Sound Alerts + Twitch Alerts) |
| Teal         | Wolfathon widgets (wheel/rewards/timer) |
| Blue         | Now Playing (WolfWave)            |
| Yellow       | Screen / display (when you add it)|
| Red          | Standby videos (Starting Soon / Be Right Back) |
| Gray (light) | Audio (Discord / Chrome / Apple Music) |
| Gray (dark)  | Background image                  |

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
