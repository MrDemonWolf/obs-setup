import { useCurrentFrame } from "remotion";
import { theme, VIDEO, loopSin } from "../theme";

// Cheap twinkling starfield (seeded once at module load). Opacity only.
// Per-star integer harmonic 2–4: a single shared 8s period read as one slow
// breath, not twinkle — rate variety is what sells scintillation. Integer
// harmonics keep the loop seam exact (loopSin supports them natively).
const stars = (() => {
  let s = 424242;
  const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  return Array.from({ length: 55 }, () => ({
    x: rnd() * VIDEO.width,
    y: rnd() * VIDEO.height * 0.82,
    r: 0.8 + rnd() * 1.8,
    phase: rnd(),
    harmonic: 2 + Math.floor(rnd() * 3), // 2–4 cycles per loop (4s / 2.7s / 2s)
  }));
})();

export const Starfield: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <svg width={VIDEO.width} height={VIDEO.height} style={{ position: "absolute" }}>
      {stars.map((st, i) => (
        <circle
          key={i}
          cx={st.x}
          cy={st.y}
          r={st.r}
          fill={theme.white}
          opacity={0.22 + 0.5 * (0.5 + 0.5 * loopSin(f, st.phase, st.harmonic))}
        />
      ))}
    </svg>
  );
};
