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
const HERO: Cam = { x: 64, y: 72, w: 1152, h: 648 }; // bottom 720
export const COWORK_LAYOUTS: Record<string, Cam[]> = {
  // Solo: just the hero cam. Open L-shaped band (right column + full-width below).
  solo: [HERO],
  // Dual: hero + smaller 576×324 second (both true 16:9), 64px outer margins +
  // 64px gap (64+1152+64+576+64 = 1920). Second is BOTTOM-aligned with the hero
  // (y = 72+648-324 = 396 → both bottoms at 720): a shared baseline merges all the
  // open space into one clean full-width band below, instead of splitting the
  // right column into two 162px pockets too short for widgets.
  dual: [HERO, { x: 1280, y: 396, w: 576, h: 324 }],
};
