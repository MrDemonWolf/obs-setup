import { useCurrentFrame } from "remotion";
import { Paw } from "../Paw";
import { VIDEO, theme } from "../theme";

// The Night Forest Walk signature: small off-white paw prints appear one by
// one across the lower trail, facing right. They all fade before the loop
// seam, leaving a quiet reset before the next walk begins.
export const PawTrail: React.FC<{
  count?: number;
  y?: number;
  maxOpacity?: number;
  xStart?: number;
  xEnd?: number;
}> = ({ count = 15, y = 946, maxOpacity = 0.3, xStart = 8, xEnd = 1820 }) => {
  const frame = useCurrentFrame();
  const progress = (frame % VIDEO.durationInFrames) / VIDEO.durationInFrames;
  const firstLanding = 0.08;
  const lastLanding = 0.64;
  const fadeIn = 0.035;
  const fadeOut = 0.09;

  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const x = xStart + (i * (xEnd - xStart)) / Math.max(1, count - 1);
        const landing = firstLanding + (i * (lastLanding - firstLanding)) / Math.max(1, count - 1);
        const age = progress - landing;
        const opacity = age < 0 || age > 0.16 + fadeOut
          ? 0
          : age < fadeIn
            ? (age / fadeIn) * maxOpacity
            : age < 0.16
              ? maxOpacity
              : maxOpacity * (1 - (age - 0.16) / fadeOut);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y + (i % 2 ? -20 : 16),
              transform: `rotate(${i % 2 ? 92 : 88}deg)`,
            }}
          >
            <Paw size={54} color={theme.pawWhite} opacity={opacity} />
          </div>
        );
      })}
    </>
  );
};
