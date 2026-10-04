import type { FC } from "react";
import { Scene } from "./Scene";
import { Cowork, COWORK_LAYOUTS } from "./CoworkFrame";
import { BackdropScene } from "./BackdropScene";
import { JustChattingScene } from "./JustChattingScene";
import { SocialsScene, SOCIALS_DURATION, SOCIALS_HEIGHT, SOCIALS_WIDTH } from "./Socials";
import { Countdown } from "./Countdown";
import { LoadingBarks, LOADING_BARKS_DURATION, LOADING_BARKS_FPS } from "./LoadingBarks";
import { Stinger, STINGER_FPS, STINGER_DURATION } from "./Stinger";
import { DeskForeground } from "./DeskForeground";
import { CabinBackground } from "./CabinBackground";
import { CoffeeBackground } from "./CoffeeBackground";

// Single source of truth for every scene. `component` picks the layout.
// `width`/`height` override the default 1920×1080 for compact alpha widgets.
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
  { id: "StartingSoon", label: "Starting Soon", component: Scene, durationInFrames: 2160, props: { title: "The Den Opens Soon", titleLines: ["The Den", "Opens Soon"], subtitle: "Grab a drink. The pack will be live shortly.", showMascot: false, showChatBox: true } },
  { id: "BRB", label: "Be Right Back", component: Scene, durationInFrames: 2160, props: { title: "A Moment Off the Trail", titleLines: ["A Moment", "Off the Trail"], subtitle: "Stretch your paws. I’ll be right back.", showMascot: false, showChatBox: true } },
  { id: "JustChatting", label: "Just Chatting", component: JustChattingScene, props: {} },
  { id: "JustChattingVtuber", label: "Just Chatting · VTuber", component: JustChattingScene, props: { hideCam: true } },
  // moon parked RIGHT (only x passed; shared MOON_Y/MOON_R) — at the default
  // x=300 it sits inside/behind the cam frames, where the live feed clips it.
  { id: "CoworkingSolo", label: "Co-Working · Solo", component: Cowork, props: { cams: COWORK_LAYOUTS.solo, moon: { x: 1568 } } },
  { id: "CoworkingDual", label: "Co-Working · Dual", component: Cowork, props: { cams: COWORK_LAYOUTS.dual, moon: { x: 1568 } } },
  { id: "EndingStream", label: "Ending Stream", component: Scene, durationInFrames: 4500, props: { title: "Until the Next Howl", titleLines: ["Until the", "Next Howl"], holdTitle: true, subtitle: "Thanks for spending time with the pack.", showMascot: false, showChatBox: false } },
  { id: "Background", label: "Background", component: BackdropScene, props: {} },
  { id: "CoffeeBackground", label: "Coffee Cabin · Full Background", component: CoffeeBackground, props: {} },
  { id: "CabinBackground", label: "Coffee Cabin · Background Only (split layers)", component: CabinBackground, props: {} },
  { id: "DeskForeground", label: "Desk + Coffee (transparent)", component: DeskForeground, durationInFrames: 240, props: {} },
  // Transparent widget outputs stay close to the visible glass panels so OBS
  // source bounds are easy to place; the preview centers them on the 1080p stage.
  { id: "Socials", label: "Socials (GIF)", component: SocialsScene, width: SOCIALS_WIDTH, height: SOCIALS_HEIGHT, durationInFrames: SOCIALS_DURATION, props: {} },
  // Countdown panel includes room for its soft glass shadow; place it where wanted.
  // 60fps for smooth motion. durationInFrames = (from + 1) × fps — the +1s is
  // the held 00:00 frame (at from×fps the last frame still reads 00:01).
  // NOT in render:all (heavy).
  { id: "Countdown", label: "Countdown (5:00)", component: Countdown, width: 820, height: 500, fps: 60, durationInFrames: (300 + 1) * 60, props: { from: 300 } },
  { id: "Countdown10", label: "Countdown (10:00)", component: Countdown, width: 820, height: 500, fps: 60, durationInFrames: (600 + 1) * 60, props: { from: 600 } },
  // Transparent panel-sized glass status card with ten wolf-tech joke pairs.
  // Seeded schedule (each phrase 20–40s; bar fills to 100%); duration ~4.7 min.
  // 60fps; LOADING_BARKS_DURATION is computed at LOADING_BARKS_FPS so they match.
  { id: "LoadingBarks", label: "Loading Barks", component: LoadingBarks, width: 1080, height: 420, fps: LOADING_BARKS_FPS, durationInFrames: LOADING_BARKS_DURATION, props: {} },
  // OBS stinger transition (Paw Swipe). Transparent full-frame, 60fps, plays
  // ONCE (not a loop) — like Countdown, kept out of render:all.
  { id: "Stinger", label: "Stinger", component: Stinger, fps: STINGER_FPS, durationInFrames: STINGER_DURATION, props: {} },
];
