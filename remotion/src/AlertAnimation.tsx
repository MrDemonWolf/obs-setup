import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

type AlertKind = "follow" | "subscribe" | "bits" | "gift";

const EVENT: Record<AlertKind, { source: string; color: string; duration: number }> = {
  follow: { source: "follow", color: "#00ACED", duration: 297 },
  subscribe: { source: "sub-bits", color: "#FF4D5A", duration: 172 },
  bits: { source: "sub-bits", color: "#38C6F5", duration: 172 },
  gift: { source: "gifted-sub", color: "#6B8BF5", duration: 432 },
};

const PARTICLES = Array.from({ length: 18 }, (_, index) => {
  const angle = (index * 137.5 * Math.PI) / 180;
  const radius = 48 + ((index * 29) % 70);
  return { angle, radius, size: 3 + (index % 4), delay: (index * 7) % 28 };
});

const burst = (frame: number, start: number, span = 44) => {
  const progress = interpolate(frame - start, [0, span], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return {
    progress,
    opacity: interpolate(progress, [0, 0.16, 0.82, 1], [0, 0.9, 0.6, 0], { extrapolateRight: "clamp" }),
  };
};

const Ring: React.FC<{ frame: number; start: number; color: string; x: number; delay?: number }> = ({ frame, start, color, x, delay = 0 }) => {
  const { progress, opacity } = burst(frame, start + delay, 52);
  const scale = interpolate(progress, [0, 1], [0.55, 1.45]);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: "54%",
        width: 48,
        height: 48,
        border: `3px solid ${color}`,
        borderRadius: "50%",
        opacity,
        transform: `translate(-50%, -50%) scale(${scale})`,
        boxShadow: `0 0 18px ${color}88, inset 0 0 14px ${color}55`,
      }}
    />
  );
};

const Star: React.FC<{ frame: number; start: number; index: number; color: string }> = ({ frame, start, index, color }) => {
  const particle = PARTICLES[index];
  const progress = interpolate(frame - start - particle.delay, [0, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = interpolate(progress, [0, 0.15, 0.8, 1], [0, 0.95, 0.7, 0], { extrapolateRight: "clamp" });
  const radius = 120 + particle.radius * 0.26 + progress * (32 + (index % 4) * 8);
  const x = 240 + Math.cos(particle.angle) * radius;
  const y = 138 + Math.sin(particle.angle) * radius * 0.5;
  const rotate = progress * 160 * (index % 2 ? 1 : -1);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: particle.size,
        height: particle.size,
        borderRadius: index % 3 === 0 ? 1 : "50%",
        background: color,
        opacity,
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${0.5 + progress})`,
        boxShadow: `0 0 10px ${color}`,
      }}
    />
  );
};

export const AlertAnimation: React.FC<{ kind: AlertKind }> = ({ kind }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const event = EVENT[kind];
  const first = burst(frame, 8, 46);
  const second = burst(frame, kind === "gift" ? 186 : 86, 46);
  const glow = 0.16 + 0.22 * Math.max(first.opacity, second.opacity);
  const cycle = (frame / durationInFrames) * Math.PI * 2;
  const hover = Math.sin(cycle * 2) * 3;
  const breathe = 1 + ((1 - Math.cos(cycle * 2)) / 2) * 0.018;
  const rings = kind === "follow" ? [8, 62, 154] : kind === "gift" ? [8, 84, 186, 304] : [8, 58, 116];
  const stars = kind === "gift" ? 18 : 12;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "transparent" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 58%, ${event.color}${Math.round(glow * 255).toString(16).padStart(2, "0")} 0%, transparent 58%)` }} />
      {rings.map((start, index) => <Ring key={`left-${start}-${index}`} frame={frame} start={start} color={event.color} x={44} delay={index * 10} />)}
      {rings.map((start, index) => <Ring key={`right-${start}-${index}`} frame={frame} start={start + 12} color={event.color} x={436} delay={index * 10} />)}
      <AbsoluteFill style={{ transform: `translateY(${hover}px) scale(${breathe})`, transformOrigin: "center 55%" }}>
        <Img
          src={staticFile(`alerts/source/${event.source}/${String(frame).padStart(4, "0")}.png`)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
        />
      </AbsoluteFill>
      {Array.from({ length: stars }, (_, index) => (
        <Star key={index} frame={frame} start={8 + (index % 3) * 16 + (kind === "gift" ? 180 : 0)} index={index} color={index % 4 === 0 ? "#FFFFFF" : event.color} />
      ))}
      {kind === "bits" && [0, 1, 2].map((index) => {
        const phase = frame / fps + index * (Math.PI * 2 / 3);
        const x = 240 + Math.cos(phase * 1.1) * 116;
        const y = 134 + Math.sin(phase) * 66;
        return <div key={index} style={{ position: "absolute", left: x, top: y, width: 14, height: 14, border: "2px solid #BDF4FF", borderRadius: "50%", background: "#00ACED99", boxShadow: "0 0 14px #00ACED", transform: `translate(-50%, -50%) scale(${0.78 + 0.22 * Math.sin(phase * 2)})` }} />;
      })}
    </AbsoluteFill>
  );
};

export const ALERT_DURATION: Record<AlertKind, number> = Object.fromEntries(Object.entries(EVENT).map(([kind, event]) => [kind, event.duration])) as Record<AlertKind, number>;
