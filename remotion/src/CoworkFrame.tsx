import { AbsoluteFill } from "remotion";
import { Background } from "./Background";
import { CamFrame } from "./CamFrame";

// Co-Working overlays: animated `glow` background + baked cam frame(s) only.
// No top bar, no widget boxes — stack your own timer / tasks / chat / now-playing
// OBS sources anywhere in the open space.

// V1 — Solo: one webcam (true 16:9), bottom-left. Rest of the canvas is yours
// for widgets.
export const CoworkSolo: React.FC = () => (
  <AbsoluteFill>
    <Background variant="glow" />
    <CamFrame x={96} y={669} w={560} h={315} />
  </AbsoluteFill>
);

// V2 — Dual: big hero cam (true 16:9, left) + small circular facecam
// (top-right PiP).
export const CoworkDual: React.FC = () => (
  <AbsoluteFill>
    <Background variant="glow" />
    <CamFrame x={88} y={225} w={1120} h={630} />
    <CamFrame x={1400} y={180} w={380} h={380} shape="circle" />
  </AbsoluteFill>
);
