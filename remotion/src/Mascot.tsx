import { useState } from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { theme, radius, loopSin } from "./theme";
import { mono } from "./fonts";

// Brand mascot with a seamless idle bob/breathe/sway. `talking` swaps
// open/closed mouth on a slow cadence (deterministic → loop-safe). `anchor`
// pins it bottom-left or bottom-right.
export const Mascot: React.FC<{
  src?: string;
  heightPct?: number;
  anchor?: "left" | "right";
  talking?: boolean;
  openSrc?: string;
  closedSrc?: string;
}> = ({ src = "logo-main.svg", heightPct = 82, anchor = "right", talking = false, openSrc = "logo-main.svg", closedSrc = "logo-mouth-closed.svg" }) => {
  const frame = useCurrentFrame();
  const [ok, setOk] = useState(true);

  const bob = 14 * loopSin(frame);
  const breathe = 1 + 0.008 * loopSin(frame, 0.15);
  const sway = 0.6 * loopSin(frame, 0.4);

  const activeSrc = talking ? (Math.floor(frame / 9) % 2 === 0 ? openSrc : closedSrc) : src;
  const side = anchor === "left" ? { left: 120 } : { right: 120 };

  return (
    <div style={{ position: "absolute", ...side, bottom: 0, height: `${heightPct}%` }}>
      <div
        style={{
          position: "relative",
          height: "100%",
          transform: `translateY(${bob}px) rotate(${sway}deg) scale(${breathe})`,
          transformOrigin: "bottom center",
        }}
      >
        {ok ? (
          <Img src={staticFile(activeSrc)} onError={() => setOk(false)} style={{ height: "100%", width: "auto" }} />
        ) : (
          <div
            style={{
              height: "100%",
              width: 360,
              border: `3px dashed ${theme.blue}`,
              borderRadius: radius.card,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.blue,
              fontFamily: mono,
              fontSize: 22,
              textAlign: "center",
              opacity: 0.7,
            }}
          >
            drop public/{activeSrc}
          </div>
        )}
      </div>
    </div>
  );
};
