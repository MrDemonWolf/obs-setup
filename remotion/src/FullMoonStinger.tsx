import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Paw } from "./Paw";
import { PawSwipeBackend, StingerAudio } from "./Stinger";

/** The opaque lunar disc covers every corner before the 2000ms OBS cut. */
export const FullMoonStinger: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const seconds = frame / fps;
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const arrive = interpolate(seconds, [0.1, 1.65], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const recede = interpolate(seconds, [2.6, 3.85], [1, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const travel = seconds < 2.6 ? arrive : recede;
  const visible = interpolate(seconds, [0, 0.18, 3.82, 4], [0, 1, 1, 0], clamp);
  // Grow just past the canvas diagonal: this completely covers the corners
  // while leaving a readable sliver of the moon's circular edge at the cut.
  const radius = 72 + travel * (Math.hypot(width, height) / 2 + 28 - 72);
  const x = interpolate(travel, [0, 1], [1568, width / 2]);
  const y = interpolate(travel, [0, 1], [108, height / 2]);
  const mist = interpolate(seconds, [2.5, 2.95, 3.98], [0, 0.4, 0], clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <PawSwipeBackend />
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", opacity: visible }}>
        <defs>
          <radialGradient id="lunar-surface" cx="34%" cy="28%">
            <stop offset="0%" stopColor="#71899E" />
            <stop offset="48%" stopColor="#596F85" />
            <stop offset="82%" stopColor="#40576E" />
            <stop offset="100%" stopColor="#2A4057" />
          </radialGradient>
          <radialGradient id="lunar-crater">
            <stop offset="0%" stopColor="#203850" stopOpacity="0.6" />
            <stop offset="68%" stopColor="#304C64" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#304C64" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="lunar-rim-light">
            <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="100%" stopColor="#ECF7FC" stopOpacity="0.42" />
          </radialGradient>
          <filter id="lunar-halo" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
          <clipPath id="lunar-clip"><circle r="180" /></clipPath>
        </defs>
        <g transform={`translate(${x} ${y}) scale(${radius / 180})`}>
          <circle r="184" fill="#00ACED" opacity="0.12" filter="url(#lunar-halo)" />
          <circle r="180" fill="url(#lunar-surface)" stroke="#70BBD4" strokeOpacity="0.6" strokeWidth="1.5" />
          <g clipPath="url(#lunar-clip)">
            <ellipse cx="-62" cy="-48" rx="62" ry="42" fill="url(#lunar-crater)" />
            <ellipse cx="58" cy="28" rx="42" ry="30" fill="url(#lunar-crater)" />
            <circle cx="5" cy="78" r="23" fill="url(#lunar-crater)" />
            <circle cx="93" cy="-83" r="33" fill="url(#lunar-crater)" />
            <ellipse cx="-111" cy="91" rx="36" ry="24" fill="url(#lunar-crater)" />
            <circle cx="-4" cy="-125" r="21" fill="url(#lunar-crater)" />
            <g fill="url(#lunar-crater)" stroke="#263F57" strokeOpacity="0.32" strokeWidth="2">
              <circle cx="-103" cy="-8" r="20" />
              <circle cx="110" cy="-52" r="17" />
              <circle cx="82" cy="112" r="13" />
              <circle cx="-23" cy="42" r="11" />
            </g>
            <circle r="180" fill="url(#lunar-rim-light)" />
            <Paw x={-45} y={-34} size={90} color="#091533" stroke="#00ACED" strokeWidth={0.9} opacity={0.94} />
          </g>
        </g>
      </svg>
      {[0, 1, 2].map((i) => (
        <AbsoluteFill key={i} style={{
          opacity: mist,
          transform: `translateX(${(seconds - 2.5) * (100 + i * 70)}px)`,
          background: `radial-gradient(ellipse at ${20 + i * 30}% ${35 + i * 20}%, rgba(185,219,235,0.65), transparent 65%)`,
        }} />
      ))}
      <StingerAudio />
    </AbsoluteFill>
  );
};
