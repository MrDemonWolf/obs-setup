# Overlay assets

Drop these into `public/` (placeholders render without them):

- `logo-main.svg` (open mouth) + `logo-mouth-closed.svg` = mascot; `logo.svg` =
  the small mark shown in the Streaming / Co-Working title bars.

macOS blocks reading the Google Drive folder directly (privacy/TCC), so drag
the SVGs into `public/` in Finder.

## Scenes

Defined in `src/scenes.ts` (single source of truth). All are opaque animated
backgrounds — 1920×1080, 8s, seamless loop, rendered to MP4.

- **Cards** — `StartingSoon`, `BRB`, `EndingStream`: wolf night background +
  glass title panel + mascot + a walking paw trail. `mood` drives the vibe:
  `hero` (open-mouth mascot), `calm`, `ember` (warm embers, wind-down).
- **Just Chatting** — clean embed layout: webcam frame + an empty CHAT panel.
  Drop your real cam + chat sources over the two boxes.
- **Socials** — standalone badge (760×180, transparent) that fades through your
  platforms one at a time (Twitch / X / YouTube / Instagram / GitHub / Discord).
  Render it as its own transparent file and add it as any OBS source. Real brand
  logos in `public/brands/`; edit the list/handles in `src/Socials.tsx`.
- **Streaming** — just the animated background + a slim title bar (name only).
  Stack your game capture / cam / widgets on top however you want.
- **Co-Working** — simple outline layout on the navy background with labelled
  zones (WEBCAM / FOCUS TIMER / TASKS / CHAT). Labels only show in the
  previewer (`guides`), not the render.
- **Background** — plain wolf night background, nothing on top. The most
  flexible: add whatever you want over it.

**Mascot mouth:** lively scenes use `logo-main.svg` (open); calm scenes use
`logo-mouth-closed.svg` (closed). The wolf night ambience (full moon, stars,
drifting embers) lives in `src/wolf/` + `src/Background.tsx`; a walking paw
trail runs along the bottom of the card scenes (`src/wolf/PawTrail.tsx`).

**Fonts:** Montserrat (free Proxima Nova stand-in) in `src/fonts.ts` — to use
real Proxima Nova, drop the files in `public/fonts/` and load them there.
**Socials:** brand SVGs in `public/brands/`, edit handles in `src/Socials.tsx`.

Edit titles / status text in `src/scenes.ts`.

## Commands

```bash
npm run obs                     # previewer — a button per scene
npm run dev                     # Remotion Studio
npm run render:all              # render everything into out/

# or one at a time
npx remotion render StartingSoon out/StartingSoon.mp4

# standalone social badge → transparent
npx remotion render Socials out/socials.mov --codec=prores --prores-profile=4444
npx remotion render Socials out/socials.gif --codec=gif
```

## Formats for OBS on Apple Silicon (M1)

- **Opaque scenes → H.264 MP4** (`.mp4`). Hardware-decoded on every Apple
  Silicon chip, small files, smooth. This is what `render:all` produces.
- **Transparent (Socials) → ProRes 4444 `.mov`** — hardware-decoded on M1,
  clean alpha; the best-quality choice for OBS on macOS. The **GIF** is a
  smaller, lower-quality convenience alternative (1-bit alpha edges).

In OBS: add each file as a **Media Source**, check **Loop**. Put backgrounds at
the bottom of the scene and stack your screen / webcam / widgets above them.
Motion is sine-based over the full clip so the loop point is invisible.

### Lowest CPU / GPU / RAM on Apple Silicon

- **Use the MP4s.** H.264 is decoded by the M1's dedicated video block, so a
  looping MP4 Media Source is the lightest option. A **GIF is heavier** — OBS
  decodes it on the CPU and holds frames in RAM. GIFs are included only for
  convenience; prefer the MP4 (or ProRes `.mov` for the transparent Socials).
- Tick **"Close file when inactive"** on Media Sources you're not currently
  showing, so hidden scenes cost nothing.
- These loops are 1080p30, 8s — small files, trivial decode load.

### Fitting your webcam to the Just Chatting frame (OBS crop)

The webcam frame is **1160×1000** px; position your webcam source at **x=40,
y=40**. Its aspect (~1.16:1) is narrower than a 16:9 webcam, so crop the sides
so nothing stretches:

| Webcam | Crop Left | Crop Right | Crop Top | Crop Bottom |
| ------ | --------- | ---------- | -------- | ----------- |
| 1080p (1920×1080) | 334 | 334 | 0 | 0 |
| 720p (1280×720)   | 222 | 222 | 0 | 0 |

In OBS: select the webcam source, hold **Alt** and drag the left/right edges to
crop (or right-click → **Transform → Edit Transform** and type the values),
then size it to fill the 1160×1000 frame. Want zero crop instead? The frame can
be reshaped to 16:9.
