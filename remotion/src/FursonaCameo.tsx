import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Existing artwork peeks once per deterministic 72-second loop, away from widgets.
export const FursonaCameo: React.FC<{ src?: string }> = ({ src = "logo-main.svg" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const visibility = interpolate(time, [37, 38.2, 42.5, 43.8], [0, 1, 1, 0], clamp);
  const peek = visibility * visibility * (3 - 2 * visibility);
  const tilt = interpolate(time, [38.2, 39.3, 41.5, 42.5], [-12, 5, 5, -12], clamp);
  return <div style={{ position: "absolute", left: -245 + 205 * peek, top: 100,
    width: 220, height: 220, opacity: visibility, transform: `rotate(${tilt}deg)`,
    pointerEvents: "none", filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.55))",
  }}><Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "contain" }} /></div>;
};
