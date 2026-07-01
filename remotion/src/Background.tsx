import { AbsoluteFill, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { theme, loopAngle, loopSin, BgVariant } from "./theme";
import { Starfield, Moon, Embers } from "./wolf";

// Aurora blob whose centre drifts on a loop-circle sampled through noise →
// organic but perfectly seamless.
const Aurora: React.FC<{ seed: string; cx: number; cy: number; r: number; color: string; amp: number }> = ({
  seed,
  cx,
  cy,
  r,
  color,
  amp,
}) => {
  const a = loopAngle(useCurrentFrame());
  const nx = noise2D(seed + "x", Math.cos(a), Math.sin(a));
  const ny = noise2D(seed + "y", Math.cos(a), Math.sin(a));
  return (
    <div
      style={{
        position: "absolute",
        left: cx + nx * amp - r,
        top: cy + ny * amp - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 68%)`,
        filter: "blur(22px)",
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
      <AbsoluteFill style={{ background: `linear-gradient(160deg, ${theme.navyTop} 0%, ${theme.navyDeep} 70%)` }} />
      {showParticles && <Starfield />}
      {showMoon && <Moon />}
      <Aurora seed="a" cx={430} cy={300} r={520} color="rgba(0,172,237,0.26)" amp={90} />
      <Aurora seed="b" cx={1520} cy={840} r={540} color="rgba(107,139,245,0.18)" amp={120} />
      {showParticles && (
        <Embers
          count={variant === "ember" ? 22 : 16}
          color={variant === "ember" ? "224,140,61" : "0,172,237"}
          seed={variant === "ember" ? 13 : 7}
        />
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
      <AbsoluteFill style={{ boxShadow: "inset 0 0 320px rgba(0,0,0,0.55)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
