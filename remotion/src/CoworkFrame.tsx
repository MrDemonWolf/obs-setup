import { AbsoluteFill } from "remotion";
import { Background } from "./Background";
import { CamFrame } from "./CamFrame";

// Co-Working overlays: animated `glow` background + baked 16:9 cam frame(s).
// No bar, no widget boxes — the open space in each layout is where your OBS
// widget sources (timer / tasks / chat / now-playing) go. `moon` repositions
// the background moon into clear sky (the default sits inside the cam frames).
type Cam = { x: number; y: number; w: number; h: number };

export const Cowork: React.FC<{ cams: Cam[]; moon?: { x?: number; y?: number; r?: number } }> = ({ cams, moon }) => (
  <AbsoluteFill>
    <Background variant="glow" moon={moon} />
    {cams.map((c, i) => (
      // staggered glow phases — identical phases pulse in lockstep (metronome)
      <CamFrame key={i} {...c} phase={0.4 + i * 0.33} />
    ))}
  </AbsoluteFill>
);

// Both layouts share the same TOP-LEFT pin + margins for a consistent look:
// 64px left, 136 top (clears the moon at y36–180 — the heroes sit left of the
// right-side moon anyway; shared MOON_Y/MOON_R untouched per wolf/Moon.tsx).
// Nudged up from 200 to open a wider band along the BOTTOM for timer/tasks/
// chat widgets. Trade-off: main cam JUMPS size switching Solo↔Dual in OBS
// (used to match); accepted for bigger cams both ways.
// Solo: one hero, top-left pinned. Open right + (wider) bottom bands.
const SOLO_HERO: Cam = { x: 64, y: 136, w: 1400, h: 788 };
// Dual: second cam (576×324) pinned to the RIGHT, nudged up to match the
// hero's lift (x=1920-64-576=1280, y=628 → 92px above its old bottom-corner
// spot). Hero shares the solo top-left pin, shrunk so the second cam clears
// it with a real gap (right edge 1216 → 64px to the second cam).
const DUAL_HERO: Cam = { x: 64, y: 136, w: 1152, h: 648 };
const DUAL_SECOND: Cam = { x: 1280, y: 628, w: 576, h: 324 };
export const COWORK_LAYOUTS: Record<string, Cam[]> = {
  solo: [SOLO_HERO],
  dual: [DUAL_HERO, DUAL_SECOND],
};
