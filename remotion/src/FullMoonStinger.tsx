import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Paw } from "./Paw";
import { STINGER_SFX_DELAY_FRAMES } from "./Stinger";

/** The opaque lunar disc covers every corner before the 2000ms OBS cut. */
export const FullMoonStinger: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const seconds = frame / fps;
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const arrive = interpolate(seconds, [0.1, 1.65], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const dissolve = interpolate(seconds, [2.65, 3.85], [1, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const visible = interpolate(seconds, [0, 0.18], [0, 1], clamp) * dissolve;
  const radius = 72 + arrive * (Math.hypot(width, height) / 2 + 120 - 72);
  const x = interpolate(arrive, [0, 1], [1568, width / 2]);
  const y = interpolate(arrive, [0, 1], [108, height / 2]);
  const mist = interpolate(seconds, [2.5, 2.95, 3.98], [0, 0.4, 0], clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", opacity: visible }}>
        <defs>
          <radialGradient id="lunar-navy" cx="34%" cy="28%">
            <stop offset="0%" stopColor="#214665" />
            <stop offset="58%" stopColor="#102b49" />
            <stop offset="100%" stopColor="#091533" />
          </radialGradient>
          <radialGradient id="lunar-crater">
            <stop offset="0%" stopColor="#8cdcf5" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#8cdcf5" stopOpacity="0" />
          </radialGradient>
          <filter id="lunar-halo" x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
        </defs>
        <g transform={`translate(${x} ${y}) scale(${radius / 180})`}>
          <circle r="184" fill="#00ACED" opacity="0.3" filter="url(#lunar-halo)" />
          <circle r="180" fill="url(#lunar-navy)" stroke="#72D9F7" strokeWidth="3" />
          <ellipse cx="-62" cy="-48" rx="62" ry="42" fill="url(#lunar-crater)" />
          <ellipse cx="58" cy="28" rx="42" ry="30" fill="url(#lunar-crater)" />
          <circle cx="5" cy="78" r="23" fill="url(#lunar-crater)" />
          <Paw x={-74} y={-56} size={148} color="#00ACED" opacity={0.96} />
        </g>
      </svg>
      {[0, 1, 2].map((i) => (
        <AbsoluteFill key={i} style={{
          opacity: mist,
          transform: `translateX(${(seconds - 2.5) * (100 + i * 70)}px)`,
          background: `radial-gradient(ellipse at ${20 + i * 30}% ${35 + i * 20}%, rgba(185,219,235,0.65), transparent 65%)`,
        }} />
      ))}
      <Sequence from={STINGER_SFX_DELAY_FRAMES}>
        <Audio src={staticFile("stinger.wav")} />
      </Sequence>
    </AbsoluteFill>
  );
};
