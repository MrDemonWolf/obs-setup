import { AbsoluteFill } from "remotion";
import { Background } from "./Background";

// Just the animated moonlit forest background — the most flexible overlay. Drop
// your webcam / screen / widgets on top however you like.
export const BackdropScene: React.FC = () => (
  <AbsoluteFill>
    <Background variant="forest" moon={{ x: 1568 }} />
  </AbsoluteFill>
);
