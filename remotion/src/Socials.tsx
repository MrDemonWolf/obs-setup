import { useState } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, radius } from "./theme";
import { display } from "./fonts";

const items = [
  { b: "twitch", h: "/MrDemonWolf" },
  { b: "x", h: "@MrDemonWolf" },
  { b: "youtube", h: "@MrDemonWolf" },
  { b: "instagram", h: "@MrDemonWolf" },
  { b: "github", h: "nathanialhenniges" },
  { b: "discord", h: "mrdwolf.net/discord" },
];

const BrandLogo: React.FC<{ b: string; size?: number }> = ({ b, size = 40 }) => {
  const [ok, setOk] = useState(true);
  if (!ok) return <span style={{ fontFamily: display, fontSize: size * 0.7, color: theme.blueBright, textTransform: "uppercase" }}>{b}</span>;
  // No recolor filter — logos render in their real brand colors (the old
  // brightness(0) invert(1) flattened multi-color marks like Twitch to a blob).
  return (
    <Img
      src={staticFile(`brands/${b}.svg`)}
      onError={() => setOk(false)}
      style={{ height: size, width: "auto", opacity: 0.97 }}
    />
  );
};

// One platform at a time, fading in and out. Seamless: opacity is 0 at both the
// start and end of each item's slot, so the loop point is invisible. Slot size
// comes from the actual comp duration (Socials runs longer so handles are
// readable — ~5s each).
export const SocialFade: React.FC<{ size?: number }> = ({ size = 44 }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const n = items.length;
  const slot = durationInFrames / n;
  const idx = Math.floor(f / slot) % n;
  const local = (f % slot) / slot;
  // reach 0 by 0.96 — the last frame of a slot is truly invisible, no swap pop
  const op = interpolate(local, [0, 0.14, 0.84, 0.96], [0, 1, 1, 0], { extrapolateRight: "clamp" });
  const it = items[idx];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, width: "100%", height: "100%", opacity: op }}>
      <BrandLogo b={it.b} size={size} />
      <span style={{ fontFamily: display, fontWeight: 700, fontSize: size * 0.82, color: theme.white, whiteSpace: "nowrap" }}>{it.h}</span>
    </div>
  );
};

// Standalone composition for GIF export — transparent background + a rounded
// glass pill. Render: npx remotion render Socials out/socials.gif --codec=gif
export const SocialsScene: React.FC = () => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "88%",
        height: "62%",
        borderRadius: radius.pill,
        background: "rgba(9,21,51,0.84)", // denser than glassFill: contrast over gameplay + clean GIF alpha edge
        border: `1px solid ${theme.glassBorder}`,
      }}
    >
      <SocialFade />
    </div>
  </AbsoluteFill>
);
