import { useCurrentFrame } from "remotion";
import { VIDEO, loopSin } from "../theme";

// Full moon with a soft breathing halo. Pre-baked glow (radialGradient fill),
// animate opacity only — no live blur. Only the HALO breathes — the solid body
// stays perfectly still (an 8% body throb swung the disc ~30px in diameter every
// cycle; a moon is the one thing viewers expect not to move).
// ONE size AND one height everywhere: r defaults to MOON_R and y to MOON_Y, so
// the moon reads identically on every scene and only its LEFT/RIGHT position
// changes (scenes pass just `x` — 300 = left, 1568 = right pocket). Don't
// reintroduce per-scene r or y overrides; it's meant to sit at one altitude.
export const MOON_R = 72;
export const MOON_Y = 108;
export const Moon: React.FC<{ x?: number; y?: number; r?: number }> = ({ x = 300, y = MOON_Y, r = MOON_R }) => {
  const f = useCurrentFrame();
  const glow = 0.5 + 0.35 * (0.5 + 0.5 * loopSin(f, 0.5));
  const grow = 1 + 0.08 * loopSin(f, 0.4); // halo-only seamless breathe
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
        <radialGradient id="moonMare">
          <stop offset="0%" stopColor="#AEBEDA" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#AEBEDA" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="moonLimb">
          <stop offset="0%" stopColor="rgba(9,21,51,0)" />
          <stop offset="62%" stopColor="rgba(9,21,51,0)" />
          <stop offset="100%" stopColor="rgba(9,21,51,0.26)" />
        </radialGradient>
        <clipPath id="moonClip">
          <circle cx={0} cy={0} r={r} />
        </clipPath>
      </defs>
      <circle cx={x} cy={y} r={r * 2.6 * grow} fill="url(#moonHalo)" opacity={glow} />
      <g transform={`translate(${x} ${y})`}>
        <circle cx={0} cy={0} r={r} fill="url(#moonBody)" />
        <g clipPath="url(#moonClip)">
          {/* static mare/crater detail — texture, not motion */}
          <ellipse cx={-r * 0.28} cy={-r * 0.12} rx={r * 0.34} ry={r * 0.26} fill="url(#moonMare)" />
          <ellipse cx={r * 0.3} cy={r * 0.08} rx={r * 0.22} ry={r * 0.17} fill="url(#moonMare)" />
          <circle cx={r * 0.02} cy={r * 0.48} r={r * 0.13} fill="url(#moonMare)" />
          <circle cx={r * 0.42} cy={-r * 0.38} r={r * 0.1} fill="url(#moonMare)" />
          {/* soft limb shading toward lower-right — still reads as a full moon */}
          <circle cx={r * 0.14} cy={r * 0.14} r={r * 1.05} fill="url(#moonLimb)" />
        </g>
      </g>
    </svg>
  );
};
