import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { loopSin, theme, VIDEO } from "./theme";

// Shared cabin plate: the forest and right-side moon are visible through a window.
// The photo is still; the motion is layered on top and is loop-safe (every
// wave is an integer harmonic of the 8s loop, every drift wraps exactly once):
// lantern flicker with wall spill, dust motes in the lantern light, a breathing
// moon halo in the window, twinkling window stars, a slow mist drift across the
// valley, and a lit-leaf glint outside the lower-left pane.

// Lantern flame positions in the 1920×1080 plate.
const LANTERNS = [
  { x: 55, y: 490, phase: 0.1 },
  { x: 1870, y: 630, phase: 0.6 },
];
// Moon as painted into the plate (the shared wolf Moon is not used here).
const WINDOW_MOON = { x: 1336, y: 236 };
// Lit leaves outside the lower-left pane.
const LEAF_GLINT = { x: 280, y: 680 };
// Window glass (between the posts): the mist band is clipped to it.
const WINDOW = { x: 212, y: 0, w: 1500, h: 720 };

// Seeded once at module load (same LCG pattern as wolf/Starfield).
const lcg = (seed: number) => {
  let s = seed;
  return () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
};

// Window-sky stars: kept above the top beam (y<180) and out of the vertical
// posts so they read as sky, not wood.
const POSTS = [[468, 506], [972, 1006], [1452, 1486]];
const stars = (() => {
  const rnd = lcg(90210);
  const out: { x: number; y: number; r: number; phase: number; harmonic: number }[] = [];
  while (out.length < 40) {
    const x = 240 + rnd() * 1440;
    const y = 12 + rnd() * 165;
    if (POSTS.some(([a, b]) => x > a - 6 && x < b + 6)) continue;
    if (Math.hypot(x - WINDOW_MOON.x, y - WINDOW_MOON.y) < 90) continue;
    out.push({ x, y, r: 1.1 + rnd() * 1.7, phase: rnd(), harmonic: 2 + Math.floor(rnd() * 4) });
  }
  return out;
})();

// Dust motes: slow rise through the lantern light with a gentle sway. Each
// mote climbs exactly `rise` px over the loop and wraps, so the seam is exact.
const motes = (() => {
  const rnd = lcg(4242);
  return Array.from({ length: 22 }, (_, i) => {
    const l = LANTERNS[i % 2];
    return {
      x0: l.x + (rnd() - 0.5) * 220,
      y0: l.y + (rnd() - 0.5) * 320,
      r: 1.2 + rnd() * 1.8,
      sway: 6 + rnd() * 14,
      phase: rnd(),
      rise: 60 + Math.floor(rnd() * 3) * 30, // 60 / 90 / 120 px per loop
      harmonic: 1 + Math.floor(rnd() * 2),
      alpha: 0.25 + rnd() * 0.4,
    };
  });
})();

// Irregular-but-seamless flicker: three integer harmonics, unequal weights → 0..1.
const flicker = (f: number, phase: number) =>
  0.5 + 0.5 * (0.55 * loopSin(f, phase, 3) + 0.3 * loopSin(f, phase * 1.7, 7) + 0.15 * loopSin(f, phase * 2.3, 11));

export const CabinBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / VIDEO.durationInFrames; // 0..1 over the loop
  const moonGlow = 0.18 + 0.16 * (0.5 + 0.5 * loopSin(frame, 0.5));
  const leaf = 0.5 + 0.5 * loopSin(frame, 0.3, 2);
  // mist drifts right→left across the window; two copies tile so the wrap is seamless
  const mistShift = -WINDOW.w * t;
  return <AbsoluteFill style={{ backgroundColor: theme.navyDeep }}>
    <Img src={staticFile("cabin-office.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />

    {/* valley mist: a soft band sliding across the window, clipped to the glass */}
    <div style={{ position: "absolute", left: WINDOW.x, top: WINDOW.y, width: WINDOW.w, height: WINDOW.h, overflow: "hidden", pointerEvents: "none", mixBlendMode: "screen" }}>
      {[0, 1].map((k) => (
        <div key={k} style={{
          position: "absolute", left: mistShift + k * WINDOW.w, top: 300, width: WINDOW.w, height: 300,
          background: "radial-gradient(ellipse 34% 55% at 30% 50%, rgba(190,210,235,0.34) 0%, rgba(190,210,235,0) 100%), radial-gradient(ellipse 28% 45% at 72% 62%, rgba(190,210,235,0.26) 0%, rgba(190,210,235,0) 100%)",
          filter: "blur(18px)",
        }} />
      ))}
    </div>

    {/* window sky: twinkling stars + breathing moon halo */}
    <svg width={VIDEO.width} height={VIDEO.height} style={{ position: "absolute", top: 0, left: 0 }}>
      <defs>
        <radialGradient id="cabinMoonHalo">
          <stop offset="0%" stopColor="rgba(214,228,255,0.6)" />
          <stop offset="45%" stopColor="rgba(160,190,240,0.2)" />
          <stop offset="100%" stopColor="rgba(160,190,240,0)" />
        </radialGradient>
      </defs>
      {stars.map((st, i) => (
        <circle key={i} cx={st.x} cy={st.y} r={st.r} fill={theme.white}
          opacity={0.05 + 0.75 * (0.5 + 0.5 * loopSin(frame, st.phase, st.harmonic))} />
      ))}
      <circle cx={WINDOW_MOON.x} cy={WINDOW_MOON.y} r={170} fill="url(#cabinMoonHalo)" opacity={moonGlow}
        style={{ mixBlendMode: "screen" }} />
    </svg>

    {/* lantern flicker: tight flame core + wide warm spill on the wall/shelves, screen-blended */}
    {LANTERNS.map((l, i) => {
      const k = flicker(frame, l.phase);
      return (
        <AbsoluteFill key={i} style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
          <div style={{ position: "absolute", left: l.x - 320, top: l.y - 320, width: 640, height: 640, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,176,84,0.62) 0%, rgba(255,150,60,0.24) 32%, rgba(255,140,50,0) 70%)",
            opacity: 0.18 + 0.42 * k }} />
          <div style={{ position: "absolute", left: l.x - 50, top: l.y - 56, width: 100, height: 112, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,232,175,0.95) 0%, rgba(255,190,110,0.4) 45%, rgba(255,170,90,0) 75%)",
            opacity: 0.2 + 0.7 * k }} />
        </AbsoluteFill>
      );
    })}

    {/* dust motes rising through the lantern light */}
    <svg width={VIDEO.width} height={VIDEO.height} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
      {motes.map((m, i) => {
        const y = m.y0 - ((t * m.rise + m.phase * m.rise) % m.rise) + m.rise / 2;
        const x = m.x0 + m.sway * loopSin(frame, m.phase, m.harmonic);
        const edge = 1 - Math.abs((y - m.y0) / (m.rise / 2)); // fade at the wrap ends
        return <circle key={i} cx={x} cy={y} r={m.r} fill="#FFE2B0" opacity={m.alpha * Math.max(0, Math.min(1, edge * 2))} />;
      })}
    </svg>

    {/* lit leaves outside the lower-left pane: slow glint */}
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      <div style={{ position: "absolute", left: LEAF_GLINT.x - 130, top: LEAF_GLINT.y - 80, width: 260, height: 160, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(255,190,100,0.5) 0%, rgba(255,170,80,0) 70%)", opacity: 0.06 + 0.3 * leaf }} />
    </AbsoluteFill>

    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 8% 60%, rgba(230,161,78,${0.025 + 0.01 * loopSin(frame)}) 0%, transparent 45%)`, pointerEvents: "none" }} />
    <AbsoluteFill style={{ boxShadow: "inset 0 0 200px rgba(2,6,15,0.35)", pointerEvents: "none" }} />
  </AbsoluteFill>;
};

