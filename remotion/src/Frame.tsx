import { useCurrentFrame } from "remotion";
import { theme, radius, loopSin } from "./theme";
import { body } from "./fonts";

// A transparent placeholder region for an OBS source (screen / webcam), drawn
// as a rounded targeting frame with tech corner brackets. Center stays
// transparent so the source behind shows through in an alpha render.
const Bracket: React.FC<{ corner: "tl" | "tr" | "bl" | "br"; c: string }> = ({ corner, c }) => {
  const s = 36;
  const t = 4;
  const base: React.CSSProperties = { position: "absolute", width: s, height: s, borderColor: c, borderStyle: "solid" };
  const map: Record<string, React.CSSProperties> = {
    tl: { top: -2, left: -2, borderWidth: `${t}px 0 0 ${t}px`, borderTopLeftRadius: radius.card },
    tr: { top: -2, right: -2, borderWidth: `${t}px ${t}px 0 0`, borderTopRightRadius: radius.card },
    bl: { bottom: -2, left: -2, borderWidth: `0 0 ${t}px ${t}px`, borderBottomLeftRadius: radius.card },
    br: { bottom: -2, right: -2, borderWidth: `0 ${t}px ${t}px 0`, borderBottomRightRadius: radius.card },
  };
  return <div style={{ ...base, ...map[corner] }} />;
};

export const Frame: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  guides?: boolean;
  live?: boolean;
  accent?: string;
}> = ({ x, y, w, h, label, guides, live, accent = theme.blue }) => {
  const frame = useCurrentFrame();
  const glow = 16 + 12 * (0.5 + 0.5 * loopSin(frame, 0.4));
  const liveDot = 0.4 + 0.6 * (0.5 + 0.5 * loopSin(frame, 0.3));

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: radius.card,
        border: `1.5px solid ${accent}`,
        boxShadow: `0 0 ${glow}px rgba(0,172,237,0.45), inset 0 0 0 1px rgba(255,255,255,0.06)`,
      }}
    >
      <Bracket corner="tl" c={accent} />
      <Bracket corner="tr" c={accent} />
      <Bracket corner="bl" c={accent} />
      <Bracket corner="br" c={accent} />

      {guides && (
        <span
          style={{
            position: "absolute",
            top: 14,
            left: 16,
            fontFamily: body,
            fontSize: 20,
            letterSpacing: 2,
            color: theme.white,
            background: "rgba(8,21,54,0.6)",
            padding: "4px 12px",
            borderRadius: radius.pill,
            border: `1px solid ${theme.glassBorder}`,
          }}
        >
          {label}
        </span>
      )}

      {live && (
        <span
          style={{
            position: "absolute",
            top: 14,
            right: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: body,
            fontSize: 18,
            color: theme.white,
            background: "rgba(224,83,61,0.22)",
            padding: "4px 12px",
            borderRadius: radius.pill,
            border: "1px solid rgba(224,83,61,0.55)",
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: radius.dot, background: theme.red, opacity: liveDot }} />
          LIVE
        </span>
      )}
    </div>
  );
};
