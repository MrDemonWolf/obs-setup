import { AbsoluteFill } from "remotion";
import { Background } from "./Background";

// Streaming: just the animated `glow` background — no bar, no zones. Stack your
// game capture / cam / widgets on top however you want.
export const StreamFrame: React.FC = () => (
  <AbsoluteFill>
    <Background variant="glow" />
  </AbsoluteFill>
);
