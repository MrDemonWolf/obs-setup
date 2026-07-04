import { AbsoluteFill, useCurrentFrame } from "remotion";
import { theme, radius, clamp01, loopSin } from "./theme";
import { mono } from "./fonts";
import { Paw } from "./Paw";

const BARKS = [
  "Loading barks…",
  "Paws… hang tight…",
  "Gathering the moons…",
  "Fur real, almost there…",
  "Wolfing down packets…",
  "Sniffing out the signal…",
  "Warming up the howl…",
  "Awoo-most ready…",
];

// Deterministic seeded schedule, computed ONCE at module load (loop-safe — no
// per-frame randomness / Date). Each phrase holds a random 20–40s; the bar
// advances a random chunk per phrase (so the fill SPEED looks random), tops out
// at ~95% on the last phrase ("almost ready…"), then the loop resets to 0.
export const LOADING_BARKS_FPS = 60; // this comp renders at 60fps; schedule below is built at this rate
const FPS = LOADING_BARKS_FPS;
const lcg = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const rand = lcg(20260704);

const HOLDS = BARKS.map(() => Math.round((20 + rand() * 20) * FPS)); // frames per phrase (20–40s)
const STARTS: number[] = [];
HOLDS.reduce((acc, h) => (STARTS.push(acc), acc + h), 0); // STARTS[i] = first frame of phrase i
export const LOADING_BARKS_DURATION = HOLDS.reduce((a, h) => a + h, 0);

// Per-phrase fill curve: the bar goes 0 → 100% WITHIN each phrase (fills up,
// then the next phrase starts fresh). Random segment speeds make it climb in
// uneven spurts, but it always lands on 100% right before the swap. `norm`
// turns random weights into cumulative fractions ending at exactly 1.
const SEG = 4;
const norm = (arr: number[]) => {
  const s = arr.reduce((a, b) => a + b, 0);
  let c = 0;
  return arr.map((v) => (c += v / s)); // cumulative, last element === 1
};
const CURVES = BARKS.map(() => ({
  times: [0, ...norm(Array.from({ length: SEG }, () => 0.4 + rand()))],
  vals: [0, ...norm(Array.from({ length: SEG }, () => 0.4 + rand()))],
}));
// level for phrase i at progress p (0..1): piecewise-linear through the curve →
// 0 at p=0, 1 at p=1 (100% by phrase end).
const curveLevel = (i: number, p: number) => {
  const { times, vals } = CURVES[i];
  for (let k = 0; k < times.length - 1; k++) {
    if (p <= times[k + 1]) return vals[k] + (vals[k + 1] - vals[k]) * ((p - times[k]) / (times[k + 1] - times[k]));
  }
  return 1;
};

export const LoadingBarks: React.FC = () => {
  const f = useCurrentFrame() % LOADING_BARKS_DURATION;

  let i = 0;
  for (let k = 0; k < BARKS.length; k++) if (f >= STARTS[k]) i = k;
  const hold = HOLDS[i];
  const local = f - STARTS[i];
  const fade = Math.min(14, hold / 4);
  const op = clamp01(Math.min(local / fade, (hold - local) / fade));

  // bar fills 0 → 100% within THIS phrase (uneven spurts), maxing out right
  // before the next phrase takes over.
  const level = curveLevel(i, clamp01(local / hold));
  const glow = 26 + 16 * (0.5 + 0.5 * loopSin(useCurrentFrame(), 0.5)); // match Countdown

  const barW = 700;
  const fillW = Math.round(barW * level);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
          padding: "48px 76px",
          borderRadius: radius.card,
          background: theme.glassFill,
          border: `1px solid ${theme.glassBorder}`,
          boxShadow: `0 30px 80px rgba(0,0,0,0.45), inset 0 1px 0 ${theme.glassHi}, 0 0 ${glow}px rgba(0,172,237,0.35)`,
        }}
      >
        <span
          style={{
            fontFamily: mono,
            fontSize: 60,
            color: theme.white,
            letterSpacing: 1,
            whiteSpace: "nowrap",
            opacity: op,
            textShadow: "0 3px 18px rgba(0,0,0,0.4)",
          }}
        >
          {BARKS[i]}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {/* track */}
          <div
            style={{
              position: "relative",
              width: barW,
              height: 20,
              borderRadius: 8, // macOS-rounded, not a full pill
              background: "rgba(255,255,255,0.09)",
              border: `1px solid ${theme.glassBorder}`,
            }}
          >
            {/* fill */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: fillW,
                borderRadius: 6,
                background: `linear-gradient(90deg, ${theme.blue}, ${theme.blueBright})`,
                boxShadow: `0 0 18px rgba(0,172,237,0.5)`,
              }}
            />
            {/* paw riding the fill edge */}
            <div style={{ position: "absolute", left: fillW - 18, top: -8 }}>
              <Paw size={36} color={theme.white} />
            </div>
          </div>
          {/* fixed-width % so it never reflows */}
          <span
            style={{
              fontFamily: mono,
              fontSize: 34,
              fontVariantNumeric: "tabular-nums",
              width: 92,
              textAlign: "right",
              color: theme.blueBright,
            }}
          >
            {Math.round(level * 100)}%
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
