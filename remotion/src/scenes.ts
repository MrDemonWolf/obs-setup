import type { FC } from "react";
import { Scene } from "./Scene";
import { StreamFrame } from "./StreamFrame";
import { Cowork, COWORK_LAYOUTS } from "./CoworkFrame";
import { BackdropScene } from "./BackdropScene";
import { JustChattingScene } from "./JustChattingScene";
import { SocialsScene, SOCIALS_DURATION } from "./Socials";
import { Countdown } from "./Countdown";
import { LoadingBarks, LOADING_BARKS_DURATION } from "./LoadingBarks";

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
  { id: "StartingSoon", label: "Starting Soon", component: Scene, props: { title: "The Pack Gathers", subtitle: "howling soon…", showMascot: true, mascotSrc: "logo-main.svg", mood: "hero", loader: true } },
  { id: "BRB", label: "Be Right Back", component: Scene, props: { title: "Off Hunting", subtitle: "brb · back on the trail", showMascot: true, mascotSrc: "logo-mouth-closed.svg", mood: "calm", loader: true } },
  { id: "JustChatting", label: "Just Chatting", component: JustChattingScene, props: {} },
  { id: "JustChattingVtuber", label: "Just Chatting · VTuber", component: JustChattingScene, props: { hideCam: true } },
  { id: "Streaming", label: "Streaming", component: StreamFrame, props: {} },
  { id: "CoworkingSolo", label: "Co-Working · Solo", component: Cowork, props: { cams: COWORK_LAYOUTS.solo } },
  { id: "CoworkingDual", label: "Co-Working · Dual", component: Cowork, props: { cams: COWORK_LAYOUTS.dual } },
  { id: "EndingStream", label: "Ending Stream", component: Scene, props: { title: "Until Next Howl", subtitle: "thanks for running with the pack", showMascot: true, mascotSrc: "logo-mouth-closed.svg", mood: "ember" } },
  { id: "Background", label: "Background", component: BackdropScene, props: {} },
  { id: "Socials", label: "Socials (GIF)", component: SocialsScene, width: 760, height: 180, durationInFrames: SOCIALS_DURATION, props: {} },
  // Transparent standalone timer — full-frame (chip centered) so it's a drop-in
  // OBS overlay with no repositioning + the previewer stage never reshapes.
  // durationInFrames = from × fps (300s × 30). NOT in render:all (heavy).
  { id: "Countdown", label: "Countdown (5:00)", component: Countdown, durationInFrames: 9000, props: { from: 300 } },
  // Transparent full-frame overlay — fake wolf-pun loading bar. Seeded schedule
  // (each phrase 20–40s, bar creeps to ~95%); duration = sum of holds (~4 min).
  { id: "LoadingBarks", label: "Loading Barks", component: LoadingBarks, durationInFrames: LOADING_BARKS_DURATION, props: {} },
];
