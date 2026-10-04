import { AbsoluteFill } from "remotion";
import { Background } from "./Background";
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
    {/* Move the moon to the right-side sky pocket, matching Co-Working. Its
        shared height/radius stay unchanged; the body clears the taller frame. */}
    <Background variant="forest" moon={{ x: 1568 }} />
    {/* staggered glow phases so cam + chat don't pulse in lockstep */}
    {!hideCam && <CamFrame x={64} y={190} w={1232} h={693} phase={0.4} />}
    <CamFrame x={1328} y={190} w={528} h={693} phase={0.73} />
  </AbsoluteFill>
);
