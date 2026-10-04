# Night Forest Walk Overlay System

The stream overlays use one shared visual direction: a quiet moonlit pine
forest, small white paw prints walking to the right, and restrained blue glass
panels. Scene layouts change to suit the content; color, type, materials, and
motion stay consistent.

## Research notes

Reviewed on 2026-10-03:

- [Nerd or Die: Glitch](https://nerdordie.com/product/glitch-full-stream-overlay-package/)
  keeps scene screens modular and lets creators use their own background loops.
- [Nerd or Die: Clearview](https://nerdordie.com/product/clearview-stream-pack/)
  carries one line-art style through the overlay, chat, alerts, and widgets, with
  modular scene elements.
- [Nerd or Die: React](https://nerdordie.com/product/react-stream-pack/)
  treats Starting Soon, BRB, Ending, Chatting, webcam layouts, widgets, and the
  stinger as one complete pack.
- [Streamlabs themes](https://streamlabs.com/themes) groups scene screens,
  webcam frames, chat, alerts, and goal widgets into matching theme bundles.

The direction for this stream takes the useful part of those systems—matching
scene and widget materials, reusable layouts, and room to adapt—while keeping
the visible decoration quiet so the forest, face camera, and chat stay easy to
read.

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

## Typography and copy

- **Display:** Montserrat for the main headline.
- **Body:** Open Sans for status lines and small labels.
- Keep the title to one short line and the status to one clear sentence.
- Use one forest or pack phrase at a time; follow it with plain wording that
  tells viewers what is happening.
- Prefer sentence case. Keep utility labels such as `Chat` short.

Current standby copy:

| Scene | Headline | Status |
| --- | --- | --- |
| Starting Soon | The Pack Gathers | We’ll be live in a moment. |
| Be Right Back | A Short Trail Break | Stay cozy — I’ll be back soon. |

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
- **Stinger:** keep the forest glass sweep and right-facing white paw trail as
  the single focal motion.

## Motion

- Full-scene movement loops seamlessly over the existing eight-second cycle.
- Stars twinkle softly; the moon stays still; the paw trail appears in a slow
  left-to-right walk and fades before the loop seam.
- Use a single restrained pulse for glass edges. Avoid adding glow, particles,
  or multiple simultaneous loops to the same panel.
- Countdown and Stinger are intentional one-shot compositions; keep their timing
  and source audio rules unchanged.

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
- `src/scenes.ts`: the 12 production scenes and their copy.
- `preview/ObsPreview.tsx`: browser preview of the production scenes.
