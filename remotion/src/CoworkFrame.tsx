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

// All boxes true 16:9. Solo + Dual share the SAME top-anchored idea: cam(s) up
// top (y=72), open widget band below for timer / tasks / chat / now-playing.
// Solo = one bigger cam; Dual = one HERO + one smaller second. Span x 64..1856.
export const COWORK_LAYOUTS: Record<string, Cam[]> = {
  // Solo: one big 1280×720 cam centered up top. x = (1920-1280)/2 = 320.
  // Bottom edge 792 → ~288px open band below.
  solo: [{ x: 320, y: 72, w: 1280, h: 720 }],
  // Dual: big HERO 1152×648 left + smaller 576×324 second (both true 16:9), 64px
  // outer margins + 64px gap (64+1152+64+576+64 = 1920). Hero bottom 720 → open
  // band below. Second is vertically centered against the hero (y = 72+(648-324)/2).
  dual: [
    { x: 64, y: 72, w: 1152, h: 648 },
    { x: 1280, y: 234, w: 576, h: 324 },
  ],
};
