import { AbsoluteFill } from "remotion";
import { Background } from "./Background";
import { CamFrame } from "./CamFrame";

// Co-Working overlays: animated `glow` background + baked 16:9 cam frame(s).
// No bar, no widget boxes — the open space in each layout is where your OBS
// widget sources (timer / tasks / chat / now-playing) go.
type Cam = { x: number; y: number; w: number; h: number };

export const Cowork: React.FC<{ cams: Cam[] }> = ({ cams }) => (
  <AbsoluteFill>
    <Background variant="glow" />
    {cams.map((c, i) => (
      <CamFrame key={i} {...c} />
    ))}
  </AbsoluteFill>
);

// All boxes true 16:9.
export const COWORK_LAYOUTS: Record<string, Cam[]> = {
  // Solo: one big 1440×810 cam on the left, open widget space on the right.
  solo: [{ x: 64, y: 135, w: 1440, h: 810 }],
  // Dual: big hero cam + small second cam, open widget space at the bottom.
  // 64px outer margins (symmetric, matching Solo + JustChatting); gap = 112.
  dual: [
    { x: 64, y: 72, w: 1120, h: 630 },
    { x: 1296, y: 72, w: 560, h: 315 },
  ],
};
