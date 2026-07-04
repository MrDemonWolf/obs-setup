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
    <Background variant="glow" />
    {!hideCam && <CamFrame x={64} y={198} w={1216} h={684} />}
    <CamFrame x={1344} y={198} w={512} h={684} />
  </AbsoluteFill>
);
