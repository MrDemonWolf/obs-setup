import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { StingerAudio } from "./StingerAudio";
import { Starfield } from "./wolf/Starfield";

/** The night sky fully covers the scene swap while the moon stays in view. */
export const FullMoonStinger: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const arrive = interpolate(seconds, [0.1, 1.65], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const recede = interpolate(seconds, [2.6, 3.85], [1, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const travel = seconds < 2.6 ? arrive : recede;
  const visible = interpolate(seconds, [0, 0.18, 3.82, (durationInFrames - 1) / fps], [0, 1, 1, 0], clamp);
  // The opaque sky holds through the cut; the moon never becomes a bright full-screen wash.
  const skyOpacity = interpolate(seconds, [0.25, 1.65, 2.6, 3.85], [0, 1, 1, 0], {
    ...clamp, easing: Easing.inOut(Easing.cubic),
  });
  const radius = 72 + travel * 218;
  const x = interpolate(travel, [0, 1], [1568, width / 2]);
  const y = interpolate(travel, [0, 1], [108, height / 2]);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{
        opacity: skyOpacity,
        background: "radial-gradient(ellipse at 50% 45%, #10233B 0%, #091533 48%, #030915 100%)",
      }}>
        <AbsoluteFill style={{ opacity: 0.45 }}><Starfield maxY={height} /></AbsoluteFill>
      </AbsoluteFill>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", opacity: visible }}>
        <defs>
          <radialGradient id="lunar-surface" cx="34%" cy="28%">
            <stop offset="0%" stopColor="#60798F" />
            <stop offset="48%" stopColor="#4B627A" />
            <stop offset="82%" stopColor="#344B64" />
            <stop offset="100%" stopColor="#20354E" />
          </radialGradient>
          <radialGradient id="lunar-crater">
            <stop offset="0%" stopColor="#203850" stopOpacity="0.5" />
            <stop offset="62%" stopColor="#304C64" stopOpacity="0.3" />
            <stop offset="82%" stopColor="#9BB1C7" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#304C64" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="lunar-rim-light">
            <stop offset="55%" stopColor="#9DB9CE" stopOpacity="0" />
            <stop offset="100%" stopColor="#9DB9CE" stopOpacity="0.16" />
          </radialGradient>
          <filter id="lunar-halo" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
          <clipPath id="lunar-clip"><circle r="180" /></clipPath>
        </defs>
        <g transform={`translate(${x} ${y}) scale(${radius / 180})`}>
          <circle r="184" fill="#497991" opacity="0.12" filter="url(#lunar-halo)" />
          <circle r="180" fill="url(#lunar-surface)" stroke="#70A1BA" strokeOpacity="0.3" strokeWidth="1" />
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
      </svg>
      <StingerAudio />
    </AbsoluteFill>
  );
};
