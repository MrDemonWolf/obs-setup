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

- **Display:** Montserrat for the main headline.
- **Body:** Open Sans for status lines and small labels.
- Keep the title to one short line and the status to one clear sentence.
- Use one forest or pack phrase at a time; follow it with plain wording that
  tells viewers what is happening.
- Prefer sentence case. Keep utility labels such as `Chat` short.

Current scene-card copy:

| Scene | Headline | Status |
| --- | --- | --- |
| Starting Soon | The Pack Gathers | Settle in. We’ll begin shortly. |
| Be Right Back | Trail Break | Stepping away for a moment. I’ll be back soon. |
| Ending | Until Next Time | Thanks for sharing the trail. |

Keep scene labels and widget labels literal (`Starting Soon`, `Be Right Back`,
`Chat`). Put the forest-and-pack voice in one headline or status line instead
of adding themed labels to every widget. The countdown keeps `STREAM STARTS
IN` so viewers immediately know what its timer means; Loading Barks carries the
playful wolf-tech jokes.

## Scene patterns

- **Starting Soon / BRB / Ending:** forest background, glass title card,
  and a matching chat panel when chat is useful. Keep the title card logo-free:
  the small site label in its glass title bar is enough brand signature, and
  the open space keeps attention on the message and forest.
- **Just Chatting:** forest sky with a large camera area and a separate chat
  rail. Keep text and decoration out of the camera and chat openings.
- **Co-Working:** forest sky with clean camera frames and open space for OBS
  timers, tasks, music, and chat sources.
- **Transparent widgets:** use the denser shared glass surface so labels stay
  legible over gameplay. Use real platform marks only for Socials.
- **Background:** park the standalone background scene's moon on the right to
  match the other right-aligned layouts; scene-specific camera compositions
  may still move it when that keeps the sky clear.
- **Stinger:** keep the forest glass sweep and right-facing white paw trail as
  the single focal motion.

## Motion

- Full-scene movement loops seamlessly over the existing eight-second cycle.
- Stars twinkle softly; the moon stays still; the paw trail appears in a slow
  left-to-right walk and fades before the loop seam.
- Use a single restrained pulse for glass edges. Avoid adding glow, particles,
  or multiple simultaneous loops to the same panel.
- Both Countdown presets and the Stinger are intentional one-shot compositions;
  keep their timing and source audio rules unchanged.

## Fursona use

Keep the title and chat cards free of the round logo badge; it reads like a
separate app icon in this forest-and-glass system. The site label provides a
quiet brand cue. Save larger fursona artwork for a scene with deliberate open
space rather than squeezing it into these panels.

## Implementation map

- `src/theme.ts`: shared palette, glass, radius, and forest paw-trail tokens.
- `src/Background.tsx` and `src/wolf/PawTrail.tsx`: forest backdrop and walk.
- `src/TitleChip.tsx` and `src/ChatBoxFrame.tsx`: standby title and chat glass.
- `src/JustChattingScene.tsx` and `src/CoworkFrame.tsx`: scene-specific camera
  layouts using the same forest system.
- `src/scenes.ts`: the 13 production scenes and their copy.
- `preview/ObsPreview.tsx`: browser preview of the production scenes.
