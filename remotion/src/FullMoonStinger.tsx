import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Moon } from "./wolf/Moon";
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
      <AbsoluteFill style={{ opacity: visible, transformOrigin: "960px 540px", transform: `translate(${x - 960}px, ${y - 540}px) scale(${radius / 180})` }}>
        <Moon x={960} y={540} r={180} />
      </AbsoluteFill>
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
