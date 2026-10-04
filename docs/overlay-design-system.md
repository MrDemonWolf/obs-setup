# Night Forest Walk Overlay System

The stream overlays use one shared visual direction: a quiet moonlit pine
forest, small white paw prints walking to the right, and restrained blue glass
panels. Scene layouts change to suit the content; color, type, materials, and
motion stay consistent.

## Research notes

Reviewed on 2026-10-04:

- [Nerd or Die: Glitch](https://nerdordie.com/product/glitch-full-stream-overlay-package/)
  keeps scene screens modular and lets creators use their own background loops.
- [Nerd or Die: Clearview](https://nerdordie.com/product/clearview-stream-pack/)
  carries one line-art style through the overlay, chat, alerts, and widgets, with
  modular scene elements.
- [Nerd or Die: React](https://nerdordie.com/product/react-stream-pack/)
  treats Starting Soon, BRB, Ending, Chatting, webcam layouts, widgets, and the
  stinger as one complete pack.
- [Nerd or Die: Exodus](https://nerdordie.com/product/exodus-stream-pack/)
  presents a consistent set of Starting Soon, BRB, and Ending scenes, with
  editable text and a clear-content-first layout.
- [Nerd or Die: Grid](https://nerdordie.com/product/grid-stream-package/)
  uses minimal, bold scene typography and customizable wording.
- [Streamlabs themes](https://streamlabs.com/themes) groups scene screens,
  webcam frames, chat, alerts, and goal widgets into matching theme bundles.

The direction for this stream takes the useful part of those systems—matching
scene and widget materials, reusable layouts, and room to adapt—while keeping
the visible decoration quiet so the forest, face camera, and chat stay easy to
read. Keeping navigation labels literal while placing theme language in the
main card copy is our recommendation based on those examples.

## Visual tokens

| Token | Use |
| --- | --- |
| Midnight `#091533` | Main glass and deep shadow |
| Cerulean `#00ACED` | Focus accent and restrained glow |
| Bright cerulean `#38C6F5` | Small highlights and motion detail |
| Soft white `#F2F7FF` | Paw trail and light marks |
| White `#FFFFFF` | Primary text |
| Cornflower `#6B8BF5` | Secondary blue tint |

Use the shared tokens in `src/theme.ts`; use the checked-in forest photograph
(`public/forest-night-base.png`) rather than drawing extra tree silhouettes.
Panels use the existing glass fill, bevel, border, and shadow tokens. Keep
rounded corners consistent with `radius.card` and avoid adding a second frame
around already-framed content.

Standalone Socials, Countdown, and Loading Barks files should use compact
composition bounds around their glass panels and shadows instead of a
1920×1080 transparent canvas. Their current source sizes are 720×140, 820×500,
and 1080×420 respectively; the 8 scene screens and Stinger remain full-frame.

## Typography and copy

- **Display:** Plus Jakarta Sans 800 for lounge headlines and widget values.
- **Body:** Plus Jakarta Sans 500 for lounge support text and widget labels; Open Sans remains on the chat frame.
- Use deliberate line breaks for large standby titles and one clear supporting sentence.
- Use one forest or pack phrase at a time; follow it with plain wording that
  tells viewers what is happening.
- Prefer sentence case. Keep utility labels such as `Chat` short.

Current scene-card copy:

| Scene | Headline | Status |
| --- | --- | --- |
| Starting Soon | The Den Opens Soon | Grab a drink. The pack will be live shortly. |
| Be Right Back | A Moment Off the Trail | Stretch your paws. I’ll be right back. |
| Ending | Until the Next Howl | Thanks for spending time with the pack. |

Keep scene labels and widget labels literal (`Starting Soon`, `Be Right Back`,
`Chat`). Put the forest-and-pack voice in one headline or status line instead
of adding themed labels to every widget. The countdown keeps `STREAM STARTS
IN` so viewers immediately know what its timer means; Loading Barks carries the
playful wolf-tech jokes.

## Scene patterns

- **Starting Soon / BRB / Ending — Forest Lounge:** open headline at
  `(96,330)` over a gentle left-side dark fade; no title box, window dots,
  website label, or fixed logo. Starting Soon and BRB have a glass chat panel
  at `(1184,216)`, sized `640×720`, closer to the moon; Ending has no chat panel.
  Place the real chat source inside `(1206,276)`, sized `596×638`.
  Reserve the lower-left area `(96,700)` through `(1096,936)` for separately
  added countdown, loading barks, or socials sources. No baked widget outlines.
- **Just Chatting:** moonlit cabin window with a large camera area and chat
  rail. A separate transparent desk and coffee-steam video layers above the
  VTuber model to hide its lower crop. See [cabin setup](cabin-setup.md).
- **Co-Working:** the same cabin with clean camera frames and open space for OBS
  timers, tasks, music, and chat sources.
- **Transparent widgets:** use `ForestWidget` moonlit glass so labels stay
  legible over gameplay. No traffic-light dots or window bars. Use white paws,
  silver-blue progress, and real platform marks for Socials.
- **Background:** park the standalone background scene's moon on the right to
  match the other right-aligned layouts; scene-specific camera compositions
  may still move it when that keeps the sky clear.
- **Stinger:** a shaded, cratered steel-blue moon expands around a centered
  navy paw with a restrained cyan outline, covers the frame for the scene swap,
  then retreats to reveal the next scene. Avoid white flashes and broad cyan
  glow. The former paw sweep remains a subtle rear glass layer; its original
  WAV timing stays aligned to the 2000 ms cut point.

## Motion

- Starting Soon and BRB export as 72-second loops (2160 frames at 30 fps).
  Plus Jakarta Sans 800 headlines reveal with deliberate line breaks, hold,
  catch a moonlight sweep at 8–10 seconds, and exit at 33–35 seconds.
  This repeats every 36 seconds, giving the headline a longer readable hold.
  Supporting text uses Plus Jakarta Sans 500 and follows the title with a fade.
  The existing fursona artwork peeks from the upper-left edge at 37–43.8 seconds;
  this is a predetermined cameo once per loop, not runtime randomness. It stays
  above the text and away from the lower-left widget area and right-side chat.
  Forest motion repeats nine eight-second cycles, including the white paw trail.
- Ending plays once for 150 seconds (4500 frames at 30 fps), with no chat.
  Its headline reveals once and remains readable. This is the 90-second raid
  countdown documented in [Twitch's API reference](https://dev.twitch.tv/docs/api/reference/#start-a-raid)
  plus 60 seconds. It does not start or synchronize a Twitch raid automatically.
  In OBS, disable Loop and disable "Show nothing when playback ends" to hold
  the final image. Play the song separately; no song audio is embedded.
- Stars twinkle softly; the moon stays still; the paw trail appears in a slow
  left-to-right walk and fades before the loop seam.
- Use a single restrained pulse for glass edges. Avoid adding glow, particles,
  or multiple simultaneous loops to the same panel.
- Both Countdown presets and the Stinger are intentional one-shot compositions;
  keep their timing and source audio rules unchanged.

## Fursona use

Keep the title and chat cards free of the round logo badge; it reads like a
separate app icon in this forest-and-glass system. Save larger fursona artwork for a scene with deliberate open
space rather than squeezing it into these panels.

## Implementation map

- `src/theme.ts`: shared palette, glass, radius, and forest paw-trail tokens.
- `src/Background.tsx` and `src/wolf/PawTrail.tsx`: forest backdrop and walk.
- `src/TitleChip.tsx` and `src/ChatBoxFrame.tsx`: standby title and chat glass.
- `src/ForestWidget.ts`: shared moonlit glass for Socials, Countdown, and Loading Barks. No window controls or domain labels; Plus Jakarta Sans 500/800, white paws, and a restrained silver-blue accent. Local integer animation cycles preserve loop seams at either frame rate. Existing panel bounds and timer durations remain unchanged.
- `src/JustChattingScene.tsx` and `src/CoworkFrame.tsx`: scene-specific camera
  layouts using the same forest system.
- `src/scenes.ts`: the 16 production compositions and their copy, including full coffee and cabin-only backgrounds.
- `preview/ObsPreview.tsx`: browser preview of the production scenes.
