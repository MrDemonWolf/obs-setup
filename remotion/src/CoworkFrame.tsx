import { AbsoluteFill } from "remotion";
import { Background } from "./Background";
import { FrameBar } from "./FrameBar";
import type { FrameSceneProps } from "./StreamFrame";

// Co-Working: bare overlay — animated `glow` background (aurora + moon, no busy
// particles) + top bar only. Stack your own OBS sources (cam, timer, tasks,
// chat) wherever you want.
export const CoworkFrame: React.FC<FrameSceneProps> = ({ title }) => (
  <AbsoluteFill>
    <Background variant="glow" />
    <FrameBar x={56} y={40} w={1808} title={title} />
  </AbsoluteFill>
);
