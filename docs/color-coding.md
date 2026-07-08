# Color Coding

One palette, used everywhere. A glance at a source's color tells you what it
is. In OBS you set these by right-clicking a source in the **Sources** dock ->
color swatch. Only **sources** can be colored (not scenes in the scene list),
which is why the color lives on each source *where it appears inside a scene*.

## The palette

One category = one color. The **"OBS swatch to click"** column is what you
pick in OBS (right-click a source or group -> Color -> the colored square);
that's exactly what the live rig uses. The generated collection stores a close
custom hex instead (the `Source hex` column) so the previewer legend has a
stable color, but on your rig you just click the swatch.

| OBS swatch to click | Meaning              | Source hex | OBS stored value (ABGR) |
| ------------------- | -------------------- | ---------- | ----------------------- |
| **Green**   | Cam feeds (Main / Second / NDI / PNG Tuber) | `#2EA043`  | `0xFF43A02E`  |
| **Magenta** | Alerts (Chat Overlay + Sound Alerts + Twitch Alerts) | `#8957E5` | `0xFFE55789` |
| **Cyan**    | Wolfathon widgets (Wheel of Dares / Rewards / Timer) | `#1F9EA6` | `0xFFA69E1F` |
| **Blue**    | Now Playing (WolfWave) | `#388BFD` | `0xFFFD8B38`            |
| **Yellow**  | Screen / display capture (when added) | `#BB8009` | `0xFF0980BB` |
| **Red**     | Standby / overlay video (Starting Soon / BRB / Ending / bg) | `#DA3633` | `0xFF3336DA` |
| **White**   | Audio Group (Discord / Google Chrome / Apple Music) | `#8B949E` | `0xFF9E948B` |
| **Gray**    | Background image / overlay-frame videos | `#6E7681`  | `0xFF81766E` |

The live rig colors via OBS's **preset swatches**: the item stores
`private_settings.color-preset` (an index) and leaves `color` empty. The
generated collection instead writes a custom `color` int (`color-preset` 0).
The previewer decodes **both**. OBS's 8 swatches, by `color-preset` index:
`2`=red, `3`=yellow, `4`=green, `5`=cyan, `6`=blue, `7`=magenta, `8`=gray,
`9`=white (`0`=none, `1`=custom). The "stored value" column is how a custom
color is written: a 32-bit **ABGR** integer (`0xAABBGGRR`), red is the low
byte. See [obs-json-reference.md](obs-json-reference.md#source-list-color).

## Where it's defined

The source of truth is `PALETTE` at the top of
`scripts/gen_scene_collection.py`. Change a hex there, run `make gen`, and the
scene collection is rewritten with the new colors. The previewer legend
(`LEGEND` in `index.html`) mirrors the same values.

## Why these choices

- **Camera green** reads as "live / you are on."
- **Standby red** marks the offline screens (Starting Soon, Be Right Back,
  Ending) so they stand out from live scenes.
- **Alerts purple** is on almost every scene, so it gets a distinct,
  high-contrast color. The Alerts group (Sound Alerts + Twitch Alerts) is one
  purple group.
- **Wolfathon teal** covers the interactive widgets (Wheel of Dares, Rewards,
  Timer) inside the Wolfathon group.
- **Now Playing blue** is the WolfWave now-playing overlay: its own info
  element, its own color.
- **Audio light-gray** vs **Background dark-gray**: both are behind-the-scenes
  infrastructure, so both are neutral grays; the darker one recedes furthest
  (background). Audio is continuous app sound (Discord / Chrome / Apple Music).

Group related sources with OBS **Groups** (right-click, Group Selected Items),
then color the group. See [adhd-setup-guide.md](adhd-setup-guide.md) for the
full scene / group / source table with the color per item.

## The `[src]` convention

Scenes prefixed `[src]` are reusable building blocks (nested "source scenes")
that hold one real input each, so you configure a camera once and drop
`[src] Camera` into every scene that needs it. The empty scenes named with
dashes (`──────`) are just visual dividers in the scene list.

A wrapper's INTERNAL layout is shared everywhere it appears (same as an OBS
Group) — so anything you arrange differently per scene gets a **per-scene
wrapper** instead of one shared one. That's why the Mac Mini has
`[src] Wolfathon · Live`, `[src] Wolfathon · Co-Working Solo`, and
`[src] Wolfathon · Co-Working Dual`: the SAME three widget sources (one
browser connection each), arranged independently per scene. Drag the widgets
around inside one wrapper without touching the other scenes.
