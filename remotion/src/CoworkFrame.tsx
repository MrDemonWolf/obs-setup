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

// All boxes true 16:9. Solo + Dual share ONE hero footprint: the primary cam is
// the SAME 1152×648 box at x=64,y=72 in BOTH layouts, so switching Solo↔Dual in
// OBS never makes the main cam jump — Dual just adds a smaller second cam in the
// right pocket. Open widget band below for timer / tasks / chat / now-playing.
const HERO: Cam = { x: 64, y: 40, w: 1152, h: 648 }; // pinned up top; bottom 688
export const COWORK_LAYOUTS: Record<string, Cam[]> = {
  // Solo: just the hero cam. Open L-shaped band (right column + full-width below).
  solo: [HERO],
  // Dual: hero top-left + smaller 576×324 second pinned to the BOTTOM-RIGHT
  // corner (64px right + bottom margins: x=1920-64-576=1280, y=1080-64-324=692).
  // Same 16:9 size, just diagonally opposite the hero — opens a big L-shaped
  // widget band (below the hero + left of the small cam). Moon sits in the now-
  // clear top-right sky.
  dual: [HERO, { x: 1280, y: 692, w: 576, h: 324 }],
};
