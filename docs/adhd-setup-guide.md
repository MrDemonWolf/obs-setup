# OBS setup — scenes, sources, colors

One rule: **color = category.** In OBS, right-click a source (or a group) →
**Color** → click the swatch. Only the 8 built-in OBS colors are used.

## Colors → category

| OBS color    | Category                          |
| ------------ | --------------------------------- |
| Green        | Camera / VTuber (you, live)       |
| Purple       | Alerts (alert box + sound alerts) |
| Teal         | Cowork widgets (task + timer)     |
| Blue         | Cowork alerts                     |
| Yellow       | Screen / display capture          |
| Red          | Standby text                      |
| Gray (light) | Audio (Discord / Music / Chrome)  |
| Gray (dark)  | Background                        |

## Groups (build once)

Select the sources → right-click → **Group Selected Items** → name it →
right-click the group → **Color**.

| Group  | Color        | Sources inside                            |
| ------ | ------------ | ----------------------------------------- |
| Alerts | Purple       | Alert Box, Sound Alerts                   |
| Cowork | Teal         | Cowork Task, Cowork Timer                 |
| Audio  | Gray (light) | Discord Audio, Music Audio, Chrome Audio  |

## Standalone sources

| Source                           | OBS source type      | Color       |
| -------------------------------- | -------------------- | ----------- |
| Camera Device                    | Video Capture Device | Green       |
| VTuber Avatar                    | Browser              | Green       |
| Display Capture                  | Screen Capture       | Yellow      |
| Cowork Alerts Web                | Browser              | Blue        |
| Background                       | Image or Media (MP4) | Gray (dark) |
| Txt Starting Soon / BRB / Ending | Text                 | Red         |

## Scenes → what's in each

Top of the list = front. Bottom = behind. **Background always last.**

| Scene          | Sources (top → bottom)                                                              |
| -------------- | ---------------------------------------------------------------------------------- |
| Starting Soon  | Txt Starting Soon · Alerts group · Audio group · Background                         |
| Be Right Back  | Txt Be Right Back · Alerts group · Audio group · Background                         |
| Ending         | Txt Ending · Alerts group · Audio group · Background                                |
| Chat — VTuber  | VTuber Avatar · Alerts group · Audio group · Background                             |
| Chat — Camera  | Camera Device · Alerts group · Audio group · Background                             |
| Co-working     | Camera Device · Display Capture · Cowork group · Cowork Alerts Web · Audio · Background |

## What you're adding right now

- **Sound Alerts** — Browser source, Purple → drop into the **Alerts** group.
- **Cowork Task** + **Cowork Timer** — Browser sources, Teal → make a **Cowork** group.
- **Audio group** — Discord + Music + Chrome, Gray (light). macOS per-app audio
  needs **OBS 30+ "macOS Audio Capture"**, or a virtual device
  (BlackHole / Loopback) if OBS is older.
- **Background** — Image or a looping MP4 from `remotion/out/`, Gray (dark) →
  bottom of every scene.

## Notes

- Browser widget URLs ship **empty** (they hold secret tokens). Paste yours after
  adding. `make backup` scrubs them before git; the full copy stays in the
  `~/Downloads` zip only.
- Re-import instead of building by hand: `make gen` → OBS → Scene Collection →
  Import. Colors apply automatically. Import **replaces** the collection (re-paste
  URLs). The generated file bundles sources as `[src]` scenes; by hand you use
  Groups — same look.
