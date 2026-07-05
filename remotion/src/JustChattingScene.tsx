import { AbsoluteFill } from "remotion";
import { Background } from "./Background";
import { CamFrame } from "./CamFrame";
import { theme } from "./theme";

// Clean layout for embedding: a true-16:9 webcam frame + a tall chat frame,
// both the transparent CamFrame look (matches Co-Working). Glow background so
// starfield/embers don't churn behind your cam + chat. Drop your real cam and
// chat sources inside the two frames.
// VTuber mode (`hideCam`) drops the cam frame — the model goes full-screen —
// but keeps the tall chat frame on the right.
export const JustChattingScene: React.FC<{ hideCam?: boolean }> = ({ hideCam }) => (
  <AbsoluteFill style={{ backgroundColor: theme.navyDeep }}>
    {/* moon shrunk into the 198px top band — the default (300,200,r92) sat
        half-inside the cam frame, so the live feed clipped it at the border */}
    <Background variant="glow" moon={{ x: 300, y: 100, r: 68 }} />
    {/* staggered glow phases so cam + chat don't pulse in lockstep */}
    {!hideCam && <CamFrame x={64} y={198} w={1216} h={684} phase={0.4} />}
    <CamFrame x={1344} y={198} w={512} h={684} phase={0.73} />
  </AbsoluteFill>
);
