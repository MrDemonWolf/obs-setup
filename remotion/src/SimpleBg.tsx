import { AbsoluteFill, useCurrentFrame } from "remotion";
import { theme, loopSin } from "./theme";

// Lightweight background for the frame scenes — flat gradient + a slowly
// drifting dot grid + vignette. No spotlight/glow. Cheap to render, small file.
export const SimpleBg: React.FC = () => {
  const f = useCurrentFrame();
  const gridShift = 8 * loopSin(f);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${theme.navyTop}, ${theme.navyDeep} 70%)` }}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${theme.grid} 1.4px, transparent 1.4px)`,
          backgroundSize: "48px 48px",
          backgroundPosition: `${gridShift}px ${gridShift}px`,
          opacity: 0.6,
          maskImage: "radial-gradient(ellipse at 50% 45%, black 55%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 45%, black 55%, transparent 100%)",
        }}
      />
      <AbsoluteFill style={{ boxShadow: "inset 0 0 280px rgba(0,0,0,0.5)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
