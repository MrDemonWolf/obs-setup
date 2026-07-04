import { AbsoluteFill, useCurrentFrame } from "remotion";
import { theme, radius, VIDEO, loopSin } from "./theme";
import { mono } from "./fonts";
import { PawLoader } from "./PawLoader";

// Standalone countdown card — render it out (transparent .mov) and drop it into
// OBS as its own media source. Counts `from` seconds down to 0 over the comp
// duration, then holds at 0.
//
// NOT a seamless loop (the one intentional exception to the loop invariant):
// set the OBS media source to play ONCE (loop OFF) and start it when you go
// live for a real countdown. Registered duration = `from`s, so re-render with
// --props='{"from":600}' AND a matching longer comp for other lengths.
export const Countdown: React.FC<{ from?: number; label?: string }> = ({ from = 300, label = "HOWLING IN" }) => {
  const frame = useCurrentFrame();
  const rem = Math.max(0, from - Math.floor(frame / VIDEO.fps));
  const mm = String(Math.floor(rem / 60)).padStart(2, "0");
  const ss = String(rem % 60).padStart(2, "0");
  const glow = 26 + 16 * (0.5 + 0.5 * loopSin(frame, 0.5));

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          padding: "48px 96px",
          borderRadius: radius.card,
          background: theme.glassFill,
          border: `1px solid ${theme.glassBorder}`,
          boxShadow: `0 30px 80px rgba(0,0,0,0.45), inset 0 1px 0 ${theme.glassHi}, 0 0 ${glow}px rgba(0,172,237,0.35)`,
        }}
      >
        <span style={{ fontFamily: mono, fontSize: 34, letterSpacing: 10, color: theme.textDim }}>{label}</span>
        {/* fixed width + tabular figures: MM:SS never reflows as digits change */}
        <span
          style={{
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 168,
            lineHeight: 1,
            width: 620,
            textAlign: "center",
            fontVariantNumeric: "tabular-nums",
            color: theme.white,
            letterSpacing: 4,
            textShadow: "0 3px 18px rgba(0,0,0,0.4)",
          }}
        >
          {mm}:{ss}
        </span>
        <PawLoader count={4} size={30} gap={9} />
      </div>
    </AbsoluteFill>
  );
};
