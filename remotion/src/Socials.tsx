import { useState } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { theme, VIDEO, dotGridLayer } from "./theme";
import { display } from "./fonts";

const items = [
  { b: "twitch", h: "/MrDemonWolf" },
  { b: "x", h: "@MrDemonWolf" },
  { b: "youtube", h: "@MrDemonWolf" },
  { b: "instagram", h: "@MrDemonWolf" },
  { b: "github", h: "nathanialhenniges" },
  { b: "discord", h: "mrdwolf.net/discord" },
];

// Seeded schedule (computed once, loop-safe): each handle is on screen a random
// 15–30s. Duration = sum of holds → exported for the composition registration.
const FPS = VIDEO.fps;
const lcg = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const rand = lcg(20260630);
const HOLDS = items.map(() => Math.round((15 + rand() * 15) * FPS)); // frames per handle (15–30s)
const STARTS: number[] = [];
HOLDS.reduce((acc, h) => (STARTS.push(acc), acc + h), 0);
export const SOCIALS_DURATION = HOLDS.reduce((a, h) => a + h, 0);

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
// start and end of each handle's slot, so the loop point is invisible. Each
// handle holds a random 15–30s (seeded schedule above).
export const SocialFade: React.FC<{ size?: number }> = ({ size = 44 }) => {
  const f = useCurrentFrame() % SOCIALS_DURATION;
  let idx = 0;
  for (let k = 0; k < items.length; k++) if (f >= STARTS[k]) idx = k;
  const local = (f - STARTS[idx]) / HOLDS[idx]; // 0..1 through this handle's slot
  // 0 lands exactly ON the slot boundary (loop seam stays invisible) — the old
  // [0, .08, .9, .96] stops left the card visibly EMPTY ~1s at every swap and
  // took ~2s to fade in. Now: ~0.6s in, content holds to 97%, ~0.6s out.
  const op = interpolate(local, [0, 0.03, 0.97, 1], [0, 1, 1, 0], { extrapolateRight: "clamp" });
  const it = items[idx];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, width: "100%", height: "100%", opacity: op }}>
      <BrandLogo b={it.b} size={size} />
      <span style={{ fontFamily: display, fontWeight: 700, fontSize: size * 0.82, color: theme.white, whiteSpace: "nowrap" }}>{it.h}</span>
    </div>
  );
};

// Standalone composition for GIF export — transparent background + a rounded
// glass card (macOS corners, not a pill). Render: npx remotion render Socials …
export const SocialsScene: React.FC = () => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "88%",
        height: "62%",
        borderRadius: 16, // macOS window-style corners (30 read too round on a short badge)
        // dense backing (contrast over gameplay + clean GIF alpha edge) + shared dot-grid texture
        background: `${dotGridLayer}, ${theme.glassDense}`,
        border: `1px solid ${theme.glassBorder}`,
      }}
    >
      <SocialFade />
    </div>
  </AbsoluteFill>
);
