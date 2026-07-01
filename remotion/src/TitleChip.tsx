import { useCurrentFrame } from "remotion";
import { theme, radius, loopSin } from "./theme";
import { display, mono } from "./fonts";

const Dot: React.FC<{ color: string }> = ({ color }) => (
  <span style={{ width: 15, height: 15, borderRadius: radius.dot, background: color, display: "inline-block" }} />
);

// Frosted macOS-glass panel: window dots + rounded title + one techy mono
// status line (replaces the old subtitle sentence).
export const TitleChip: React.FC<{ title: string; status: string }> = ({ title, status }) => {
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
        left: 110,
        top: "34%",
        transform: `translateY(${float}px) scale(${scale})`,
        transformOrigin: "left center",
        padding: "34px 52px 38px",
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
        <span style={{ marginLeft: 14, fontFamily: mono, fontSize: 18, color: theme.textDim, letterSpacing: 1 }}>
          mrdemonwolf.com
        </span>
      </div>

      <div
        style={{
          fontFamily: display,
          fontWeight: 800,
          fontSize: 108,
          lineHeight: 1,
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
          fontSize: 30,
          color: theme.blueBright,
        }}
      >
        <span style={{ width: 13, height: 13, borderRadius: radius.dot, background: theme.green, opacity: liveDot }} />
        <span>{status}</span>
        <span style={{ opacity: cursor ? 1 : 0, color: theme.white }}>▊</span>
      </div>
    </div>
  );
};
