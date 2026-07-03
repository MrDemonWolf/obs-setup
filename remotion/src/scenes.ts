import type { FC } from "react";
import { Scene } from "./Scene";
import { StreamFrame } from "./StreamFrame";
import { CoworkSolo, CoworkDual } from "./CoworkFrame";
import { BackdropScene } from "./BackdropScene";
import { JustChattingScene } from "./JustChattingScene";
import { SocialsScene } from "./Socials";

// Single source of truth for every scene. `component` picks the layout.
// Card scenes take `mood` (hero / calm / ember). `width`/`height` override the
// default 1920×1080 (e.g. the standalone Socials badge for a GIF).
// `durationInFrames` overrides the default loop length (Socials runs longer so
// each handle is on screen ~5s).
export type SceneDef = {
  id: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- scenes have heterogeneous prop shapes
  component: FC<any>;
  width?: number;
  height?: number;
  durationInFrames?: number;
  props: Record<string, unknown>;
};

export const SCENES: SceneDef[] = [
  { id: "StartingSoon", label: "Starting Soon", component: Scene, props: { title: "The Pack Gathers", subtitle: "howling soon…", showMascot: true, mascotSrc: "logo-main.svg", mood: "hero" } },
  { id: "BRB", label: "Be Right Back", component: Scene, props: { title: "Off Hunting", subtitle: "brb · back on the trail", showMascot: true, mascotSrc: "logo-mouth-closed.svg", mood: "calm" } },
  { id: "JustChatting", label: "Just Chatting", component: JustChattingScene, props: {} },
  { id: "Streaming", label: "Streaming", component: StreamFrame, props: {} },
  { id: "CoworkingSolo", label: "Co-Working · Solo", component: CoworkSolo, props: {} },
  { id: "CoworkingDual", label: "Co-Working · Dual", component: CoworkDual, props: {} },
  { id: "EndingStream", label: "Ending Stream", component: Scene, props: { title: "Until Next Howl", subtitle: "thanks for running with the pack", showMascot: true, mascotSrc: "logo-mouth-closed.svg", mood: "ember" } },
  { id: "Background", label: "Background", component: BackdropScene, props: {} },
  { id: "Socials", label: "Socials (GIF)", component: SocialsScene, width: 760, height: 180, durationInFrames: 900, props: {} },
];
