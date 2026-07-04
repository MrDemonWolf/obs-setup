import { useCurrentFrame } from "remotion";
import { theme, radius, loopSin } from "./theme";
import { display, mono } from "./fonts";

// Fixed chip width so StartingSoon / BRB / EndingStream are all the SAME size
// (text left-aligned inside). Sized to fit the widest title ("The Pack Gathers")
// at 108px with the L/R padding below. If you add a longer title, bump this and
// re-check the mascot overlap (right-anchored wolf must clear the chip's right edge).
const CHIP_WIDTH = 1160;

const Dot: React.FC<{ color: string }> = ({ color }) => (
  <span style={{ width: 15, height: 15, borderRadius: radius.dot, background: color, display: "inline-block" }} />
);

// Frosted macOS-glass panel: window dots + rounded title + one techy mono
// status line, ending in a blinking terminal cursor.
export const TitleChip: React.FC<{ title: string; status: string }> = ({ title, status }) => {
  const frame = useCurrentFrame();
  const float = 6 * loopSin(frame);
  const scale = 1 + 0.006 * loopSin(frame, 0.2);
  const glow = 14 + 8 * (0.5 + 0.5 * loopSin(frame, 0.5));
  const liveDot = 0.45 + 0.55 * (0.5 + 0.5 * loopSin(frame, 0.3));
  const cursor = Math.floor(frame / 15) % 2 === 0; // blink ~every 0.5s @30fps

  return (
    <div
      style={{
        position: "absolute",
        left: 64,
        top: "34%",
        width: CHIP_WIDTH, // fixed → all three card scenes are the same size
        boxSizing: "border-box",
        transform: `translateY(${float}px) scale(${scale})`,
        transformOrigin: "left center",
        // roomy, even inner padding; text is left-aligned (block default)
        padding: "44px 64px 48px",
        borderRadius: radius.card,
        // lifted (more opaque, lighter navy) so the FULL rectangle reads against
        // the dark bg — otherwise the empty right side of a short-title box blends
        // into the background and the equal-width boxes look different sizes.
        background: "rgba(20, 38, 88, 0.90)",
        border: `1px solid rgba(255,255,255,0.22)`,
        boxShadow: `0 30px 80px rgba(0,0,0,0.45), inset 0 1px 0 ${theme.glassHi}, 0 0 ${glow}px rgba(0,172,237,0.28)`,
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
        <span style={{ opacity: cursor ? 1 : 0, color: theme.white }}>▊</span>
      </div>
    </div>
  );
};
