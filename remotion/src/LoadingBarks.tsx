import { AbsoluteFill, useCurrentFrame } from "remotion";
import { theme, radius, clamp01, glassPanel, glassPanelShadow } from "./theme";
import { body } from "./fonts";
import { Paw } from "./Paw";
import { WindowDots } from "./WindowChrome";

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

// Glow must complete an INTEGER number of cycles over the comp (13572 % 240 ≠ 0,
// so plain loopSin pops ~1.2px blur at the loop seam — the invariant violation).
// H cycles over the full duration ≈ the house 8s breathe (13572/28/60 ≈ 8.08s).
const GLOW_CYCLES = Math.round(LOADING_BARKS_DURATION / (8 * FPS));

export const LoadingBarks: React.FC = () => {
  const f = useCurrentFrame() % LOADING_BARKS_DURATION;

  let i = 0;
  for (let k = 0; k < BARKS.length; k++) if (f >= STARTS[k]) i = k;
  const hold = HOLDS[i];
  const local = f - STARTS[i];
  // ~0.45s crossfade (was a fixed 14f authored for 30fps — 0.23s at 60, an abrupt pop)
  const fade = Math.min(Math.round(0.45 * FPS), hold / 4);
  const op = clamp01(Math.min(local / fade, (hold - local) / fade));

  // bar fills 0 → 100% within THIS phrase (uneven spurts), maxing out right
  // before the next phrase takes over.
  const level = curveLevel(i, clamp01(local / hold));
  const glow = 14 + 8 * (0.5 + 0.5 * Math.sin(2 * Math.PI * (GLOW_CYCLES * f / LOADING_BARKS_DURATION + 0.5)));

  const barW = 700;
  const fillW = Math.round(barW * level);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "relative",
          padding: "64px 76px 48px",
          borderRadius: radius.card,
          // shared over-gameplay glass panel (dot grid + sheen + dense fill)
          background: glassPanel,
          border: `1px solid ${theme.glassBorder}`,
          boxShadow: glassPanelShadow(glow),
        }}
      >
        {/* window dots pinned to the top-left CORNER (matches Socials) — no domain
            tag, it's just a widget; stays put while the content below fades on swap */}
        <div style={{ position: "absolute", top: 26, left: 30 }}>
          <WindowDots />
        </div>
        {/* op wraps EVERYTHING (text + bar + %): the bar's one-frame 100%→0 reset
            at each phrase swap happens while fully invisible. op is 0 at both
            slot edges → the loop seam stays invisible too. */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30, opacity: op }}>
        <span
          style={{
            fontFamily: body,
            fontSize: 60,
            color: theme.white,
            letterSpacing: 1,
            whiteSpace: "nowrap",
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
              // track must read as the bar's denominator: 0.09/0.16 measured
              // 1.32:1 / 1.63:1 against the card — invisible. These pass 3:1.
              background: "rgba(255,255,255,0.16)",
              border: `1px solid rgba(255,255,255,0.36)`,
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
                boxShadow: `0 0 10px rgba(0,172,237,0.35)`,
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
              fontFamily: body,
              fontSize: 36, // one status-label size everywhere (was 34 — ad-hoc near-duplicate of 36)
              fontVariantNumeric: "tabular-nums",
              width: 98,
              textAlign: "right",
              color: theme.blueBright,
            }}
          >
            {Math.round(level * 100)}%
          </span>
        </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
