import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  StingerAudio,
  STINGER_HOLD_END_MS,
  STINGER_HOLD_START_MS,
  STINGER_POINT_MS,
} from "./StingerAudio";

// OBS stinger: the overlay moon (pale body, cerulean halo) leaves its right-pocket
// rest position, goes "dark mode" (steel blue) on the way in, and
// (the same spot it occupies on the live scenes), travels to center, and pulls a
// dark night sky across the canvas as a soft-edged IRIS centred on the moon. The
// sky holds every pixel opaque from STINGER_HOLD_START_MS to STINGER_HOLD_END_MS
// (the 2000 ms OBS cut sits inside), then the iris contracts back into the moon
// as it retreats. One-shot: every value is an eased interpolate() over the comp
// clock — no loop helpers, no per-frame randomness. Frame 0 and the last frame
// are fully transparent so OBS composites the ends cleanly.

const POCKET = { x: 1568, y: 108, r: 72 }; // shared MOON_Y / right-pocket x on the scenes
const CENTER_R = 300;
const HOLD_START = STINGER_HOLD_START_MS / 1000;
const HOLD_END = STINGER_HOLD_END_MS / 1000;
const CUT = STINGER_POINT_MS / 1000;
const SKY_IN_END = HOLD_START - 0.1; // sky is already solid before the hold starts
const SKY_OUT_END = 3.85;
const IRIS_FULL = 1500; // inner-opaque radius once covered; canvas half-diagonal is 1101
const IRIS_FEATHER = 380;

// Seeded once at module load (same LCG pattern as wolf/Starfield) — deterministic
// across renders, no Math.random() per frame. Stars stay still; they only fade
// with the sky, so the moon carries all the motion.
const STARS = (() => {
  let s = 7_331_337;
  const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  return Array.from({ length: 110 }, (_, i) => ({
    x: Math.round(rnd() * 1920),
    y: Math.round(rnd() * 1080),
    r: 0.7 + rnd() * 1.2,
    o: 0.24 + rnd() * 0.4,
    glow: i % 12 === 0,
  }));
})();

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeInOut = Easing.inOut(Easing.cubic);

/** Dark-mode night-sky iris around a steel-blue moon; fully opaque across the cut. */
export const FullMoonStinger: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;
  const lastSecond = (durationInFrames - 1) / fps;

  // --- moon path -----------------------------------------------------------
  const arrive = interpolate(seconds, [0.1, HOLD_START], [0, 1], { ...clamp, easing: easeInOut });
  const recede = interpolate(seconds, [HOLD_END, SKY_OUT_END], [1, 0], { ...clamp, easing: easeInOut });
  const travel = seconds < HOLD_END ? arrive : recede;
  const arc = Math.min(1, travel + 0.16 * Math.sin(Math.PI * travel)); // gentle sag, not a straight line
  const x = interpolate(travel, [0, 1], [POCKET.x, width / 2]);
  const y = interpolate(arc, [0, 1], [POCKET.y, height / 2]);
  // A slow +10px drift keeps the hold alive; it is continuous into the recede.
  const drift = seconds < HOLD_END
    ? interpolate(seconds, [HOLD_START, HOLD_END], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) })
    : travel;
  const radius = POCKET.r + (CENTER_R - POCKET.r) * travel + 10 * drift;
  const moonOpacity = interpolate(seconds, [0, 0.18, 3.82, lastSecond], [0, 1, 1, 0], clamp);

  // --- sky iris ------------------------------------------------------------
  const skyOpacity = interpolate(seconds, [0.1, SKY_IN_END, HOLD_END, SKY_OUT_END], [0, 1, 1, 0], {
    ...clamp, easing: easeInOut,
  });
  const irisIn = interpolate(seconds, [0.1, SKY_IN_END], [POCKET.r + 60, IRIS_FULL], { ...clamp, easing: easeInOut });
  const irisOut = interpolate(seconds, [HOLD_END, SKY_OUT_END], [IRIS_FULL, POCKET.r + 70], { ...clamp, easing: easeInOut });
  const iris = seconds < HOLD_END ? irisIn : irisOut;
  const pushIn = interpolate(seconds, [0, lastSecond], [1, 1.035], { ...clamp, easing: Easing.inOut(Easing.sin) });

  // --- whoosh impact: the halo swells into the cut, never a flash --------------
  const impact = interpolate(seconds, [CUT - 0.4, CUT, CUT + 0.55], [0, 1, 0], {
    ...clamp, easing: Easing.inOut(Easing.sin),
  });
  const haloOpacity = 0.14 + 0.12 * impact;
  const moonlight = 0.16 + 0.1 * impact;
  // Light → dark: the moon leaves the pocket in the overlay palette and is fully
  // dark before it reaches centre; it stays dark through the hold and the recede.
  const darken = interpolate(seconds, [0.45, HOLD_START - 0.25], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", opacity: skyOpacity }}>
        <defs>
          <radialGradient id="stinger-iris" gradientUnits="userSpaceOnUse" cx={x} cy={y} r={iris + IRIS_FEATHER}>
            <stop offset="0" stopColor="white" />
            <stop offset={`${(iris / (iris + IRIS_FEATHER)) * 100}%`} stopColor="white" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="stinger-iris-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={width} height={height}>
            <rect width={width} height={height} fill="url(#stinger-iris)" />
          </mask>
          <radialGradient id="stinger-night-sky" cx="50%" cy="45%" r="75%">
            <stop offset="0%" stopColor="#0E1E36" />
            <stop offset="45%" stopColor="#081430" />
            <stop offset="100%" stopColor="#03070F" />
          </radialGradient>
          <radialGradient id="stinger-moonlight" gradientUnits="userSpaceOnUse" cx={x} cy={y} r={radius * 3.4}>
            <stop offset="0%" stopColor="#78A0C8" stopOpacity={moonlight} />
            <stop offset="50%" stopColor="#466996" stopOpacity={moonlight * 0.45} />
            <stop offset="100%" stopColor="#466996" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g mask="url(#stinger-iris-mask)">
          <g transform={`translate(${width / 2} ${height / 2}) scale(${pushIn}) translate(${-width / 2} ${-height / 2})`}>
            <rect width={width} height={height} fill="url(#stinger-night-sky)" />
            <g>
              {STARS.map((st, i) => (
                <g key={i}>
                  {st.glow && <circle cx={st.x} cy={st.y} r={st.r * 3.2} fill="#CFE3F5" opacity={0.1} />}
                  <circle cx={st.x} cy={st.y} r={st.r} fill="#E8F1FA" opacity={st.o} />
                </g>
              ))}
            </g>
          </g>
          {/* moonlight follows the moon so the sky lifts near it and stays near-black at the corners */}
          <rect width={width} height={height} fill="url(#stinger-moonlight)" />
        </g>
      </svg>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", opacity: moonOpacity }}>
        <defs>
          <radialGradient id="lunar-surface" cx="34%" cy="28%">
            <stop offset="0%" stopColor="#71899E" />
            <stop offset="48%" stopColor="#596F85" />
            <stop offset="82%" stopColor="#40576E" />
            <stop offset="100%" stopColor="#2A4057" />
          </radialGradient>
          <radialGradient id="lunar-crater">
            <stop offset="0%" stopColor="#1F3449" stopOpacity="0.32" />
            <stop offset="60%" stopColor="#2C4660" stopOpacity="0.18" />
            <stop offset="85%" stopColor="#8EA7BD" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#2C4660" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="lunar-rim-light">
            <stop offset="58%" stopColor="#9DB9CE" stopOpacity="0" />
            <stop offset="100%" stopColor="#9DB9CE" stopOpacity="0.2" />
          </radialGradient>
          <radialGradient id="lunar-glow">
            <stop offset="0%" stopColor="#6FA3C4" stopOpacity="0.5" />
            <stop offset="45%" stopColor="#497991" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#497991" stopOpacity="0" />
          </radialGradient>
          {/* light (overlay) palette — same stops as wolf/Moon */}
          <radialGradient id="lunar-surface-light" cx="42%" cy="38%">
            <stop offset="0%" stopColor="#F4F8FF" />
            <stop offset="100%" stopColor="#C9D6EA" />
          </radialGradient>
          <radialGradient id="lunar-crater-light">
            <stop offset="0%" stopColor="#AEBEDA" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#AEBEDA" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="lunar-limb-light">
            <stop offset="0%" stopColor="rgba(9,21,51,0)" />
            <stop offset="68%" stopColor="rgba(9,21,51,0)" />
            <stop offset="100%" stopColor="rgba(9,21,51,0.26)" />
          </radialGradient>
          <radialGradient id="lunar-glow-light">
            <stop offset="0%" stopColor="rgba(0,172,237,0.45)" />
            <stop offset="55%" stopColor="rgba(0,172,237,0.12)" />
            <stop offset="100%" stopColor="rgba(0,172,237,0)" />
          </radialGradient>
          <filter id="lunar-halo" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
          <clipPath id="lunar-clip"><circle r="180" /></clipPath>
        </defs>
        <g transform={`translate(${x} ${y}) scale(${radius / 180})`}>
          {/* light moon (fades out on the way in) */}
          <g opacity={1 - darken}>
            <circle r="330" fill="url(#lunar-glow-light)" opacity={0.5 + 0.35 * impact} />
            <circle r="186" fill="#00ACED" opacity={0.16 + 0.12 * impact} filter="url(#lunar-halo)" />
            <circle r="180" fill="url(#lunar-surface-light)" />
            <g clipPath="url(#lunar-clip)">
              <ellipse cx="-50" cy="-22" rx="61" ry="47" fill="url(#lunar-crater-light)" />
              <ellipse cx="54" cy="14" rx="40" ry="31" fill="url(#lunar-crater-light)" />
              <circle cx="4" cy="86" r="23" fill="url(#lunar-crater-light)" />
              <circle cx="76" cy="-68" r="18" fill="url(#lunar-crater-light)" />
              <circle cx="22" cy="22" r="215" fill="url(#lunar-limb-light)" />
            </g>
          </g>
          {/* dark-mode moon (fades in on the way in) */}
          <g opacity={darken}>
          <circle r="330" fill="url(#lunar-glow)" opacity={haloOpacity} />
          <circle r="186" fill="#497991" opacity={0.16 + 0.12 * impact} filter="url(#lunar-halo)" />
          <circle r="180" fill="url(#lunar-surface)" stroke="#70A1BA" strokeOpacity="0.35" strokeWidth="1" />
          <g clipPath="url(#lunar-clip)">
            <ellipse cx="-62" cy="-48" rx="62" ry="42" fill="url(#lunar-crater)" />
            <ellipse cx="58" cy="28" rx="42" ry="30" fill="url(#lunar-crater)" />
            <circle cx="5" cy="78" r="23" fill="url(#lunar-crater)" />
            <circle cx="93" cy="-83" r="33" fill="url(#lunar-crater)" />
            <ellipse cx="-111" cy="91" rx="36" ry="24" fill="url(#lunar-crater)" />
            <circle cx="-4" cy="-125" r="21" fill="url(#lunar-crater)" />
            <g fill="url(#lunar-crater)">
              <circle cx="-103" cy="-8" r="20" />
              <circle cx="110" cy="-52" r="17" />
              <circle cx="82" cy="112" r="13" />
              <circle cx="-23" cy="42" r="11" />
            </g>
            <circle r="180" fill="url(#lunar-rim-light)" />
          </g>
          </g>
        </g>
      </svg>
      <StingerAudio />
    </AbsoluteFill>
  );
};
