import { AbsoluteFill } from "remotion";
import { CabinBackground } from "./CabinBackground";
import { CamFrame } from "./CamFrame";
import { ChatPanel } from "./ChatBoxFrame";
import { theme } from "./theme";

// Clean layout for embedding: a true-16:9 webcam frame + a labeled chat panel.
// Forest background so
// ember particles don't churn behind your cam + chat. Drop your real cam and
// chat sources inside the two frames.
// VTuber mode (`hideCam`) drops the cam frame — the model goes full-screen —
// but keeps the tall chat frame on the right.
export const JustChattingScene: React.FC<{ hideCam?: boolean }> = ({ hideCam }) => (
  <AbsoluteFill style={{ backgroundColor: theme.navyDeep }}>
    {/* The shared cabin plate leaves an open seated-model area by the window. */}
    <CabinBackground />
    {!hideCam && <CamFrame x={96} y={190} w={1120} h={630} phase={0.4} />}
    <ChatPanel x={1328} y={190} w={528} h={650} />
  </AbsoluteFill>
);
