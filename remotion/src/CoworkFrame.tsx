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

// All boxes true 16:9. Layout name = where the open widget space is.
export const COWORK_LAYOUTS: Record<string, Cam[]> = {
  // Solo: one big cam
  soloSpaceBottom: [{ x: 320, y: 72, w: 1280, h: 720 }],
  soloSpaceLeft: [{ x: 576, y: 180, w: 1280, h: 720 }],
  soloSpaceRight: [{ x: 64, y: 180, w: 1280, h: 720 }],
  // Dual: big hero cam + small second cam
  dualSpaceBottom: [
    { x: 96, y: 72, w: 1120, h: 630 },
    { x: 1264, y: 72, w: 560, h: 315 },
  ],
  dualSpaceLeft: [
    { x: 736, y: 64, w: 1120, h: 630 },
    { x: 1296, y: 734, w: 560, h: 315 },
  ],
  dualSpaceRight: [
    { x: 64, y: 64, w: 1120, h: 630 },
    { x: 64, y: 734, w: 560, h: 315 },
  ],
};
