# MrDemonWolf Stream Overlays (Remotion)

Animated, seamless-looping OBS overlays — a quiet night forest, starry sky,
moonlight, a soft white paw trail, and restrained blue glass. Card scenes keep
their title and chat panels logo-free; the site label carries the brand. The
shared visual direction is documented in
[`../docs/overlay-design-system.md`](../docs/overlay-design-system.md).
Full-scene videos are 1920×1080, 8-second loops. Transparent widgets use
compact panel-sized canvases for easier placement in OBS.

## Make all the overlays — one command

```bash
npm install
npm run render:all
```

That renders **every scene** into `out/` (gitignored). Add the files to OBS —
that's the whole workflow.

### What you get

Numbered by stream flow so they sort in order:

| File | Use in OBS |
| ---- | ---------- |
| `01-starting-soon.mp4` | "starting soon" loop (before you go live) |
| `02-just-chatting.mp4` | webcam + chat frame layout |
| `03-streaming.mp4` | gameplay / main background |
| `04-co-working.mp4` | co-working background |
| `05-be-right-back.mp4` | away / break loop |
| `06-ending-stream.mp4` | end-of-stream loop |
| `background.mp4` | universal background (any scene) |
| `socials-badge.mov` | transparent socials badge (720×140, best quality) |
| `socials-badge.gif` | lighter 720×140 transparent socials badge |
| `background.gif` | GIF copy of the background (heavier — prefer the MP4) |

## Preview before rendering

```bash
npm run obs     # macOS-style previewer, a button per scene → http://localhost:5178
npm run dev     # Remotion Studio
```

### Stinger visual concepts

The preview-only compositions `StingerPawglass`, `StingerAurora`,
`StingerFrost`, `StingerEclipse`, and `StingerSnow` are stills for comparing
ideas. They are not included in overlay or Stinger releases. Render the contact
sheet with:

```bash
npx remotion still src/index.ts StingerConceptBoard out/stinger-concepts-board.png --frame=0
```

The production `Stinger` is the four-second full-moon wipe with a centered cyan
paw print. The former Paw Swipe stays behind it as a layered glass-and-forest
underlay. It has no second audio track; the original WAV is played once, with
its measured peak aligned to the 2000 ms covered scene-swap point.

## Add to OBS (and keep it light on an M1)

1. **Sources → + → Media Source**, pick the file, check **Loop**.
2. Put backgrounds at the **bottom** of the scene; stack your screen / webcam /
   widgets **above** them.
3. **Use the MP4s.** H.264 is hardware-decoded on Apple Silicon — the lightest
   option for CPU / GPU / RAM. A **GIF is ~3× heavier** (CPU-decoded, frames
   held in RAM), so the `.gif` copies are convenience-only. For the transparent
   Socials, `socials.mov` (ProRes 4444) is hardware-decoded and best; the GIF is
   the light-but-lower-quality fallback.
4. Turn on **"Close file when inactive"** for sources in scenes you're not
   showing, so they cost nothing.

### Fit sources to the live frames

The updated Just Chatting camera frame is **1232 × 693 at (64, 190)**, which
keeps the webcam at 16:9. Its companion chat frame is **528 × 693 at
(1328, 190)**. Co-Working Dual uses an **1184 × 666** main camera at (64, 136)
and a **576 × 324** second camera at (1280, 628). Match the OBS source
transform to those dimensions, then apply the matching PNG mask to each camera.
The overlay files and masks are updated; the saved scene-collection JSON is
left for you to adjust in OBS.

## Render one at a time

```bash
npx remotion render StartingSoon out/01-starting-soon.mp4
npx remotion render Socials out/socials-badge.mov --codec=prores --prores-profile=4444
npx remotion render Socials out/socials-badge.gif --codec=gif
```

Composition ids (left arg): `StartingSoon`, `BRB`, `JustChatting`,
`JustChattingVtuber`, `CoworkingSolo`, `CoworkingDual`, `EndingStream`,
`Background`, `Socials` (720×140), `Countdown` (5:00, 820×500),
`Countdown10` (10:00, 820×500), `LoadingBarks` (1080×420), and the `Stinger`
transition. The output filename (right arg) is up to you — `render:all` uses the
numbered names above (Countdown, LoadingBarks, and Stinger render via
`make release`).

## Customize

Everything is defined in `src/`:

- **Text / scene list** — `src/scenes.ts` (titles, status lines, mascot mouth).
- **Colors / radii / timing** — `src/theme.ts`.
- **Fonts** — `src/fonts.ts` (Plus Jakarta Sans 500/800 for lounge titles and
  widgets; Open Sans for chat). Shared widget surfaces live in `src/ForestWidget.ts`.
- **Socials** — `src/Socials.tsx` (which platforms + handles). Brand logos live
  in `public/brands/` (Twitch, X, YouTube, Instagram, GitHub, Discord, plus
  Bluesky / Ko-fi / Patreon / Threads / Kick / TikTok to swap in).
- **Mascot** — `public/logo-main.svg` (open mouth), `public/logo-mouth-closed.svg`
  (closed). Lively scenes use open, calm scenes use closed.
- **Wolf ambience** — `src/wolf/` (Moon, Starfield, Embers, PawTrail).

See [`ASSETS.md`](ASSETS.md) for the full scene + asset reference.

## Notes

- Animate with `useCurrentFrame()` + `interpolate()` only — CSS transitions /
  animations don't render in Remotion. All motion is periodic over the clip so
  the loop point is invisible.
- `npm run lint` runs ESLint + `tsc` on `src` and `preview`.
