# Overlay assets

Drop these into `public/` (placeholders render without them):

- `logo-main.svg` (open mouth) + `logo-mouth-closed.svg` (closed) = the mascot
  used on the card scenes.
- `brands/*.svg` = real brand logos for the Socials badge.

macOS blocks reading the Google Drive folder directly (privacy/TCC), so drag
the SVGs into `public/` in Finder.

## Scenes

Defined in `src/scenes.ts` (single source of truth) — 11 scenes. Full-frame
scenes are 1920×1080 and loop seamlessly; the three transparent overlays
(Socials, Countdown, LoadingBarks) are widgets you stack over anything.

- **Cards** — `StartingSoon`, `BRB`, `EndingStream`: shared wolf night
  background + walking paw trail + glass title chip (macOS window style) +
  mascot. Edit titles / status text in `src/scenes.ts`; the mascot mouth is
  the scene's `mascotSrc` (`logo-main.svg` open / `logo-mouth-closed.svg`
  closed).
- **Just Chatting** — `JustChatting`: glow background + a 16:9 cam frame
  (1216×684 at 64,198) + a tall chat frame (512×684 at 1344,198). Drop your
  real cam + chat sources over the frames. `JustChattingVtuber` is the same
  scene minus the cam frame (VTuber model goes full-screen, chat frame stays).
- **Co-Working** — `CoworkingSolo`: one 1400×788 hero cam at 64,136.
  `CoworkingDual`: 1152×648 hero at 64,136 + 576×324 second cam at 1280,628.
  The open space is for timer / tasks / chat / now-playing OBS sources.
  Layouts live in `src/CoworkFrame.tsx` (`COWORK_LAYOUTS`); the matching
  rounded webcam masks are in `../masks/`.
- **Background** — plain wolf night background, nothing on top. The most
  flexible: also the base for a plain gameplay scene.
- **Socials** — standalone badge (760×180, transparent) fading through your
  platforms one at a time in real brand colors. Edit the list/handles in
  `src/Socials.tsx`.
- **Countdown** — transparent 5:00 timer chip, full-frame. The one intentional
  non-loop: set the OBS media source to play ONCE (Loop off), start on going
  live.
- **LoadingBarks** — transparent fake loading bar cycling wolf puns (~6.1 min
  loop). Edit `BARKS` in `src/LoadingBarks.tsx`.

The wolf night ambience (full moon, stars, drifting embers) lives in
`src/wolf/` + `src/Background.tsx`.

**Fonts:** Montserrat (headings) + Open Sans (body) via `src/fonts.ts` —
matching mrdemonwolf.com.

## Commands

```bash
npm run obs                     # previewer — a button per scene
npm run dev                     # Remotion Studio
npm run lint                    # eslint + tsc
npm run render:all              # render the standard set into out/

# or one at a time (comp id, then any output name)
npx remotion render StartingSoon out/01-starting-soon.mp4
```

`render:all` writes numbered, kebab-case files: `01-starting-soon.mp4`,
`02-just-chatting.mp4`, `03-just-chatting-vtuber.mp4`,
`04-co-working-solo.mp4`, `05-co-working-dual.mp4`, `06-be-right-back.mp4`,
`07-ending-stream.mp4`, `background.mp4`, plus `socials-badge.mov` / `.gif`
and `background.gif`.

The heavy transparent masters are excluded from `render:all` (multi-GB ProRes,
slow) — render manually, or let `../release.sh` handle everything:

```bash
npx remotion render Countdown    out/countdown.mov     --codec=prores --prores-profile=4444 --image-format=png --pixel-format=yuva444p10le --log=error
npx remotion render LoadingBarks out/loading-barks.mov --codec=prores --prores-profile=4444 --image-format=png --pixel-format=yuva444p10le --log=error
```

## Formats for OBS on Apple Silicon

- **Opaque scenes → H.264 MP4.** Hardware-decoded on every Apple Silicon chip,
  small files, smooth. This is what `render:all` produces.
- **Transparent overlays → ProRes 4444 `.mov` as the master, HEVC-alpha for
  OBS.** ProRes only hardware-decodes on M-series **Pro/Max/Ultra** — a base
  M1/M2 software-decodes it and can stutter. Transcode with
  `./to-hevc.sh out/<name>.mov`; HEVC (`hvc1`) hardware-decodes on every chip
  and is a fraction of the size. The Socials GIF is a smaller, lower-quality
  convenience alternative (1-bit alpha edges).

In OBS: add each file as a **Media Source**, check **Loop** (except
`countdown`, which plays once). Put backgrounds at the bottom of the scene and
stack your screen / webcam / widgets above them. Motion is periodic over the
full clip so the loop point is invisible.

### Lowest CPU / GPU / RAM on Apple Silicon

- **Use the MP4s** for opaque scenes and **HEVC-alpha** for transparent ones —
  both decode on the dedicated video block. A **GIF is heavier** — OBS decodes
  it on the CPU and holds frames in RAM.
- Tick **"Close file when inactive"** on Media Sources you're not currently
  showing, so hidden scenes cost nothing.

### Fitting your webcam to the frames

Every cam frame is true 16:9 now — no cropping needed. Position and size your
cam to the frame coordinates above (or see `../masks/README.md` for the full
table), then round its corners with the matching alpha mask from `../masks/`
(Image Mask/Blend filter, Alpha Mask · Alpha Channel).
