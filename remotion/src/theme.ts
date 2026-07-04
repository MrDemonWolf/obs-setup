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
  glassBorder: "rgba(255, 255, 255, 0.16)",
  glassHi: "rgba(255, 255, 255, 0.10)",
  grid: "rgba(0, 172, 237, 0.10)",
  textDim: "rgba(255, 255, 255, 0.62)",
} as const;

// macOS-ish rounded radii
export const radius = { card: 30, pill: 999, dot: 999 } as const;

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

export type BgVariant = "night" | "ember" | "minimal" | "glow";
