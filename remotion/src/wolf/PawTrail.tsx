import { useCurrentFrame } from "remotion";
import { Paw } from "../Paw";
import { theme, VIDEO, clamp01 } from "../theme";

// Footsteps walking left→right along the bottom: each print pops in as the
// invisible wolf "lands" on it, lingers, then fades — so only the last few
// steps are visible, marching in sequence. Toes point in the direction of
// travel; prints alternate above/below the walk line like real footfalls.
// Seamless: age is computed modulo the full loop, so the trail fades out
// completely before the sequence wraps.
export const PawTrail: React.FC<{ count?: number; y?: number; maxOpacity?: number }> = ({
  count = 10,
  y = 980,
  maxOpacity = 0.2,
}) => {
  const f = useCurrentFrame();
  const t = f / VIDEO.durationInFrames; // 0..1 through the loop
  const attack = 0.03; // fast pop-in as the paw lands
  const tail = 0.3; // slow fade — ~3 recent prints visible at once
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const x = 100 + (i * 1720) / (count - 1);
        const yy = y + (i % 2 ? -20 : 16);
        const age = (t - i / count + 1) % 1; // time since this step landed
        const o = (age < attack ? age / attack : clamp01(1 - (age - attack) / tail)) * maxOpacity;
        return (
          <div
            key={i}
            style={{ position: "absolute", left: x, top: yy, transform: `rotate(${90 + (i % 2 ? 12 : -12)}deg)` }}
          >
            <Paw size={46} color={theme.blueBright} opacity={o} />
          </div>
        );
      })}
    </>
  );
};
