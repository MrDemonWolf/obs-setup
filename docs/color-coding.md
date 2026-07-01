# Color Coding

One palette, used everywhere. A glance at a source's color tells you what it
is. In OBS you set these by right-clicking a source in the **Sources** dock ->
color swatch. Only **sources** can be colored (not scenes in the scene list),
which is why the color lives on each source *where it appears inside a scene*.

## The palette

| Color  | Meaning              | Source hex | OBS stored value (ABGR) |
| ------ | -------------------- | ---------- | ----------------------- |
| Green  | Camera (you, on cam) | `#2EA043`  | `0xFF43A02E`            |
| Purple | Alerts               | `#8957E5`  | `0xFFE55789`            |
| Teal   | Cowork widgets       | `#1F9EA6`  | `0xFFA69E1F`            |
| Blue   | Cowork alerts        | `#388BFD`  | `0xFFFD8B38`            |
| Amber  | Screen / display     | `#BB8009`  | `0xFF0980BB`            |
| Red    | Standby text (Starting Soon / BRB / Ending) | `#DA3633` | `0xFF3336DA` |
| Pink   | VTuber avatar        | `#DB61A2`  | `0xFFA261DB`            |

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
- **Alerts purple** is the one thing on almost every scene, so it gets a
  distinct, high-contrast color.
- Cowork **teal/blue** sit next to each other visually because they belong to
  the same co-working group.

## The `[src]` convention

Scenes prefixed `[src]` are reusable building blocks (nested "source scenes")
that hold one real input each, so you configure a camera once and drop
`[src] Camera` into every scene that needs it. The empty scenes named with
dashes (`──────`) are just visual dividers in the scene list.
