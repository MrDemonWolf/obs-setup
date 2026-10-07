# Nerd or Die motion references

Research date: October 4, 2026. Scope: official product descriptions and their linked demo references. Exact demo timing was not measured; the timeline below is a proposed design for this project.

## What the references support

| Reference | Published design characteristics | Useful direction for Forest Lounge |
| --- | --- | --- |
| [Grid](https://nerdordie.com/product/grid-stream-package/) | Bold typography with a restrained layout; adjustable widget fonts, padding, and line width; alert animation direction can be customized. | Make the standby headline a strong graphic focal point. Increase weight and size, then use controlled directional movement. |
| [Relay](https://nerdordie.com/product/relay-marathon-stream-overlay-widgets/) | Animated scene text; a structural overlay foundation; animated chat and events with configurable positioning and sizing. | Separate the headline animation from practical chat and widget regions. Preserve a stable right-hand chat area. |
| [React](https://nerdordie.com/product/react-stream-pack/) | Energetic motion, dynamic event text, reactive widgets, matching transitions and synchronized transition sound. | Give the headline a visible sequence and a recurring accent instead of only a slow opacity or position breath. |
| [Amused](https://nerdordie.com/product/amused-stream-pack/) | Rounded forms, flowing ribbons, playful micro-motion, and readable countdown/text elements. | Use smooth motion and a little personality without making forest scenes look like a software window. |

These are package-specific examples, not evidence that every streamer uses a particular motion treatment. Their pages do not establish a universal loop length or prescribe the proposed timing below.

## Recommended direction: moonlit kinetic title

Keep the approved Forest Lounge layout: open headline left, tall glass chat right, clear lower-left widget space, moon at the shared right-side position, and white paws moving right on the ground.

- Use a heavier, larger headline with deliberate line breaks. A short literal status such as “Starting Soon” can be the smaller eyebrow, while wolf-themed language carries the personality.
- Reveal words with a soft vertical mask and short stagger. This should read as a broadcast title rather than a typewriter, terminal, or dialog window.
- Pass a cool moonlit highlight across the title once per cycle. Keep the regular white text readable underneath it.
- Animate a short paw-mark or trail accent beside the status. Restrict motion to the information column so it does not compete with live chat.
- Keep chat content continuously visible. Do not loop fake message entrances into the baked background.
- Do not add traffic-light dots, the domain label, a mascot badge, or more widget outlines.

## Proposed 24-second cycle

All values here are design choices for this project, not measured Nerd or Die timings.

| Time | Motion |
| --- | --- |
| 0–1.4 s | Headline words rise 20–28 px into a mask with a 0.10–0.14 s stagger; fade from invisible to readable. |
| 0.5–1.8 s | Eyebrow and supporting line settle in. A small trail accent draws left to right. |
| 1.8–8 s | Readable hold with forest ambience and a small accent pulse. |
| 8–10 s | One subtle moonlit sheen crosses the headline. |
| 10–20.5 s | Long readable hold; chat and external widgets remain stable. |
| 20.5–22.5 s | Text gently fades and moves behind its mask, using the opposite direction to its reveal. |
| 22.5–24 s | Brief forest-only title region, matching frame zero for a clean repeat. Chat remains present. |

If an empty title interval feels too repetitive in OBS, keep the headline continuously readable and apply the reveal to a rotating supporting phrase instead. Do not replace a persistent scene status with jokes alone.

## Remotion implementation notes

- Use frame-derived interpolation, deterministic word offsets, and explicit duration values. CSS animation and wall-clock time are unsuitable for rendered exports.
- A repeating 24-second scene at 30 fps is 720 frames. Compute all ambient waves using that composition duration, or an integer number of cycles over it.
- Treat frame zero and the final frame as adjacent samples. The title's masked/hidden states must agree, and forest ambience must not reset visibly.
- Verify the boundary around frames 718, 719, 0, and 1 in a contact sheet or video; also review small-screen text readability.
- Keep the stinger's existing audio duration and cut point separate from this standby animation timeline.

## Official demo references

- [Grid full-pack demo](https://nerdordie.com/product/grid-stream-package/): official page links the full-pack video and separate alert/widget clips.
- [Relay official demo](https://nerdordie.com/wp-content/uploads/2026/01/Relay-Stream-Pack-DEMO-1080p-HB.mp4): linked by the official Relay product page.
- [React scene/chat clip](https://nerdordie.com/wp-content/uploads/2023/08/React_Scene_Chatbox.mp4): linked by the official React product page.
- [React transition clip](https://nerdordie.com/wp-content/uploads/2023/09/React_Transition_Video.mp4): useful for sequence rhythm, not a loop template.

Reference research informs the principles above. Recreate the motion in the project's own wolf/forest language; do not copy proprietary templates or artwork.
