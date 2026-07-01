import { AbsoluteFill } from "remotion";
import { Background } from "./Background";
import { theme, radius } from "./theme";
import { mono } from "./fonts";

const box = (fill: string): React.CSSProperties => ({
  position: "absolute",
  borderRadius: radius.card,
  background: fill,
  border: `1px solid ${theme.glassBorder}`,
  boxShadow: `0 18px 44px rgba(0,0,0,0.4), inset 0 1px 0 ${theme.glassHi}`,
});

const Header: React.FC<{ label: string }> = ({ label }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "16px 20px",
      fontFamily: mono,
      fontSize: 20,
      fontWeight: 600,
      letterSpacing: 2,
      color: theme.blueBright,
    }}
  >
    <span style={{ width: 9, height: 9, borderRadius: radius.dot, background: theme.blueBright }} />
    {label}
  </div>
);

// Clean layout for embedding: webcam frame + an empty chat panel. Drop your
// real cam + chat sources over the two boxes.
export const JustChattingScene: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: theme.navyDeep }}>
    <Background variant="night" />
    <div style={{ ...box("rgba(14,35,80,0.5)"), left: 40, top: 40, width: 1160, height: 1000, border: `3px solid ${theme.blueBright}` }} />
    <div style={{ ...box("rgba(14,35,80,0.55)"), left: 1240, top: 40, width: 640, height: 1000 }}>
      <Header label="CHAT" />
    </div>
  </AbsoluteFill>
);
