import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Paw } from "./Paw";

type AlertKind = "follow" | "subscribe" | "bits" | "gift";

const EVENT: Record<AlertKind, { source: string; color: string; duration: number }> = {
  follow: { source: "follow", color: "#00ACED", duration: 297 },
  subscribe: { source: "sub-bits", color: "#FF4D5A", duration: 172 },
  bits: { source: "sub-bits", color: "#38C6F5", duration: 172 },
  gift: { source: "gifted-sub", color: "#6B8BF5", duration: 432 },
};

type PawBeat = { start: number; x: number; y: number; dx: number; dy: number; rotate: number };

// Keep the extra motion to the clear edges so the existing 3D performance stays readable.
const PAW_BEATS: Record<AlertKind, PawBeat[]> = {
  follow: [
    { start: 8, x: 58, y: 184, dx: 8, dy: -16, rotate: -14 },
    { start: 82, x: 416, y: 190, dx: -8, dy: -18, rotate: 16 },
    { start: 170, x: 58, y: 202, dx: 10, dy: -16, rotate: -12 },
    { start: 250, x: 416, y: 204, dx: -9, dy: -17, rotate: 14 },
  ],
  subscribe: [
    { start: 8, x: 54, y: 191, dx: 10, dy: -17, rotate: -14 },
    { start: 48, x: 420, y: 190, dx: -9, dy: -18, rotate: 14 },
    { start: 100, x: 58, y: 202, dx: 8, dy: -16, rotate: -12 },
    { start: 144, x: 416, y: 202, dx: -8, dy: -16, rotate: 12 },
  ],
  bits: [
    { start: 8, x: 54, y: 191, dx: 10, dy: -17, rotate: -14 },
    { start: 48, x: 420, y: 190, dx: -9, dy: -18, rotate: 14 },
    { start: 100, x: 58, y: 202, dx: 8, dy: -16, rotate: -12 },
    { start: 144, x: 416, y: 202, dx: -8, dy: -16, rotate: 12 },
  ],
  gift: [
    { start: 8, x: 450, y: 232, dx: -5, dy: -16, rotate: 12 },
    { start: 118, x: 450, y: 200, dx: -5, dy: -16, rotate: -12 },
    { start: 232, x: 450, y: 168, dx: -5, dy: -16, rotate: 14 },
    { start: 344, x: 450, y: 136, dx: -5, dy: -16, rotate: -14 },
  ],
};

const PawStep: React.FC<{ frame: number; beat: PawBeat; color: string }> = ({ frame, beat, color }) => {
  const progress = interpolate(frame - beat.start, [0, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = interpolate(progress, [0, 0.12, 0.72, 1], [0, 0.68, 0.42, 0]);
  const scale = interpolate(progress, [0, 0.18, 1], [0.55, 1, 0.86]);
  return (
    <div
      style={{
        position: "absolute",
        left: beat.x + beat.dx * progress,
        top: beat.y + beat.dy * progress,
        opacity,
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${beat.rotate}deg)`,
        filter: `drop-shadow(0 0 8px ${color}66)`,
      }}
    >
      <Paw size={34} color={color} />
    </div>
  );
};

export const AlertAnimation: React.FC<{ kind: AlertKind }> = ({ kind }) => {
  const frame = useCurrentFrame();
  const event = EVENT[kind];
  const pawBeats = PAW_BEATS[kind];

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "transparent" }}>
      <Img
        src={staticFile(`alerts/source/${event.source}/${String(frame).padStart(4, "0")}.png`)}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
      />
      {pawBeats.map((beat, index) => (
        <PawStep key={`${beat.start}-${index}`} frame={frame} beat={beat} color={event.color} />
      ))}
    </AbsoluteFill>
  );
};

export const ALERT_DURATION: Record<AlertKind, number> = Object.fromEntries(Object.entries(EVENT).map(([kind, event]) => [kind, event.duration])) as Record<AlertKind, number>;
