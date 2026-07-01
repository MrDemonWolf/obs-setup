// Brand palette + macOS-glass tokens. "techwolf" = brand navy/cyan, rounded,
// frosted vibrancy, subtle tech grid.
export const theme = {
  navyTop: "#0E2350",
  navyDeep: "#081536",
  blue: "#2E97D6",
  blueBright: "#3AA9E8",
  white: "#FFFFFF",
  red: "#E0533D", // mascot jacket / traffic light
  amber: "#E6B34B",
  green: "#3ED598",
  // glass (macOS vibrancy)
  glassFill: "rgba(14, 35, 80, 0.66)",
  glassBorder: "rgba(255, 255, 255, 0.16)",
  glassHi: "rgba(255, 255, 255, 0.10)",
  grid: "rgba(58, 169, 232, 0.10)",
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

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// Seamless 0→1→0 triangle over the clip — for particle/paw brightness peaks.
export const loopTri = (frame: number, phase = 0) =>
  1 - Math.abs(2 * (((frame / VIDEO.durationInFrames) + phase) % 1) - 1);

export type BgVariant = "night" | "ember" | "minimal";
