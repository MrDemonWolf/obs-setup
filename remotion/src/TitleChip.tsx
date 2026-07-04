import { useCurrentFrame } from "remotion";
import { theme, radius, loopSin } from "./theme";
import { display, mono } from "./fonts";
import { PawLoader } from "./PawLoader";

const Dot: React.FC<{ color: string }> = ({ color }) => (
  <span style={{ width: 15, height: 15, borderRadius: radius.dot, background: color, display: "inline-block" }} />
);

// Frosted macOS-glass panel: window dots + rounded title + one techy mono
// status line (replaces the old subtitle sentence).
export const TitleChip: React.FC<{ title: string; status: string; loader?: boolean }> = ({ title, status, loader = false }) => {
  const frame = useCurrentFrame();
  const float = 6 * loopSin(frame);
  const scale = 1 + 0.006 * loopSin(frame, 0.2);
  const glow = 26 + 16 * (0.5 + 0.5 * loopSin(frame, 0.5));
  const liveDot = 0.45 + 0.55 * (0.5 + 0.5 * loopSin(frame, 0.3));
  const cursor = Math.floor(frame / 15) % 2 === 0;

  return (
    <div
      style={{
        position: "absolute",
        left: 64,
        top: "34%",
        // No fixed width — the box hugs its content (the title is the widest
        // row), so the left-aligned text gets equal padding on both sides. Box
        // width naturally varies per title; that's intended.
        transform: `translateY(${float}px) scale(${scale})`,
        transformOrigin: "left center",
        // roomy, even inner padding so nothing hugs the edges
        padding: "44px 64px 48px",
        borderRadius: radius.card,
        background: theme.glassFill,
        border: `1px solid ${theme.glassBorder}`,
        boxShadow: `0 30px 80px rgba(0,0,0,0.45), inset 0 1px 0 ${theme.glassHi}, 0 0 ${glow}px rgba(0,172,237,0.35)`,
      }}
    >
      {/* window traffic lights + tag */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
        <Dot color={theme.red} />
        <Dot color={theme.amber} />
        <Dot color={theme.green} />
        <span style={{ marginLeft: 14, fontFamily: mono, fontSize: 24, color: theme.textDim, letterSpacing: 1.5 }}>
          mrdemonwolf.com
        </span>
      </div>

      <div
        style={{
          fontFamily: display,
          fontWeight: 800,
          fontSize: 108,
          lineHeight: 1,
          whiteSpace: "nowrap",
          color: theme.white,
          letterSpacing: 1,
          textShadow: "0 3px 18px rgba(0,0,0,0.35)",
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 20,
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: mono,
          fontSize: 36,
          color: theme.blueBright,
        }}
      >
        <span style={{ width: 13, height: 13, borderRadius: radius.dot, background: theme.green, opacity: liveDot }} />
        <span>{status}</span>
        {loader ? (
          <PawLoader size={26} count={4} gap={7} />
        ) : (
          <span style={{ opacity: cursor ? 1 : 0, color: theme.white }}>▊</span>
        )}
      </div>
    </div>
  );
};
