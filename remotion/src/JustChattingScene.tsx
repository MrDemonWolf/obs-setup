import { AbsoluteFill } from "remotion";
import { CabinBackground } from "./CabinBackground";
import { CamFrame } from "./CamFrame";
import { theme } from "./theme";

// Clean layout for embedding: a true-16:9 webcam frame + a tall chat frame,
// both the transparent CamFrame look (matches Co-Working). Forest background so
// ember particles don't churn behind your cam + chat. Drop your real cam and
// chat sources inside the two frames.
// VTuber mode (`hideCam`) drops the cam frame — the model goes full-screen —
// but keeps the tall chat frame on the right.
export const JustChattingScene: React.FC<{ hideCam?: boolean }> = ({ hideCam }) => (
  <AbsoluteFill style={{ backgroundColor: theme.navyDeep }}>
    {/* The shared cabin plate leaves an open seated-model area by the window. */}
    <CabinBackground />
    {/* staggered glow phases so cam + chat don't pulse in lockstep */}
    {!hideCam && <CamFrame x={96} y={190} w={1120} h={630} phase={0.4} />}
    <CamFrame x={1328} y={190} w={528} h={650} phase={0.73} />
  </AbsoluteFill>
);
