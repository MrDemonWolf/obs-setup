import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, radius, glassPanel, glassPanelShadow } from "./theme";
import { body } from "./fonts";
import { PawLoader } from "./PawLoader";
import { WindowDots } from "./WindowChrome";

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
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          padding: "52px 76px 40px",
          borderRadius: radius.card,
          // shared over-gameplay glass panel (dot grid + sheen + dense fill)
          background: glassPanel,
          border: `1px solid ${theme.glassBorder}`,
          boxShadow: glassPanelShadow(glow),
        }}
      >
        {/* window dots pinned to the top-left CORNER (matches Socials) — no domain
            tag, it's just a widget */}
        <div style={{ position: "absolute", top: 26, left: 30 }}>
          <WindowDots />
        </div>
        {/* 36 = the one status-label size everywhere; 0.75 white for small-player margin over gameplay */}
        <span style={{ fontFamily: body, fontSize: 30, letterSpacing: 8, color: "rgba(255,255,255,0.75)" }}>{label}</span>
        {/* fixed width + tabular figures: MM:SS never reflows as digits change */}
        <span
          style={{
            fontFamily: body,
            fontWeight: 700,
            fontSize: 132,
            lineHeight: 1,
            width: 490,
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
        <PawLoader count={4} size={24} gap={7} harmonic={1} />
      </div>
    </AbsoluteFill>
  );
};
