import { lounge } from "./fonts";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// Forest Lounge: open typography, with room below for independent OBS widgets.
export const TitleChip: React.FC<{ title: string; status: string }> = ({ title, status }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = (frame / fps) % 24;
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const exit = interpolate(time, [21, 23], [0, 1], clamp);
  const support = interpolate(time, [0.9, 1.8, 21, 23], [0, 1, 1, 0], clamp);
  const sweep = interpolate(time, [8, 10], [-35, 135], clamp);
  // A subtle accent breath accompanies each masked title sequence.
  const breath = (1 - Math.cos((time / 24) * Math.PI * 2)) / 2;
  return (
  <div style={{ position: "absolute", left: 96, top: 344, width: 1000,
    transform: `translateY(${-5 * breath}px)`,
  }}>
    <div style={{ width: 64 + 32 * breath, height: 2, marginBottom: 30,
      background: "rgba(196,230,245,0.65)", boxShadow: "0 0 18px rgba(120,210,245,0.18)",
    }} />
    <div style={{
      fontFamily: lounge, fontWeight: 800, fontSize: 104,
      lineHeight: 1.12, color: "#f4f9fc", letterSpacing: -3,
      maxWidth: 980, display: "flex", flexWrap: "wrap", columnGap: 24,
      textShadow: `0 4px 24px rgba(0,0,0,0.65), 0 0 ${12 + 8 * breath}px rgba(185,225,245,0.08)`,
    }} aria-label={title}>{title.split(" ").map((word, index) => {
      const progress = interpolate(time, [0.12 + index * 0.14, 0.85 + index * 0.14], [0, 1], clamp);
      const enter = 1 - Math.pow(1 - progress, 3);
      return <span key={index} style={{ overflow: "hidden", paddingBottom: 10 }}>
        <span style={{ display: "block", position: "relative", opacity: enter * (1 - exit),
          transform: `translateY(${(1 - enter) * 110 - exit * 110}%)`,
        }}>{word}<span aria-hidden style={{ position: "absolute", inset: 0, color: "transparent", textShadow: "none",
          backgroundClip: "text", WebkitBackgroundClip: "text",
          backgroundImage: `linear-gradient(110deg, transparent ${sweep - 15}%, #7bdcff ${sweep}%, transparent ${sweep + 15}%)`,
        }}>{word}</span></span>
      </span>;
    })}</div>
    <div style={{
      marginTop: 28, maxWidth: 820, fontFamily: lounge, fontSize: 32,
      fontWeight: 500, letterSpacing: 0.15, opacity: support,
      transform: `translateY(${(1 - support) * 16}px)`,
      lineHeight: 1.55, color: "rgba(228,244,252,0.88)",
      textShadow: "0 2px 12px rgba(0,0,0,0.8)",
    }}>{status}</div>
  </div>
  );
};
