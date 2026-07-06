import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, radius, dotGridLayer } from "./theme";
import { body } from "./fonts";
import { PawLoader } from "./PawLoader";

// Standalone countdown card — render it out (transparent .mov) and drop it into
// OBS as its own media source. Counts `from` seconds down to 0 over the comp
// duration, then holds at 0.
//
// NOT a seamless loop (the one intentional exception to the loop invariant):
// set the OBS media source to play ONCE (loop OFF) and start it when you go
// live for a real countdown. Registered duration = (`from`+1)s — the extra
// second is the held 00:00 frame (at exactly from×fps the last frame still
// reads 00:01). Re-render with --props='{"from":600}' AND a matching longer
// comp for other lengths.
export const Countdown: React.FC<{ from?: number; label?: string }> = ({ from = 300, label = "HOWLING IN" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rem = Math.max(0, from - Math.floor(frame / fps));
  const mm = String(Math.floor(rem / 60)).padStart(2, "0");
  const ss = String(rem % 60).padStart(2, "0");
  // 8s glow period at ANY fps (loopSin's 240-frame period = 4s at this comp's
  // 60fps — twice the rate every 30fps scene breathes at). Non-looping comp, so
  // no seam constraint — just match the house cadence.
  const glow = 14 + 8 * (0.5 + 0.5 * Math.sin(2 * Math.PI * (frame / (8 * fps) + 0.5)));

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
          // dense backing (over live gameplay) + the shared dot-grid texture
          background: `${dotGridLayer}, ${theme.glassDense}`,
          border: `1px solid ${theme.glassBorder}`,
          boxShadow: `0 30px 80px rgba(0,0,0,0.45), inset 0 1px 0 ${theme.glassHi}, 0 0 ${glow}px rgba(0,172,237,0.28)`,
        }}
      >
        {/* 36 = the one status-label size everywhere; 0.75 white for small-player margin over gameplay */}
        <span style={{ fontFamily: body, fontSize: 36, letterSpacing: 10, color: "rgba(255,255,255,0.75)" }}>{label}</span>
        {/* fixed width + tabular figures: MM:SS never reflows as digits change */}
        <span
          style={{
            fontFamily: body,
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
        {/* harmonic 1: loopSin's 240f period = 4s at 60fps, matching the 30fps scenes' harmonic-2 sweep */}
        <PawLoader count={4} size={30} gap={9} harmonic={1} />
      </div>
    </AbsoluteFill>
  );
};
