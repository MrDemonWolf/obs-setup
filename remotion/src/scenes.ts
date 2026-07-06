import type { FC } from "react";
import { Scene } from "./Scene";
import { StreamFrame } from "./StreamFrame";
import { Cowork, COWORK_LAYOUTS } from "./CoworkFrame";
import { BackdropScene } from "./BackdropScene";
import { JustChattingScene } from "./JustChattingScene";
import { SocialsScene, SOCIALS_DURATION } from "./Socials";
import { Countdown } from "./Countdown";
import { LoadingBarks, LOADING_BARKS_DURATION, LOADING_BARKS_FPS } from "./LoadingBarks";

// Single source of truth for every scene. `component` picks the layout.
// `width`/`height` override the
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
  fps?: number; // overrides VIDEO.fps for this comp (Countdown/LoadingBarks run 60)
  durationInFrames?: number;
  props: Record<string, unknown>;
};

export const SCENES: SceneDef[] = [
  { id: "StartingSoon", label: "Starting Soon", component: Scene, props: { title: "The Pack Gathers", subtitle: "howling soon…", showMascot: true, mascotSrc: "logo-main.svg" } },
  { id: "BRB", label: "Be Right Back", component: Scene, props: { title: "Off Hunting", subtitle: "brb · back on the trail", showMascot: true, mascotSrc: "logo-mouth-closed.svg" } },
  { id: "JustChatting", label: "Just Chatting", component: JustChattingScene, props: {} },
  { id: "JustChattingVtuber", label: "Just Chatting · VTuber", component: JustChattingScene, props: { hideCam: true } },
  { id: "Streaming", label: "Streaming", component: StreamFrame, props: {} },
  // moon repositioned into clear sky per layout — the default (300,200,r92)
  // sits inside/behind the cam frames, where the live feed clips it in OBS.
  { id: "CoworkingSolo", label: "Co-Working · Solo", component: Cowork, props: { cams: COWORK_LAYOUTS.solo, moon: { x: 1568 } } },
  { id: "CoworkingDual", label: "Co-Working · Dual", component: Cowork, props: { cams: COWORK_LAYOUTS.dual, moon: { x: 1568 } } },
  { id: "EndingStream", label: "Ending Stream", component: Scene, props: { title: "Until Next Howl", subtitle: "thanks for running with the pack", showMascot: true, mascotSrc: "logo-mouth-closed.svg" } },
  { id: "Background", label: "Background", component: BackdropScene, props: {} },
  { id: "Socials", label: "Socials (GIF)", component: SocialsScene, width: 760, height: 180, durationInFrames: SOCIALS_DURATION, props: {} },
  // Transparent standalone timer — full-frame (chip centered) so it's a drop-in
  // OBS overlay with no repositioning + the previewer stage never reshapes.
  // 60fps for smooth motion. durationInFrames = (from + 1) × fps — the +1s is
  // the held 00:00 frame (at from×fps the last frame still reads 00:01).
  // NOT in render:all (heavy).
  { id: "Countdown", label: "Countdown (5:00)", component: Countdown, fps: 60, durationInFrames: (300 + 1) * 60, props: { from: 300 } },
  // Transparent full-frame overlay — fake wolf-pun loading bar. Seeded schedule
  // (each phrase 20–40s, bar creeps to ~95%); duration = sum of holds (~4 min).
  // 60fps; LOADING_BARKS_DURATION is computed at LOADING_BARKS_FPS so they match.
  { id: "LoadingBarks", label: "Loading Barks", component: LoadingBarks, fps: LOADING_BARKS_FPS, durationInFrames: LOADING_BARKS_DURATION, props: {} },
];
