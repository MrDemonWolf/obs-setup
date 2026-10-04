# Forest Lounge motion research

Research collected October 4, 2026. These notes guide the next animation pass;
they do not mean the proposed sequence has been implemented or rendered.

- [Nerd or Die references](nerd-or-die-motion.md): Grid, Relay, React, and Amused.
- [Other stream packages](stream-package-motion.md): OWN3D, Streamlabs, and StreamElements.
- [Typography](stream-typography.md): Proxima Nova and openly licensed alternatives.

## Recommended direction

Use Plus Jakarta Sans 800 for a deliberate two-line headline, with a 500-weight
supporting line. Keep the approved Forest Lounge layout and stationary glass
chat on the right. Remove faux application chrome from the scene titles.

Give the text a visible 24-second broadcast sequence:

| Time | Proposed motion |
| --- | --- |
| 0–1.5 seconds | Masked, staggered headline reveal; supporting line follows. |
| 1.5–8 seconds | Readable hold. |
| 8–10 seconds | One moonlight highlight travels across the headline. |
| 10–21 seconds | Readable hold with forest ambience. |
| 21–23 seconds | Masked text exit. |
| 23–24 seconds | Title region rests, matching the next loop's starting state. |

These timings are our design proposal, not measured vendor animation timings.
Keep the real chat, countdown, and other OBS widgets visible throughout. Use
frame-driven Remotion motion; check both the loop boundary and readability at
normal preview size before final exports. The existing stinger audio timing is
independent of this standby sequence.
