import { useCurrentFrame } from "remotion";
import { theme, radius, loopSin } from "./theme";

// Clean webcam placeholder: a soft rounded (or circular) border with a gentle
// breathing cerulean glow. Center stays transparent so the cam behind shows
// through. No brackets/labels — calm co-working look. Stack your OBS cam here.
// `phase` decorrelates the glow when several frames share a scene — identical
// phases pulse in lockstep and read mechanical (metronome effect).
export const CamFrame: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  shape?: "rect" | "circle";
  phase?: number;
}> = ({ x, y, w, h, shape = "rect", phase = 0.4 }) => {
  const f = useCurrentFrame();
  const glow = 22 + 10 * (0.5 + 0.5 * loopSin(f, phase)); // gentle, loop-safe
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: shape === "circle" ? "50%" : radius.card,
        border: `2px solid ${theme.blue}`,
        boxShadow: `0 0 ${glow}px rgba(0,172,237,0.35), inset 0 1px 0 ${theme.glassHi}`,
      }}
    />
  );
};
