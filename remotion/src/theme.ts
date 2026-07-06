// Brand palette + macOS-glass tokens. Wolf brand: Midnight #091533 (main) +
// Cerulean #00ACED (secondary accent) + Cornflower #6B8BF5 (tertiary tint).
export const theme = {
  navyTop: "#14265C", // lifted Midnight for the gradient top
  navyDeep: "#091533", // Midnight — main / base
  navyFloor: "#050B1F", // near-black floor for the 100% gradient stop
  blue: "#00ACED", // Cerulean — secondary accent
  blueBright: "#38C6F5", // bright Cerulean for glows/paws
  cornflower: "#6B8BF5", // Cornflower — tertiary tint
  white: "#FFFFFF",
  red: "#E0533D", // mascot jacket / traffic light
  amber: "#E6B34B",
  green: "#3ED598",
  // glass (macOS vibrancy)
  glassFill: "rgba(9, 21, 51, 0.66)",
  // denser glass for TRANSPARENT overlays that sit over live gameplay — 0.66
  // washes out over bright footage (secondary text drops below 3:1); 0.84 keeps
  // every text style ≥5:1 even over white. Use for Countdown/LoadingBarks/Socials.
  glassDense: "rgba(9, 21, 51, 0.84)",
  glassBorder: "rgba(255, 255, 255, 0.16)",
  glassHi: "rgba(255, 255, 255, 0.10)",
  grid: "rgba(0, 172, 237, 0.10)",
  textDim: "rgba(255, 255, 255, 0.62)",
} as const;

// macOS-ish rounded radii
export const radius = { card: 30, pill: 999, dot: 999 } as const;

// The Background's dot-grid as a single CSS background LAYER (46px tile, sized
// inline) so the transparent overlay cards (Countdown/LoadingBarks/Socials) can
// echo the same texture. Clipped to the card's border-radius automatically.
export const dotGridLayer = `radial-gradient(${theme.grid} 1.6px, transparent 1.6px) 0 0 / 46px 46px`;

// Diagonal light-from-above sheen — the layer that fakes macOS glass without
// backdrop-filter (banned, render cost). Shared by every glass card.
export const glassSheen = `linear-gradient(115deg, rgba(255,255,255,0.05) 0%, transparent 40%)`;

// Full over-gameplay glass panel background: dot grid + sheen + dense fill.
// The transparent overlays (Countdown/LoadingBarks/Socials) all use this so they
// read as the same little window as the card TitleChip.
export const glassPanel = `${dotGridLayer}, ${glassSheen}, ${theme.glassDense}`;

// Matching top bevel + soft depth shadow for those panels (pass a glow px).
export const glassPanelShadow = (glow: number) =>
  `0 30px 80px rgba(0,0,0,0.45), inset 0 1.5px 0 rgba(255,255,255,0.22), 0 0 ${glow}px rgba(0,172,237,0.28)`;

// 1080p, 8s seamless loop @30fps.
export const VIDEO = { fps: 30, width: 1920, height: 1080, durationInFrames: 240 } as const;

// Full-cycle period = whole clip → every sin()-driven motion returns to its
// start at the last frame → seamless loop for an OBS looped media source.
export const loopSin = (frame: number, phase = 0, harmonic = 1) =>
  Math.sin(2 * Math.PI * (harmonic * frame / VIDEO.durationInFrames + phase));

// A looping angle in radians for the current frame — sample noise along a
// circle with this to get organic-yet-seamless motion.
export const loopAngle = (frame: number) => (2 * Math.PI * frame) / VIDEO.durationInFrames;

// Smooth 0→1→0 "breathe" over the whole clip — eased in AND out at both ends
// (cosine: velocity is 0 at the rest point and at the peak, so it accelerates
// and decelerates instead of moving at constant speed). Rests at 0 on frame 0
// and the last frame → seamless loop. Use for a gentle grow-in-place pulse
// (scale only, no translation): `scale = 1 + amp * loopBreathe(frame)`.
export const loopBreathe = (frame: number, harmonic = 1) =>
  0.5 - 0.5 * Math.cos((2 * Math.PI * harmonic * frame) / VIDEO.durationInFrames);

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// Seamless 0→1→0 triangle over the clip — for particle/paw brightness peaks.
export const loopTri = (frame: number, phase = 0) =>
  1 - Math.abs(2 * (((frame / VIDEO.durationInFrames) + phase) % 1) - 1);

export type BgVariant = "night" | "minimal" | "glow";
