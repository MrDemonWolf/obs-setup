import { Img, staticFile } from "remotion";
import { theme, radius } from "./theme";
import { display } from "./fonts";

// Slim glass title bar for the frame layouts (Streaming / Co-Working).
export const FrameBar: React.FC<{ x: number; y: number; w: number; title: string }> = ({ x, y, w, title }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: 84,
      display: "flex",
      alignItems: "center",
      gap: 20,
      padding: "0 24px",
      borderRadius: radius.card,
      background: theme.glassFill,
      border: `1px solid ${theme.glassBorder}`,
      boxShadow: `0 18px 44px rgba(0,0,0,0.4), inset 0 1px 0 ${theme.glassHi}`,
    }}
  >
    <Img src={staticFile("logo.svg")} style={{ height: 52, width: "auto" }} />
    <span style={{ fontFamily: display, fontWeight: 800, fontSize: 40, color: theme.white, letterSpacing: 0.5 }}>
      {title}
    </span>
  </div>
);
