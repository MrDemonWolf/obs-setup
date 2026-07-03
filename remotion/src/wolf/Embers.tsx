import { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { VIDEO, loopSin } from "../theme";

// Drifting embers / fireflies. Vertical drift wraps via modulo (seamless);
// horizontal sway + opacity via loopSin. Glow baked as a radialGradient (no
// per-particle filter). `color` is an "r,g,b" string.
export const Embers: React.FC<{ count?: number; color?: string; seed?: number }> = ({
  count = 18,
  color = "0,172,237",
  seed = 7,
}) => {
  const f = useCurrentFrame();
  const parts = useMemo(() => {
    let s = seed * 1000 + 1;
    const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    return Array.from({ length: count }, () => ({
      x: rnd() * VIDEO.width,
      y: rnd() * VIDEO.height,
      size: 4 + rnd() * 7,
      phase: rnd(),
      amp: 18 + rnd() * 40,
      range: 120 + rnd() * 260,
    }));
  }, [count, seed]);

  return (
    <>
      {parts.map((p, i) => {
        const w = ((f / VIDEO.durationInFrames) + p.phase) % 1; // wrap progress
        const y = p.y - w * p.range;
        const x = p.x + p.amp * loopSin(f, p.phase);
        // fade to zero near the wrap point so the vertical teleport is invisible
        const edge = Math.min(1, Math.min(w, 1 - w) * 10);
        const o = (0.12 + 0.35 * (0.5 + 0.5 * loopSin(f, p.phase))) * edge;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(${color},${o}) 0%, transparent 70%)`,
            }}
          />
        );
      })}
    </>
  );
};
