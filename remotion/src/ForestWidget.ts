import type { CSSProperties } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

/** Shared moonlit glass; integer cycles keep long widget exports seamless. */
export const useForestWidget = (): CSSProperties => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const cycles = Math.max(1, Math.round(durationInFrames / (fps * 12)));
  const breath = (1 - Math.cos(2 * Math.PI * cycles * frame / durationInFrames)) / 2;
  return {
    background: "radial-gradient(ellipse at 100% 0%, rgba(139,200,225,0.13), transparent 55%), linear-gradient(180deg, rgba(12,30,54,0.94), rgba(5,15,32,0.97))",
    border: "1px solid rgba(220,239,252,0.3)",
    borderRadius: 28,
    boxShadow: `inset 0 1px 0 rgba(239,248,255,0.16), 0 10px 26px rgba(0,0,0,0.28), 0 0 ${10 + 6 * breath}px rgba(120,210,245,0.09)`,
  };
};
