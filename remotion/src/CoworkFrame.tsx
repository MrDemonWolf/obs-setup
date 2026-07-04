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

// All boxes true 16:9. Solo + Dual share the SAME layout: cam(s) anchored across
// the top (y=72), open widget band below for timer / tasks / chat / now-playing.
// Solo = one bigger cam; Dual = two side-by-side. Both span x 64..1856.
export const COWORK_LAYOUTS: Record<string, Cam[]> = {
  // Solo: one big 1280×720 cam centered up top. x = (1920-1280)/2 = 320.
  // Bottom edge 792 → ~288px open band below.
  solo: [{ x: 320, y: 72, w: 1280, h: 720 }],
  // Dual: two 864×486 cams side by side up top (64px outer margins, 64px gap).
  // Bottom edge 558 → ~520px open band below. Right cam x = 64+864+64 = 992.
  dual: [
    { x: 64, y: 72, w: 864, h: 486 },
    { x: 992, y: 72, w: 864, h: 486 },
  ],
};
