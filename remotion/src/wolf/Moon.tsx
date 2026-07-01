import { useCurrentFrame } from "remotion";
import { VIDEO, loopSin } from "../theme";

// Full moon with a soft breathing halo, top-left. Pre-baked glow
// (radialGradient fill), animate opacity only — no live blur.
export const Moon: React.FC<{ x?: number; y?: number; r?: number }> = ({ x = 300, y = 200, r = 92 }) => {
  const f = useCurrentFrame();
  const glow = 0.5 + 0.35 * (0.5 + 0.5 * loopSin(f, 0.5));
  const grow = 1 + 0.08 * loopSin(f, 0.4); // seamless breathe/grow
  return (
    <svg width={VIDEO.width} height={VIDEO.height} style={{ position: "absolute" }}>
      <defs>
        <radialGradient id="moonHalo">
          <stop offset="0%" stopColor="rgba(0,172,237,0.45)" />
          <stop offset="55%" stopColor="rgba(0,172,237,0.12)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="moonBody" cx="42%" cy="38%">
          <stop offset="0%" stopColor="#F4F8FF" />
          <stop offset="100%" stopColor="#C9D6EA" />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={r * 2.6 * grow} fill="url(#moonHalo)" opacity={glow} />
      <circle cx={x} cy={y} r={r * grow} fill="url(#moonBody)" />
    </svg>
  );
};
