import { useCurrentFrame } from "remotion";
import { Paw } from "../Paw";
import { theme, loopSin, clamp01 } from "../theme";

// Footsteps walking left→right along the bottom: alternating up/down prints
// that light up in sequence (an "invisible wolf padding past"). Seamless via
// loopSin, opacity + rotation only.
export const PawTrail: React.FC<{ count?: number; y?: number; maxOpacity?: number }> = ({
  count = 8,
  y = 980,
  maxOpacity = 0.16,
}) => {
  const f = useCurrentFrame();
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const x = 120 + (i * 1680) / (count - 1);
        const yy = y + (i % 2 ? -16 : 16);
        const o = clamp01(loopSin(f, -i / count)) * maxOpacity;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: yy, transform: `rotate(${i % 2 ? 10 : -10}deg)` }}>
            <Paw size={46} color={theme.blueBright} opacity={o} />
          </div>
        );
      })}
    </>
  );
};
