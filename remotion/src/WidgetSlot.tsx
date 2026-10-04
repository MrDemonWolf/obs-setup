import { body } from "./fonts";
import { Paw } from "./Paw";
import { theme } from "./theme";

export type WidgetSlotRect = { x: number; y: number; w: number; h: number; label: string };

// A quiet glass landing zone for an OBS browser widget. The OBS source goes
// above the scene overlay; this gives each widget a consistent, readable home.
export const WidgetSlot: React.FC<WidgetSlotRect> = ({ x, y, w, h, label }) => (
  <div
    aria-label={`${label} widget area`}
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      boxSizing: "border-box",
      overflow: "hidden",
      borderRadius: 24,
      border: "1px solid rgba(203, 232, 248, 0.25)",
      background: "linear-gradient(155deg, rgba(18, 39, 65, 0.78), rgba(5, 15, 32, 0.78))",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 10px 28px rgba(0,0,0,0.18)",
      pointerEvents: "none",
    }}
  >
    <div
      style={{
        height: 42,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 16px",
        boxSizing: "border-box",
        borderBottom: "1px solid rgba(226, 241, 252, 0.12)",
        color: "rgba(239, 248, 255, 0.76)",
        fontFamily: body,
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: 1.2,
        textTransform: "uppercase",
      }}
    >
      <Paw size={16} color={theme.pawWhite} opacity={0.76} />
      {label}
    </div>
  </div>
);
