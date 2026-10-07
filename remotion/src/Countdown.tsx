import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "./theme";
import { lounge as body } from "./fonts";
import { PawLoader } from "./PawLoader";
import { useForestWidget } from "./ForestWidget";

// Standalone countdown card — render it out (transparent .mov) and drop it into
// OBS as its own media source. Counts `from` seconds down to 0 over the comp
// duration, then holds at 0.
//
// NOT a seamless loop (the one intentional exception to the loop invariant):
// set the OBS media source to play ONCE (loop OFF) and start it when you go
// live for a real countdown. Registered duration = (`from`+1)s — the extra
// second is the held 00:00 frame (at exactly from×fps the last frame still
// reads 00:01). The repo registers both 5:00 and 10:00 variants with matching
// durations; any added length also needs a composition of (`from`+1)×fps frames.
export const Countdown: React.FC<{ from?: number; label?: string }> = ({ from = 300, label = "THE DEN OPENS IN" }) => {
  const surface = useForestWidget();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rem = Math.max(0, from - Math.floor(frame / fps));
  const mm = String(Math.floor(rem / 60)).padStart(2, "0");
  const ss = String(rem % 60).padStart(2, "0");

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          width: 660,
          boxSizing: "border-box",
          padding: "44px 60px 38px",
          ...surface,
        }}
      >
        <span style={{ fontFamily: body, fontWeight: 500, fontSize: 24, letterSpacing: 3, color: "rgba(228,244,252,0.82)" }}>{label}</span>
        {/* fixed width + tabular figures: MM:SS never reflows as digits change */}
        <span
          style={{
            fontFamily: body,
            fontWeight: 800,
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
        <PawLoader count={4} size={24} gap={12} harmonic={1} color={theme.pawWhite} />
      </div>
    </AbsoluteFill>
  );
};
