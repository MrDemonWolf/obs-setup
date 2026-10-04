import { AbsoluteFill } from "remotion";
import { Background } from "./Background";
import { CamFrame } from "./CamFrame";
import { ChatPanel } from "./ChatBoxFrame";
import { WidgetSlot } from "./WidgetSlot";

// Co-Working overlays: animated forest background + baked 16:9 cam frame(s).
// Dual can also show glass landing zones for the OBS widgets; Solo stays open.
// `moon` repositions the background moon into clear sky (the default sits
// inside the cam frames).
type Cam = { x: number; y: number; w: number; h: number };

export type CoworkProps = {
  cams: Cam[];
  moon?: { x?: number; y?: number; r?: number };
  showDualWidgets?: boolean;
};

export const COWORK_DUAL_WIDGETS = {
  chat: { x: 1280, y: 312, w: 576, h: 288 },
  timer: { x: 64, y: 826, w: 280, h: 190, label: "Timer" },
  tasks: { x: 364, y: 826, w: 500, h: 190, label: "Tasks" },
  nowPlaying: { x: 884, y: 826, w: 364, h: 190, label: "Now Playing" },
} as const;

export const Cowork: React.FC<CoworkProps> = ({ cams, moon, showDualWidgets = false }) => (
  <AbsoluteFill>
    <Background variant="forest" moon={moon} />
    {showDualWidgets && (
      <>
        <ChatPanel {...COWORK_DUAL_WIDGETS.chat} label="Chat" />
        <WidgetSlot {...COWORK_DUAL_WIDGETS.timer} />
        <WidgetSlot {...COWORK_DUAL_WIDGETS.tasks} />
        <WidgetSlot {...COWORK_DUAL_WIDGETS.nowPlaying} />
      </>
    )}
    {cams.map((c, i) => (
      // staggered glow phases — identical phases pulse in lockstep (metronome)
      <CamFrame key={i} {...c} phase={0.4 + i * 0.33} />
    ))}
  </AbsoluteFill>
);

// Both layouts share the same TOP-LEFT pin + margins for a consistent look:
// 64px left, 136 top (clears the moon at y36–180 — the heroes sit left of the
// right-side moon anyway; shared MOON_Y/MOON_R untouched per wolf/Moon.tsx).
// Nudged up from 200 to open a wider band along the BOTTOM for timer/tasks/
// chat widgets. Trade-off: main cam JUMPS size switching Solo↔Dual in OBS
// (used to match); accepted for bigger cams both ways.
// Solo: one hero, top-left pinned. Open right + (wider) bottom bands.
const SOLO_HERO: Cam = { x: 64, y: 136, w: 1400, h: 788 };
// Dual: second cam (576×324) pinned to the RIGHT, nudged up to match the
// hero's lift (x=1920-64-576=1280, y=628 → 92px above its old bottom-corner
// spot). The main hero ends at x1248, leaving 32px before the second cam; its
// lower widget row starts 24px below the hero.
const DUAL_HERO: Cam = { x: 64, y: 136, w: 1184, h: 666 };
const DUAL_SECOND: Cam = { x: 1280, y: 628, w: 576, h: 324 };
export const COWORK_LAYOUTS: Record<string, Cam[]> = {
  solo: [SOLO_HERO],
  dual: [DUAL_HERO, DUAL_SECOND],
};
