# OBS Scene Collection JSON Reference

Notes on the OBS Studio scene collection format, focused on the parts this
repo touches: colors and secrets. On macOS these files live in
`~/Library/Application Support/obs-studio/basic/scenes/*.json`, and profiles
in `~/Library/Application Support/obs-studio/basic/profiles/<name>/`.

## Top-level shape

A scene collection is one JSON object. Keys that matter:

| Key                      | Holds                                                    |
| ------------------------ | -------------------------------------------------------- |
| `name`                   | Collection name                                          |
| `current_scene`          | Active scene name                                        |
| `current_program_scene`  | Program (output) scene name                              |
| `scene_order`            | Array of `{ "name": ... }` - the left-dock order         |
| `sources`                | Array of every source, **including scenes**              |
| `groups`                 | Group sources                                            |
| `transitions`            | Transition definitions                                   |
| `quick_transitions`      | Quick-transition buttons                                 |

## Scenes are sources

A scene is just a source with `"id": "scene"`. Its contents (the scene items)
live under `settings.items[]`. So `sources[]` contains both your regular
inputs and your scenes.

A **scene item** (an entry in `settings.items[]`) links to a source by `name`
(and `source_uuid`) and carries its placement:

```json
{
  "name": "Camera Device",
  "source_uuid": "….",
  "visible": true,
  "locked": false,
  "pos": { "x": 0.0, "y": 0.0 },
  "scale": { "x": 1.0, "y": 1.0 },
  "rot": 0.0,
  "crop_left": 0, "crop_top": 0, "crop_right": 0, "crop_bottom": 0,
  "align": 5,
  "bounds_type": 0,
  "id": 1,
  "private_settings": { "color": -12345298, "color-preset": 0 }
}
```

## Source list color

This is the color you set by right-clicking a source in the Sources dock.

- **Where:** `private_settings.color` on the **scene item** (not the source).
- **Type:** a signed 32-bit integer in **ABGR** byte order (`0xAABBGGRR`):
  alpha, blue, green, red - so red is the low byte.
- `color-preset` is the index of the highlighted swatch (`0` = custom).

Convert `#RRGGBB` -> stored int: `alpha(0xFF) << 24 | B << 16 | G << 8 | R`,
then treat as signed. Worked examples (opaque):

| Color | `#RRGGBB` | Unsigned    | Stored (signed) |
| ----- | --------- | ----------- | --------------- |
| Red   | `#FF0000` | `0xFF0000FF`| `-16776961`     |
| Green | `#00FF00` | `0xFF00FF00`| `-16711936`     |
| Blue  | `#0000FF` | `0xFFFF0000`| `-65536`        |

`scripts/gen_scene_collection.py` does this in `abgr()`; `index.html` reverses
it in `abgrToCss()`. The palette is in [color-coding.md](color-coding.md).

## Secrets - do not commit these

Exports are **not** scrubbed by OBS. Two fields carry secrets:

| File            | Field              | What it is           |
| --------------- | ------------------ | -------------------- |
| Scene JSON      | browser source `settings.url` | Alert/widget URLs often embed a private token |
| `service.json`  | `settings.key`     | Your Twitch stream key |

`scripts/sanitize.py` blanks both before anything lands in git. The full,
un-scrubbed copy only exists in the Google Drive zip. Source type id for
browser sources is `browser_source`.

## macOS source type ids

The generated collection uses these `id` values (yours may differ slightly by
OBS version - OBS will flag a source to reconfigure rather than fail import):

| Source            | `id`                | Notes                          |
| ----------------- | ------------------- | ------------------------------ |
| Nested scene      | `scene`             | The `[src]` building blocks    |
| Camera            | `av_capture_input`  | Pick the device after import   |
| Screen / display  | `screen_capture`    | ScreenCaptureKit (OBS 29+)     |
| Browser           | `browser_source`    | URL wiped; paste after import  |
| Text              | `text_ft2_source`   | FreeType text                  |

## Conventions

- **Dividers:** empty scenes named with dashes (`──────`) fake a separator in
  the scene list. Not an official feature, just an empty scene.
- **`[src]` scenes:** nested "source scenes" used as reusable building blocks,
  prefixed so they sort together at the bottom of the list.
- **Assets aren't bundled:** exports store file paths, not the image/video
  files. Keep assets in a synced folder.

---

Sources: OBS docs (docs.obsproject.com/reference-scenes), OBS source on
GitHub (obsproject/obs-studio `UI/source-tree.cpp`), and the OBS forums on
scene organization and sharing scene JSON.
