import { body } from "./fonts";
import { Paw } from "./Paw";
import { radius, theme } from "./theme";

// Quiet, fixed-size landing area for the Howlbox browser source on standby cards.
// The chat source sits over the open body area; this frame supplies only the
// glass backing and a small label so chat content stays easy to read.
export const CHAT_BOX = { x: 64, y: 720, w: 640, h: 300 } as const;

export const ChatPanel: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
}> = ({ x, y, w, h, label = "Chat" }) => {
  const scale = w / CHAT_BOX.w;
  const headerHeight = Math.max(42, 48 * scale);

  return (
    <div
      aria-label={label}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        boxSizing: "border-box",
        overflow: "hidden",
        borderRadius: Math.max(14, radius.card * scale),
        border: "1px solid rgba(220, 239, 252, 0.34)",
        background: "linear-gradient(180deg, rgba(12, 30, 54, 0.78), rgba(5, 15, 32, 0.88))",
        boxShadow: "0 14px 42px rgba(0, 0, 0, 0.24), 0 0 16px rgba(0, 172, 237, 0.10)",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: headerHeight,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: 10 * scale,
          padding: `0 ${22 * scale}px`,
          borderBottom: "1px solid rgba(226, 241, 252, 0.14)",
          fontFamily: body,
          fontSize: Math.max(12, 17 * scale),
          fontWeight: 700,
          letterSpacing: 0.2 * scale,
          color: "rgba(239, 248, 255, 0.82)",
        }}
      >
        <Paw size={20 * scale} color={theme.pawWhite} opacity={0.9} />
        {label}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: headerHeight,
          bottom: 0,
          background: `linear-gradient(180deg, rgba(3, 12, 27, 0.08), ${theme.navyDeep}10)`,
        }}
      />
    </div>
  );
};

export const ChatBoxFrame: React.FC = () => <ChatPanel {...CHAT_BOX} />;
