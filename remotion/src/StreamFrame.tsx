import { AbsoluteFill } from "remotion";
import { SimpleBg } from "./SimpleBg";
import { FrameBar } from "./FrameBar";

// Streaming: just the animated background + a slim title bar. No zones — stack
// your game capture / cam / widgets on top however you want.
export type FrameSceneProps = { title: string; status: string; guides?: boolean };

export const StreamFrame: React.FC<FrameSceneProps> = ({ title }) => (
  <AbsoluteFill>
    <SimpleBg />
    <FrameBar x={56} y={36} w={1808} title={title} />
  </AbsoluteFill>
);
