# Color Coding

One palette, used everywhere. A glance at a source's color tells you what it
is. In OBS you set these by right-clicking a source in the **Sources** dock ->
color swatch. Only **sources** can be colored (not scenes in the scene list),
which is why the color lives on each source *where it appears inside a scene*.

## The palette

These are OBS's **8 built-in preset colors** (right-click a source or group,
then Color). One color per category, matching the live rig.

| Color        | Meaning              | Source hex | OBS stored value (ABGR) |
| ------------ | -------------------- | ---------- | ----------------------- |
| Green        | Webcam (you, live)   | `#2EA043`  | `0xFF43A02E`            |
| Purple       | Alerts Group (Sound + Twitch Alerts Box) | `#8957E5` | `0xFFE55789` |
| Teal         | Wolfathon widgets (Wheel of Dares / Rewards / Timer) | `#1F9EA6` | `0xFFA69E1F` |
| Blue         | WolfWave now-playing widget | `#388BFD` | `0xFFFD8B38`     |
| Yellow       | Screen / display capture (when added) | `#BB8009` | `0xFF0980BB` |
| Red          | Standby video (Starting Soon / Be Right Back) | `#DA3633` | `0xFF3336DA` |
| Gray (light) | Audio Group (Discord / Google Chrome / Apple Music) | `#8B949E` | `0xFF9E948B` |
| Gray (dark)  | Background image     | `#6E7681`  | `0xFF81766E`            |

The "stored value" column is how OBS writes the color in the scene JSON: a
32-bit **ABGR** integer (`0xAABBGGRR`), so the red channel is the low byte.
See [obs-json-reference.md](obs-json-reference.md#source-list-color) for the
byte-order details and worked examples.

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
  high-contrast color. The Alerts Group (Sound Alerts Box + Twitch Alerts Box)
  is one purple group.
- **Wolfathon teal** covers the interactive widgets (Wheel of Dares, Rewards,
  Timer) inside the Wolfathon group.
- **WolfWave blue** is the now-playing widget: its own info overlay, its own
  color.
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
