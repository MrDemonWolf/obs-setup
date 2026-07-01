# MrDemonWolf Stream Overlays (Remotion)

Animated, seamless-looping OBS overlays — a wolf night theme with a full moon,
starfield, drifting embers, and a padding paw trail. Every scene is a 1920×1080,
8-second seamless loop rendered to a plain video file you drop into OBS.

## Make all the overlays — one command

```bash
npm install
npm run render:all
```

That renders **every scene** into `out/` (gitignored). Add the files to OBS —
that's the whole workflow.

### What you get

| File | Scene | Use in OBS |
| ---- | ----- | ---------- |
| `StartingSoon.mp4` | Starting Soon | "starting soon" loop |
| `BRB.mp4` | Be Right Back | away / break loop |
| `JustChatting.mp4` | Just Chatting | webcam + chat frame layout |
| `Streaming.mp4` | Streaming | gameplay background |
| `Coworking.mp4` | Co-Working | co-working background |
| `EndingStream.mp4` | Ending Stream | end-of-stream loop |
| `Background.mp4` | Background | universal background |
| `socials.mov` | Socials | transparent handles badge (best quality) |
| `socials.gif` | Socials | lighter transparent badge |
| `Background.gif` | Background | GIF copy (heavier — prefer the MP4) |

## Preview before rendering

```bash
npm run obs     # macOS-style previewer, a button per scene → http://localhost:5178
npm run dev     # Remotion Studio
```

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

### Fit your webcam to the Just Chatting frame

The webcam frame is **1160×1000** — position your webcam source at **x=40,
y=40**. Its aspect is narrower than 16:9, so crop the sides:

| Webcam | Crop Left | Crop Right | Crop Top | Crop Bottom |
| ------ | --------- | ---------- | -------- | ----------- |
| 1080p (1920×1080) | 334 | 334 | 0 | 0 |
| 720p (1280×720)   | 222 | 222 | 0 | 0 |

In OBS: select the webcam, hold **Alt** and drag the left/right edges (or
right-click → **Transform → Edit Transform** and type the crop), then size it to
fill the frame.

## Render one at a time

```bash
npx remotion render StartingSoon out/StartingSoon.mp4
npx remotion render Socials out/socials.mov --codec=prores --prores-profile=4444
npx remotion render Socials out/socials.gif --codec=gif
```

## Customize

Everything is defined in `src/`:

- **Text / scene list** — `src/scenes.ts` (titles, status lines, mascot mouth).
- **Colors / radii / timing** — `src/theme.ts`.
- **Fonts** — `src/fonts.ts` (Montserrat; swap in Proxima Nova by dropping the
  files in `public/fonts/`).
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
- `npm run lint` runs ESLint + `tsc` on `src`.
