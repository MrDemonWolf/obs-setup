# UI/UX Review: MrDemonWolf OBS Stream Overlays (12 Remotion scenes)

**Reviewed:** 2026-07-05 · **Input:** rendered 1080p stills (all 12 comps, post-`87c984e`) + full source code in `remotion/src/` · **Method:** NN/g heuristic evaluation + guideline review, adapted for stream-overlay context (viewer glanceability over video, not web usability), executed as a 34-agent multi-lens review (5 lenses → adversarial verification of every finding)

**Review scope notes.** These are looping video overlays for OBS, so web-only checks (keyboard focus, alt text, forms) were excluded by design. Hard constraints honored by every finding: the seamless-loop invariant (no entrance animations), brand fonts locked to Montserrat + Open Sans (mrdemonwolf.com), and `backdrop-filter` banned for render cost. 28 raw findings were adversarially verified against source + stills; 6 were refuted and discarded; 22 survived and are merged below into 19 (three pairs were the same issue found by two lenses).

## Executive summary

- Overall: a genuinely distinctive, disciplined system — the macOS-browser-window concept with wolf-pun copy is memorable, the loop engineering is strong (seeded LCG schedules, edge-faded particle wraps, sine-family easing), and text contrast *on the card scenes* measures comfortably above AA.
- **The single worst problem:** the decorative moon collides with the cam frames on 3 of 4 frame scenes — on CoworkingDual it sits entirely *inside* the hero cam, so the live webcam hides it and on the other two the live feed clips it into a half-moon riding the frame border for the whole stream (finding #1).
- A cluster of **worst-case legibility failures on the transparent overlays**: Countdown/LoadingBarks still use the thin 66% glass that Socials already rejected in-code — secondary text drops to ~2.9–3.4:1 over bright gameplay (findings #7, #12).
- Two **correctness bugs**: the countdown freezes at 00:01 forever (never shows 00:00), and LoadingBarks technically breaks the project's own seamless-loop invariant at the seam (findings #8, #10).
- Zero catastrophic (severity 4) findings — nothing blocks shipping; this is a polish pass, not a rescue.

**Findings:** 🟥 0 catastrophic · 🟧 1 major · 🟨 11 minor · ⬜ 7 cosmetic

## Findings

### 🟧 Severity 3 — Major

#### 1. Moon collides with the cam frames on 3 of 4 frame scenes
- **What:** `Background.tsx:53` renders `<Moon />` with hardcoded defaults (center 300,200, r=92, breathing to r≈99, halo to r≈258; body spans x≈208–392, y≈108–292). That intersects: **JustChatting** cam (x 64–1280, y 198–882) — the frame's top border slices horizontally through the moon's center; **CoworkingSolo** cam (x 320–1600, y 72–792) — the left border slices vertically through it; **CoworkingDual** hero (x 64–1216, y 72–720) — the moon sits fully *inside* the frame. These scenes render to opaque H.264 and the live webcam stacks on top in OBS: the in-frame part of the moon disappears behind the feed, leaving a visibly clipped half-moon riding the border line for the entire stream (Dual: the background's only focal element is entirely hidden).
- **Where:** `src/Background.tsx:53`; geometry from `src/wolf/Moon.tsx` defaults vs `src/JustChattingScene.tsx:15`, `src/CoworkFrame.tsx:25,30`
- **Guideline:** Visual-design principles (balance, hierarchy, Gestalt) — decorative elements must not intersect content zones; an accidentally-cropped focal graphic reads as a bug. *Severity 3 justification: visible on every frame of three high-use scenes, for the full stream duration.*
- **Evidence:** [5 Principles of Visual Design in UX](https://www.nngroup.com/articles/principles-visual-design/) — elements must be deliberately organized so the eye attends to them in the intended order; unplanned intersections break that organization.
- **Fix:**
  - [ ] Add optional `moon?: {x, y, r}` prop to `Background` and forward it to `Moon` (Moon already accepts x/y/r).
  - [ ] Per-scene safe positions: CoworkingSolo — left gutter, x=180 y=200 r=88 (fits the 320px gutter). CoworkingDual — top-right pocket x=1568 y=140 r=60, or `showMoon={false}`. JustChatting — top band is only 198px tall; use r=68 y=100, or drop the moon.
  - [ ] Re-render stills for the three scenes and re-check clearance including the ~32px glow.

### 🟨 Severity 2 — Minor

#### 2. Ember wind-down mood on EndingStream is imperceptible — all three cards read as the same scene
- **What:** EndingStream registers `mood:'ember'` (`scenes.ts:36`), but the entire ember treatment is 22 warm embers vs 16 cerulean ones plus a floor wash at 6% alpha over 30% of frame height (`Background.tsx:64-66`). Both aurora ribbons stay cool (rgba(0,172,237,0.26) / rgba(107,139,245,0.18), `Background.tsx:54-55`). Rendered, EndingStream is visually indistinguishable from BRB (same moon, same cool grade, same closed-mouth mascot); scene identity rests 100% on reading the 108px title. `hero` and `calm` also both map to the identical `night` variant (`Scene.tsx:20`), so the mood system is effectively a one-value enum.
- **Where:** `src/Background.tsx:54-66`, `src/Scene.tsx:20`, `src/scenes.ts:36`
- **Guideline:** Recognition rather than recall / glanceability — distinct system states must be visibly different without reading.
- **Evidence:** [Memory Recognition and Recall in User Interfaces](https://www.nngroup.com/articles/recognition-and-recall/) — promote recognition over recall: interface state should be recognizable at a glance instead of requiring users to read and interpret.
- **Fix:**
  - [ ] Raise the ember floor wash to `rgba(224,140,61,0.12)`, transparent at 45%.
  - [ ] On `variant === 'ember'`: swap aurora "b" to a warm ribbon (`224,140,61` @ 0.16) and drop aurora "a" alpha to 0.18.
  - [ ] Bump ember count to ~30 with slightly larger radius. (All static per-variant constants — loop invariant untouched.)

#### 3. The "macOS-glass" chip renders as a flat opaque card, not glass
- **What:** Chip fill is one flat color at 90% opacity — `rgba(20,38,88,0.90)` (`TitleChip.tsx`) — with only a 1px inset highlight at 10% white. With `backdrop-filter` banned (render cost) and the fill near-opaque, no glass cue remains: no gradient, no sheen, no light-from-above. The stills confirm a flat navy rounded rectangle with a hairline border — generic "dark card UI", while the code comment promises "Frosted macOS-glass panel". (The opacity bump itself was deliberate — fixed-width box legibility — and is not the problem.)
- **Where:** `src/TitleChip.tsx:44-46`
- **Guideline:** Design-intent fidelity — a stated material metaphor should be perceptible; glass reads as glass through translucency + depth cues.
- **Evidence:** [Glassmorphism: Definition and Best Practices](https://www.nngroup.com/articles/glassmorphism/) — the frosted-glass effect depends on visible translucency/blur creating depth between foreground and background; without those cues the material metaphor disappears.
- **Fix:**
  - [ ] Fill: `linear-gradient(180deg, rgba(32,54,116,0.92) 0%, rgba(16,29,70,0.90) 100%)`.
  - [ ] Bevel: `inset 0 1.5px 0 rgba(255,255,255,0.22)`.
  - [ ] Add a static diagonal sheen overlay: `linear-gradient(115deg, rgba(255,255,255,0.05) 0%, transparent 40%)`. (All static — zero loop/perf impact.)

#### 4. Traffic-light dots are off-macOS colors, and the green doubles as the status "live" dot
- **What:** Window dots use theme.red `#E0533D`, amber `#E6B34B`, green `#3ED598` — real macOS traffic lights are `#FF5F57 / #FEBC2E / #28C840`. The rendered red reads brick, the green reads mint, so the one element whose whole job is instant macOS recognition looks imitation. Worse: the same `#3ED598` reappears 180px below as the pulsing 13px status LED — two green dots of near-identical size (15px vs 13px) in one panel carrying different semantics.
- **Where:** `src/TitleChip.tsx:51-53, :85`; `src/theme.ts:11-13`
- **Guideline:** Match between system and the real world (borrowed UI chrome must match its referent) + consistency (one color = one meaning).
- **Evidence:** [Match Between the System and the Real World (Usability Heuristic #2)](https://www.nngroup.com/articles/match-system-real-world/) — familiar real-world conventions should be reproduced faithfully so recognition works.
- **Fix:**
  - [ ] Chip-local constants for the three dots: `#FF5F57 / #FEBC2E / #28C840` (leave `theme.red/amber/green` alone — mascot and other uses).
  - [ ] Recolor the status LED to `theme.blueBright #38C6F5` so "live LED" and "window control" never share a color.

#### 5. Fixed 1160px chip leaves ~340px of dead space after short titles (worst on BRB)
- **What:** `CHIP_WIDTH = 1160` is sized to "The Pack Gathers"; inner width after padding is 1032px. "Off Hunting" measures ~700px at 108px Montserrat 800, leaving ~330–340px of empty 90%-opaque navy inside the box (title ends near x=820, content box runs to x=1161). "Until Next Howl" leaves ~110px. The fixed width is the agreed design (cross-scene size consistency) — but nothing occupies the reserved right zone, so on short titles it reads as error rather than intent.
- **Where:** `src/TitleChip.tsx:9` (CHIP_WIDTH), `src/scenes.ts:30`
- **Guideline:** Visual hierarchy — bounded empty regions inside a card attract attention and read as unintentional.
- **Evidence:** [Visual Hierarchy in UX: Definition](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/) — contrast and scale steer where the eye lands; a large empty high-contrast slab inside a focal card competes for that attention.
- **Fix:**
  - [ ] Anchor a small quiet element top-right of the chip: a ~40px paw glyph at 25% opacity, or a static `twitch.tv/mrdemonwolf` tag mirroring the left URL on the traffic-light row. Static, loop-safe, closes the rectangle at every title length.

#### 6. CoworkingDual second cam floats mid-column: two 162px unusable pockets, no shared baseline
- **What:** The 576×324 second cam is vertically centered against the hero (y=234, spans 234–558), carving the right column into two 162px-tall leftovers (y 72–234, y 558–720) — too short for chat/tasks/now-playing — and the two cams share no edge (hero bottom 720 vs second bottom 558).
- **Where:** `src/CoworkFrame.tsx:31`
- **Guideline:** Alignment & proximity (Gestalt) — related frames should share edges; leftover slivers signal unplanned space.
- **Evidence:** [Proximity Principle in Visual Design](https://www.nngroup.com/articles/gestalt-proximity/) — spatial relationships communicate grouping; misaligned siblings read as unrelated or accidental.
- **Fix:**
  - [ ] Bottom-align the second cam: `y: 396` (bottom = 720, shared baseline with the hero) so all open space merges into one clean band below y≈752. (Alternative: top-align at y:72 for one 324px right-column widget zone.)

#### 7. Transparent overlays still use the thin 66% glass that Socials already rejected — secondary text fails worst-case contrast *(merged: found independently by two lenses)*
- **What:** Countdown and LoadingBarks back their cards with `theme.glassFill rgba(9,21,51,0.66)`. Composited over bright gameplay (worst case ≈ white), the panel resolves to ~`#5D6478`. Measured: LoadingBarks % readout `#38C6F5` at 34px = **2.94:1** (fails the 3:1 large-text floor); Countdown "HOWLING IN" label `rgba(255,255,255,0.62)` at 34px = **3.35:1**, and at Twitch small-player scale (~1/3 size ⇒ ~11px effective) it's small text needing 4.5:1 — fails. The repo already solved this exact problem once: `Socials.tsx:70` uses `rgba(9,21,51,0.84)` with the in-code comment "denser than glassFill: contrast over gameplay".
- **Where:** `src/Countdown.tsx:32,37`; `src/LoadingBarks.tsx:83,140`; `theme.ts:15`
- **Guideline:** Text over dynamic video must be judged at worst-case background; internal consistency (the project's own gameplay-contrast rule applied to 1 of 3 transparent comps).
- **Evidence:** [Ensure High Contrast for Text Over Images](https://www.nngroup.com/articles/text-over-images/) — text over imagery needs a scrim/overlay dense enough that contrast holds across ALL possible backgrounds; WCAG 1.4.3 sets the 4.5:1 / 3:1 floors.
- **Fix:**
  - [ ] Add `theme.glassDense = "rgba(9,21,51,0.84)"`; use it in Countdown, LoadingBarks, and Socials (replacing the local literal).
  - [ ] Verified result over white: textDim label 5.43:1, blueBright % 5.65:1, white digits 11.24:1 — all pass with margin.
  - [ ] Optional: lift the Countdown label to `rgba(255,255,255,0.75)` for small-player margin.

#### 8. Countdown never reaches 00:00 — freezes at "00:01"
- **What:** Registered duration is `from * fps` = 300×60 = 18000 frames, but frames run 0..17999, so the last frame computes `rem = 300 - floor(17999/60) = 1`. The comp (and the OBS media source set to play-once-and-hold) freezes on **00:01** forever; 00:00 never displays. Verified numerically.
- **Where:** `src/Countdown.tsx:17` + `src/scenes.ts:42`
- **Guideline:** Visibility of system status — feedback must be truthful; a countdown holding at 1 second at the go-live moment shows a wrong state indefinitely.
- **Evidence:** [Visibility of System Status (Usability Heuristic #1)](https://www.nngroup.com/articles/visibility-system-status/) — the system should always show accurate, current state.
- **Fix:**
  - [ ] Register `durationInFrames: (from + 1) * 60 = 18060` so the final held frame shows 00:00 (`rem = max(0, 300 - floor(18059/60)) = 0`).
  - [ ] Update the Countdown comment promising "counts to 0 then holds".

#### 9. LoadingBarks phrase swap pops: 0.23s text fade + one-frame 700px bar/paw teleport
- **What:** `fade = min(14, hold/4)` is always 14 frames = **0.233s at 60fps** — authored for 30fps (14f@30 = 0.47s) and never rescaled. Worse, the fade opacity applies only to the phrase `<span>`; the 700px fill bar and the white edge-riding paw are fully visible when they snap from 100% back to 0 in a single frame at every phrase swap.
- **Where:** `src/LoadingBarks.tsx:62-63` (fade math), `:115-130` (bar+paw uncovered)
- **Guideline:** Animation should smooth state changes, not draw attention with abrupt cuts; ~200–500ms minimum for element swaps.
- **Evidence:** [Animation for Attention and Comprehension](https://www.nngroup.com/articles/animation-usability/) — peripheral motion triggers a stimulus-driven, involuntary attention shift; abrupt state changes read as glitches.
- **Fix:**
  - [ ] `fade = Math.min(Math.round(0.45 * FPS), hold / 4)` (=27f ≈ 0.45s at 60fps).
  - [ ] Move `opacity: op` from the text span to the card's inner content wrapper (text + bar row) so the 100%→0% reset happens while invisible. `op` is already 0 at both slot edges → loop seam stays invisible.

#### 10. `loopSin` hardcodes the 30fps 240-frame period — 60fps comps pulse at double speed, and LoadingBarks breaks the loop seam *(merged: general defect + its seam instance)*
- **What:** `loopSin`/`loopBreathe` divide by `VIDEO.durationInFrames = 240` (`theme.ts:30-31`). In the two `fps:60` comps that period is 4s, not the 8s every 30fps scene breathes at: the Countdown/LoadingBarks glow cycles twice as fast as TitleChip's, and Countdown's PawLoader wave sweeps in 2s vs 4s. For LoadingBarks — which **is** looped in OBS — `13572 % 240 = 132`: the glow is 55% through a cycle at the seam (19.1px blur → 18.0px with reversed velocity). Measured, and the only seam pop in the whole project — a technical violation of the project's own invariant.
- **Where:** `src/theme.ts:30-31`, `src/LoadingBarks.tsx:68`, `src/Countdown.tsx:20`
- **Guideline:** Consistency (one perceived "gentle breathe" rate everywhere) + the project's seamless-loop invariant.
- **Evidence:** [Consistency and Standards (Usability Heuristic #4)](https://www.nngroup.com/articles/consistency-and-standards/) — identical motifs should behave identically; and [Animation for Attention and Comprehension](https://www.nngroup.com/articles/animation-usability/) — an unexpected seam pop is exactly the kind of peripheral motion that hijacks attention.
- **Fix:**
  - [ ] LoadingBarks: integer-harmonic glow over the true comp length — `H = Math.round(LOADING_BARKS_DURATION / (8 * FPS)) = 28` → `sin(2π(H·f/LOADING_BARKS_DURATION + 0.5))` = 8.08s period, exact seam.
  - [ ] Countdown (non-looping): local sin over `8 * fps = 480` frames; make PawLoader's wave fps-aware (halve harmonic at 60fps).

#### 11. Moon body throbs ±8% (16% peak-to-peak, ~30px diameter swing)
- **What:** `grow = 1 + 0.08 * loopSin(f, 0.4)` applies to the solid moon **body** group, not just the halo. At r=92 the disc swells 169→199px every 8s — the one element viewers expect to be perfectly still visibly pulses on all nine background-bearing scenes. Halo breathing is right; body scaling fights the calm-celestial read.
- **Where:** `src/wolf/Moon.tsx:10, :37`
- **Guideline:** Purposeful animation — decorative motion on a static-by-nature object draws the eye without communicating anything.
- **Evidence:** [Animation for Attention and Comprehension](https://www.nngroup.com/articles/animation-usability/) — peripheral motion demands attention involuntarily; attention spent on a decorative moon is taken from the content.
- **Fix:**
  - [ ] Keep `grow` on the halo circle; body `<g>` gets translate only — or cap body scale at `1 + 0.015 * loopSin(f, 0.4)`.

#### 12. LoadingBarks progress track is nearly invisible against its own card (1.32:1)
- **What:** The 700×20px track is `rgba(255,255,255,0.09)` with a `rgba(255,255,255,0.16)` border. Composited, the track measures **1.32:1** and its border **1.63:1** against the card — far below the 3:1 non-text minimum. When a phrase starts and the fill resets to ~0%, viewers see a bar with no visible denominator: no way to tell how much remains.
- **Where:** `src/LoadingBarks.tsx:110-111`
- **Guideline:** WCAG 1.4.11 non-text contrast (3:1 for meaningful UI components); a progress indicator must show position *and* extent.
- **Evidence:** WCAG 2.1 SC 1.4.11 (Non-text Contrast) — visual information required to identify UI components needs ≥3:1 against adjacent colors.
- **Fix:**
  - [ ] Track background → `rgba(255,255,255,0.16)`; track border → `rgba(255,255,255,0.36)` (~3.2:1 over the 0.84 backing). Fill gradient unchanged. Static change only.

### ⬜ Severity 1 — Cosmetic

#### 13. Status row stacks three competing signifiers on one 36px line
- **What:** One short line carries a pulsing green LED, bright-cerulean text, AND a white blinking block cursor — two different metaphors (status indicator vs terminal prompt) bracketing seven words; the cursor is the row's only pure-white element so it outweighs the text it trails.
- **Where:** `src/TitleChip.tsx:74-88`
- **Guideline / Evidence:** [Aesthetic and Minimalist Design](https://www.nngroup.com/articles/aesthetic-minimalist-design/) — every extra signifier competes with the relevant ones.
- **Fix:**
  - [ ] Keep the cursor (pairs with the window/terminal concept), drop the LED — or move the LED up beside `mrdemonwolf.com`.
  - [ ] If the cursor stays, tint it `theme.blueBright` so it reads as part of the prompt line, not a third accent.

#### 14. Positive +1px tracking on the 108px extrabold title reads loose
- **What:** Montserrat 800 at 108px with `letterSpacing: 1`. Display-size extrabold conventionally takes neutral-to-negative tracking (≈ −1 to −2px here); the positive pixel reads airy against the tight premium look and adds ~15px of width to the tight 1032px content box.
- **Where:** `src/TitleChip.tsx:67`
- **Guideline / Evidence:** Reviewer judgment — no NN/g citation. (The NN/g [Typography Terms glossary](https://www.nngroup.com/articles/typography-terms-ux/) defines tracking but does not prescribe display-size tightening; the tighten-at-display-size convention is standard type-setting practice, not an NN/g guideline.)
- **Fix:**
  - [ ] `letterSpacing: -1.5` on the 108px title (keep +1.5 on the 24px tag). Re-check "The Pack Gathers" width after (it only narrows).

#### 15. Socials badge sits visibly empty ~1s at every handle swap *(merged: found independently by two lenses)*
- **What:** The glass card is always opaque, but content opacity hits 0 at local 0.96 and the next handle fades in over the first 8% of its slot — measured 0.8–1.1s of fully blank dark pill over gameplay every ~15–30s, plus a slow ~2s fade-in. Only the loop seam actually needs true zero.
- **Where:** `src/Socials.tsx:48` (interpolate stops), `:70`
- **Guideline / Evidence:** [Aesthetic and Minimalist Design](https://www.nngroup.com/articles/aesthetic-minimalist-design/) — persistent chrome should never be visibly contentless.
- **Fix:**
  - [ ] Tighten stops to `[0, 0.03, 0.97, 1]` (fade-in ≈0.6–0.8s, blank ≈0) — 0 still lands exactly on the seam. (Or true crossfade: render `items[idx]` + `items[(idx+1)%n]` with complementary opacities.)

#### 16. TitleChip out-breathes the living mascot
- **What:** `1 + 0.014 * loopBreathe(frame)` on a 1160px box moves the right edge ~16px per 8s breath — 1.75× the mascot's breathe amplitude (0.008). The inanimate panel visibly breathes harder than the wolf, and one breath per 8s is half natural respiration rate, reading as slow zoom rather than breathing.
- **Where:** `src/TitleChip.tsx:23`
- **Guideline / Evidence:** motion-craft: idle motion subordinate to the character; [Animation for Attention and Comprehension](https://www.nngroup.com/articles/animation-usability/) — ambient motion must stay below the involuntary-attention threshold.
- **Fix:**
  - [ ] Amp → 0.006–0.008 and `loopBreathe(frame, 2)` (two 4s breaths per loop, matching the mascot cadence). Rest-at-frame-0 seam preserved.

#### 17. All CamFrame glows pulse in exact lockstep
- **What:** `CamFrame` hardcodes `loopSin(f, 0.4)`, so both CoworkingDual frames (and JustChatting's cam + chat) brighten/dim in perfect sync — mechanical, screensaver-like.
- **Where:** `src/CamFrame.tsx:15`, `src/CoworkFrame.tsx:13`
- **Guideline / Evidence:** Reviewer judgment (motion-craft, no NN/g citation): decorrelate identical idle animations on siblings to avoid the metronome effect.
- **Fix:**
  - [ ] Add `phase` prop to CamFrame (default 0.4); pass `0.4 + i * 0.33` per cam in Cowork/JustChatting. Phase offsets are loop-safe by construction.

#### 18. Starfield "twinkle" is a uniform 8-second breath
- **What:** All 55 stars pulse opacity 0.22–0.72 on the same 8s period, differing only in phase — reads as slow breathing, not twinkling; the effect is near-invisible as "twinkle".
- **Where:** `src/wolf/Starfield.tsx:21`
- **Guideline / Evidence:** Reviewer judgment (motion-craft, no NN/g citation): if ambience is worth its render cost it should read as the thing it depicts.
- **Fix:**
  - [ ] Seeded integer harmonic 2–4 per star: `harmonic = 2 + floor(rnd() * 3)` at module load; `loopSin(f, st.phase, st.harmonic)`. Integer harmonics keep the seam exact.

#### 19. Ad-hoc 34px/36px near-duplicate in the type scale
- **What:** Measured scale: 24/34/36/60/108/168. The 34 and 36 serve the identical role (secondary status/metadata line): TitleChip status = 36px; Countdown label + LoadingBarks % = 34px. A 2px delta between same-role text in a matched family is not a hierarchy step.
- **Where:** `src/Countdown.tsx:37`, `src/LoadingBarks.tsx:136` (34px) vs `src/TitleChip.tsx:81` (36px)
- **Guideline / Evidence:** [Consistency and Standards](https://www.nngroup.com/articles/consistency-and-standards/) — a small set of intentional sizes, one per role.
- **Fix:**
  - [ ] Collapse 34 → 36 everywhere → 5-step scale 24/36/60/108/168.
  - [ ] Optional: lift sizes into `theme.ts` as named tokens (`type: { tag: 24, status: 36, … }`).

## Refuted findings (checked and dismissed — for the record)

1. **"Lower-left quadrant of cards is dead space"** — geometrically wrong; the chip spans into it and the composition balances.
2. **"CoworkingSolo abandons the 64px grid"** — measurements right, but centering the solo cam is the deliberate design.
3. **"JustChatting anchors y=198 vs Cowork y=72"** — symmetric-band vs top-band are intentionally different layouts.
4. **"Countdown holds frozen 00:00"** — it never renders 00:00 at all (superseded by confirmed finding #8, the sharper version).
5. **"Mascot shadow physics inverted"** — the shadow math is a stylized hover, consistent within its own rules.
6. **"168px digits in the body face is a type crime"** — deliberate brand choice; Open Sans 700 holds up at display size with tabular-nums.

## Unverified (needs different input)

- **Actual OBS playback smoothness** of the 60fps HEVC-alpha files on the base-M1 Mac Mini rig — needs the real rig, not stills.
- **Perceived motion quality** (breathe/bob/pulse rates) — verified mathematically from code; final feel needs the live previewer or rendered video, not stills.
- **Twitch small-player legibility** — contrast is computed; a real 360p-viewport spot-check after re-render is cheap insurance.

## What's working well

- **The concept is genuinely distinctive** — a macOS browser window whose "URL" is mrdemonwolf.com, wolf-pun copy in one consistent lowercase voice ("howling soon…", "brb · back on the trail", "thanks for running with the pack"), mascot pinned to one spot across every card so OBS scene switches never make the wolf jump.
- **Loop engineering is professional-grade:** seeded LCG schedules built once at module load, particle wraps hidden with edge fades, sine-family motion with zero velocity at extremes (inherently eased), content faded to exact 0 at slot boundaries.
- **Card-scene text contrast measures excellent:** title ~13.1:1, status ~6.6:1, tag ~5.8:1 — all comfortably above AA; countdown digits + barks carry text shadows as worst-case insurance.
- **Reflow-proofed numerics everywhere:** tabular-nums + fixed-width boxes on MM:SS and the loading % — nothing jitters as digits change.
- **Smart restraint on content scenes:** the `glow` background drops starfield/embers behind JustChatting/Streaming/Cowork so particles never churn behind a webcam; Streaming/Background stay chrome-free canvases.
- **CoworkingDual grid arithmetic is exact:** 64+1152+64+576+64 = 1920, both cams true 16:9 — OBS sources snap in with zero letterboxing.

## Quick wins (under an hour, highest impact first)

- [ ] **#7** — `glassDense 0.84` token → Countdown + LoadingBarks + Socials (3-line change, fixes the worst legibility failure).
- [ ] **#8** — Countdown duration `(from+1)*60` (1-line, fixes a truthfulness bug).
- [ ] **#12** — LoadingBarks track 0.16/0.36 (2 values).
- [ ] **#4** — true macOS traffic-light hexes + cerulean status LED (4 values).
- [ ] **#19** — 34→36px (2 values).
- [ ] **#11** — moon body scale off / halo-only (1 line).
- [ ] **#6** — CoworkingDual second cam `y: 396` (1 value).

---

# Implementation plan

Phased so each phase is independently commit-able and verifiable with stills; heavy re-renders happen once, at the end.

## Phase 1 — Correctness + legibility (the "must" set)
1. `theme.ts`: add `glassDense: "rgba(9,21,51,0.84)"`; use in Countdown, LoadingBarks, Socials (#7).
2. Countdown `durationInFrames: (from+1)*fps` (#8) + fps-aware glow/paw wave (#10).
3. LoadingBarks: integer-harmonic glow (H=28) (#10), fade 0.45s + opacity on content wrapper (#9), track contrast 0.16/0.36 (#12).
4. Type scale: 34 → 36 (#19).

## Phase 2 — Scene identity + composition
5. `Background`: `moon` position prop; per-scene placements (Solo x=180 y=200 r=88; Dual x=1568 y=140 r=60; JustChatting r=68 y=100 or off) (#1).
6. Ember variant that actually reads warm (floor wash 0.12/45%, warm aurora "b", ~30 embers) (#2).
7. CoworkingDual second cam bottom-aligned `y: 396` (#6).

## Phase 3 — Card polish
8. Chip glass: gradient fill + stronger bevel + static sheen (#3).
9. True macOS traffic lights (chip-local) + cerulean status LED (#4).
10. Status row: drop LED or move next to URL; cursor → blueBright (#13).
11. Title tracking −1.5 (#14); re-check "The Pack Gathers" vs CHIP_WIDTH.
12. Chip right-zone anchor (paw glyph or twitch tag) (#5).
13. Chip breathe: amp 0.006–0.008, harmonic 2 (#16).

## Phase 4 — Motion craft
14. CamFrame `phase` prop, staggered per cam (#17).
15. Starfield seeded harmonics 2–4 (#18).
16. Socials fade stops `[0, 0.03, 0.97, 1]` (#15).

## Phase 5 — Verify + ship
17. `npm run lint` + still-render every touched scene; visually diff against this review's stills.
18. `npm run render:all`; render Countdown + LoadingBarks ProRes masters; `./to-hevc.sh` both.
19. Copy deliverables to the Google Drive `Overlays` folder; OBS spot-check transparency + smoothness on the rig.

*Every fix above preserves the seamless-loop invariant (static values, phase offsets, or integer harmonics only) and the locked brand fonts.*
