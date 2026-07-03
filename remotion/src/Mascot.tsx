import { useState } from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { theme, radius, loopSin } from "./theme";
import { mono } from "./fonts";

// Brand mascot with a seamless idle bob/breathe/sway. `talking` swaps
// open/closed mouth on a slow cadence (deterministic → loop-safe). `anchor`
// pins it to the left or right, vertically centred (right-middle).
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

  // /8 divides 240 evenly → the mouth cadence lands exactly on the loop seam
  const activeSrc = talking ? (Math.floor(frame / 8) % 2 === 0 ? openSrc : closedSrc) : src;
  const side = anchor === "left" ? { left: 40 } : { right: 40 };
  // soft hover shadow: lower bob → closer → bigger/darker (loop-safe, same sin)
  const shadowScale = 1 + bob / 90;
  const shadowOp = 0.34 + bob / 110;

  return (
    <div style={{ position: "absolute", ...side, top: "50%", height: `${heightPct}%`, transform: "translateY(-50%)" }}>
      <div
        style={{
          position: "absolute",
          bottom: -34,
          left: "12%",
          width: "76%",
          height: 44,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(2,6,15,0.5) 0%, transparent 70%)",
          transform: `scale(${shadowScale}, 1)`,
          opacity: shadowOp,
        }}
      />
      <div
        style={{
          position: "relative",
          height: "100%",
          transform: `translateY(${bob}px) rotate(${sway}deg) scale(${breathe})`,
          transformOrigin: "center center",
          willChange: "transform",
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
