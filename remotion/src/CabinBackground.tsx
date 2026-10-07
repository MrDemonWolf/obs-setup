import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { loopSin, theme } from "./theme";

// Shared cabin plate: the forest and right-side moon are visible through a window.
export const CabinBackground: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ backgroundColor: theme.navyDeep }}>
    <Img src={staticFile("cabin-office.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 8% 60%, rgba(230,161,78,${0.025 + 0.01 * loopSin(frame)}) 0%, transparent 45%)`, pointerEvents: "none" }} />
    <AbsoluteFill style={{ boxShadow: "inset 0 0 200px rgba(2,6,15,0.35)", pointerEvents: "none" }} />
  </AbsoluteFill>;
};
