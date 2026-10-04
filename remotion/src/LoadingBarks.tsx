import { AbsoluteFill, useCurrentFrame } from "remotion";
import { theme, radius, clamp01, glassPanel, glassPanelShadow } from "./theme";
import { body, display } from "./fonts";
import { Paw } from "./Paw";
import { WindowDots } from "./WindowChrome";

const BARKS = [
  { headline: "One brain cell is booting…", detail: "Please do not tap the glass." },
  { headline: "Sniffing out one last bug…", detail: "It ran under the keyboard. Again." },
  { headline: "The moon said five more minutes…", detail: "We respect lunar time." },
  { headline: "Connecting to paw-fi…", detail: "Signal strong. Router a little scared." },
  { headline: "Zoomies found the progress bar…", detail: "Someone put them on a leash." },
  { headline: "Loading treats & dependencies…", detail: "Both have suspiciously long build times." },
  { headline: "Awoo-thentication pending…", detail: "Please verify your howl." },
  { headline: "Stream gremlins are hiding…", detail: "The paw patrol is on the case." },
  { headline: "Paw-gress looks good…", detail: "Measured in zoomies, obviously." },
  { headline: "The den is almost online…", detail: "If it howls, startup passed." },
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

  const barW = 790;
  const fillW = Math.round(barW * level);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "relative",
          width: 1080,
          boxSizing: "border-box",
          padding: "44px 56px 46px",
          borderRadius: radius.card,
          // shared over-gameplay glass panel (dot grid + sheen + dense fill)
          background: glassPanel,
          border: `1px solid ${theme.glassBorder}`,
          boxShadow: glassPanelShadow(glow),
        }}
      >
        {/* Minimal window chrome and a clear widget label keep this readable as a
            small stream status panel, not a second title card. */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
          <WindowDots size={12} gap={8} />
          <span
            style={{
              fontFamily: body,
              fontSize: 17,
              fontWeight: 700,
              color: theme.textDim,
              letterSpacing: 3,
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            DEN STATUS
          </span>
          <div
            style={{
              flex: 1,
              height: 1,
              marginLeft: 4,
              background: "linear-gradient(90deg, rgba(255,255,255,0.16), transparent)",
            }}
          />
        </div>
        {/* Fade the headline, punchline, bar, and percentage together so the
            progress reset stays hidden at every phrase swap and loop seam. */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: 18, opacity: op }}>
          <span
            style={{
              fontFamily: display,
              fontSize: 58,
              fontWeight: 700,
              color: theme.white,
              letterSpacing: -1.2,
              lineHeight: 1.16,
              whiteSpace: "nowrap",
              textShadow: "0 3px 18px rgba(0,0,0,0.4)",
            }}
          >
            {BARKS[i].headline}
          </span>

          <span
            style={{
              fontFamily: body,
              fontSize: 26,
              fontWeight: 600,
              color: "rgba(255,255,255,0.76)",
              lineHeight: 1.35,
              whiteSpace: "nowrap",
              marginTop: -8,
            }}
          >
            {BARKS[i].detail}
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 8 }}>
            {/* The three dim paw marks turn bright after the fill reaches them. */}
            <div
              style={{
                position: "relative",
                width: barW,
                height: 18,
                borderRadius: 8,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.28)",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.28)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: fillW,
                  borderRadius: 7,
                  background: `linear-gradient(90deg, ${theme.blue}, ${theme.blueBright})`,
                  boxShadow: "0 0 14px rgba(0,172,237,0.48), inset 0 1px 0 rgba(255,255,255,0.45)",
                }}
              />
              {[0.25, 0.5, 0.75].map((mark) => (
                <div key={mark} style={{ position: "absolute", left: `${mark * 100}%`, top: -5, zIndex: 1 }}>
                  <Paw size={26} color={theme.pawWhite} opacity={level >= mark ? 0.94 : 0.3} />
                </div>
              ))}
              {/* One bright paw walks at the fill edge. */}
              <div style={{ position: "absolute", left: fillW - 18, top: -9, zIndex: 2, filter: "drop-shadow(0 0 5px rgba(56,198,245,0.7))" }}>
                <Paw size={36} color={theme.white} />
              </div>
            </div>
            <span
              style={{
                fontFamily: body,
                fontSize: 30,
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                width: 96,
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
