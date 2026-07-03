import { AbsoluteFill, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { theme, loopAngle, loopSin, BgVariant } from "./theme";
import { Starfield, Moon, Embers } from "./wolf";

// Aurora ribbon whose centre drifts on a loop-circle sampled through noise →
// organic but perfectly seamless. Elongated + tilted like a curtain band, with
// softness baked into the gradient stops (no live blur — cheap to render).
const Aurora: React.FC<{ seed: string; cx: number; cy: number; r: number; rgb: string; alpha: number; amp: number; tilt: number }> = ({
  seed,
  cx,
  cy,
  r,
  rgb,
  alpha,
  amp,
  tilt,
}) => {
  const a = loopAngle(useCurrentFrame());
  const nx = noise2D(seed + "x", Math.cos(a), Math.sin(a));
  const ny = noise2D(seed + "y", Math.cos(a), Math.sin(a));
  return (
    <div
      style={{
        position: "absolute",
        left: cx + nx * amp - r * 1.35,
        top: cy + ny * amp - r * 0.7,
        width: r * 2.7,
        height: r * 1.4,
        borderRadius: "50%",
        transform: `rotate(${tilt}deg)`,
        background: `radial-gradient(ellipse at center, rgba(${rgb},${alpha}) 0%, rgba(${rgb},${alpha * 0.45}) 38%, rgba(${rgb},0) 72%)`,
      }}
    />
  );
};

// Wolf night background. `night` = full ambience; `ember` = warm embers for the
// wind-down scene; `glow` = aurora + moon, no busy particles (calm-but-pops,
// for content-heavy scenes); `minimal` = light (used where a busy bg distracts).
export const Background: React.FC<{ variant?: BgVariant }> = ({ variant = "night" }) => {
  const frame = useCurrentFrame();
  const gridShift = 8 * loopSin(frame);
  const showMoon = variant !== "minimal"; // night, ember, glow
  const showParticles = showMoon && variant !== "glow"; // starfield + embers: night, ember

  return (
    <AbsoluteFill style={{ backgroundColor: theme.navyDeep }}>
      <AbsoluteFill
        style={{ background: `linear-gradient(160deg, ${theme.navyTop} 0%, ${theme.navyDeep} 70%, ${theme.navyFloor} 100%)` }}
      />
      {showParticles && <Starfield />}
      {showMoon && <Moon />}
      <Aurora seed="a" cx={430} cy={300} r={520} rgb="0,172,237" alpha={0.26} amp={90} tilt={-8} />
      <Aurora seed="b" cx={1520} cy={840} r={540} rgb="107,139,245" alpha={0.18} amp={120} tilt={6} />
      {showParticles && (
        <Embers
          count={variant === "ember" ? 22 : 16}
          color={variant === "ember" ? "224,140,61" : "0,172,237"}
          seed={variant === "ember" ? 13 : 7}
        />
      )}
      {/* warm ember floor wash — the wind-down mood lives in the grade too */}
      {variant === "ember" && (
        <AbsoluteFill style={{ background: "linear-gradient(to top, rgba(224,140,61,0.06), transparent 30%)" }} />
      )}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${theme.grid} 1.6px, transparent 1.6px)`,
          backgroundSize: "46px 46px",
          backgroundPosition: `${gridShift}px ${gridShift}px`,
          maskImage: "radial-gradient(ellipse at 50% 45%, black 55%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 45%, black 55%, transparent 100%)",
        }}
      />
      <AbsoluteFill style={{ boxShadow: "inset 0 0 320px rgba(2,6,15,0.6)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
