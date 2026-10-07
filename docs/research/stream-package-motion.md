# Streaming package motion references

Research date: 2026-10-04. Scope: official package vendors and platform documentation beyond Nerd or Die. These notes inform the Forest Lounge standby scenes; they do not change the implementation.

## Verified observations

- [OWN3D starting screens](https://www.own3d.tv/en/shop/twitch-starting-soon-screen/) treats animated standby screens as part of a channel's visual identity and offers coordinated packages with labels, panels, alerts, and overlays. This supports carrying the same forest, typography, and motion vocabulary through Starting Soon, BRB, and Ending.
- [OWN3D Timeline webcam product](https://www.own3d.tv/en/product/animated-webcam-overlay-timeline/) explicitly offers animated framing. Its [official Timeline package demo](https://www.youtube.com/watch?v=9WtbRayytK0) describes an animated package spanning gameplay, IRL, panels, and banners. The demo's description was accessible; frame-by-frame playback was not verified. No exact reveal duration or animation curve is attributed to it here.
- [Streamlabs themes](https://streamlabs.com/themes) separates scene screens, webcam frames, transitions, and widget styling, while recommending coordinated bundles. This supports keeping the chat region continuously useful while making the headline area more expressive.
- [StreamElements overlay documentation](https://docs.streamelements.com/overlays) describes overlays as the layer carrying alerts, labels, goals, and chat. The baked scene should leave those real OBS/browser-source contents readable and available.

## Recommended treatments

These are original design proposals, not claims about the precise motion used in the products above.

### 1. Moonlit title sequence — best fit

Use a 24-second loop with a deliberate reveal, long readable hold, accent event, and quiet reset. Large confident two-line lettering; a small literal state label above it; one short wolf-themed supporting line below.

| Time | Action |
| --- | --- |
| 0–1.4 s | Headline lines reveal through a soft mask, rising approximately 24 px with a slight stagger. Supporting line follows. |
| 1.4–17 s | Full title remains still and readable. White paws continue along the ground. |
| 17–20 s | One thin cyan moonlight sweep crosses the headline; a small status accent moves along its rule. |
| 20–22.5 s | Hold after the accent. |
| 22.5–24 s | Text settles out through the same mask; the next loop begins from the matching hidden state. |

Keep the forest and chat panel visible throughout. Only the title group resets. Avoid moving individual letters during the long hold. Use the same schedule across all three scenes with different copy.

### 2. Pack broadcast

Use a 20-second loop with a persistent large headline and a small changing message beneath it. The message crossfades between a direct status and one themed welcome. A traveling paw accent moves once across a short rule. This is useful if repeated title entrances feel too theatrical, but less distinctive than treatment 1.

### 3. Trail marker

Use a 30-second loop with a short vertical accent, bold headline, and two-line support text. A soft light pass traces the accent, then reveals the title. A thin atmospheric mist layer travels behind the text, never over chat. This is the most cinematic option, but depends on careful contrast and should avoid adding more visual clutter to the forest.

## Typography direction

Use a confident contemporary sans with a large headline weight and restrained spacing. Proxima Nova is a reasonable visual reference, but use it only with an available licensed font file. A bundled open-source alternative should be selected and checked at actual 1920×1080 output scale. Avoid returning to application-window chrome or adding a website title bar.

## Loop and readability requirements

- Keep chat geometry stationary throughout the loop; real chat must not disappear with the title animation.
- Reveal/hold/exit animation is compatible with looping when the title's final hidden state matches its first hidden state. It must repeat deterministically from the frame number.
- Match the background's start/end state to the longer composition duration; do not simply stretch an existing animation whose helper assumes 240 frames.
- Evaluate frame 0, the peak reveal, the long hold, and the final frame. Check the last-to-first playback seam before shipping.
- Keep literal state labels such as “Starting Soon” available so a themed headline still communicates the scene's purpose.
- Do not add flashing, glitch motion, or constant letter movement. The requested stronger motion can come from staging and one visible accent event.
