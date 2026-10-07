import { Audio, Sequence, staticFile } from "remotion";

// Shared OBS stinger timing and original whoosh cue. The active moon transition
// and the preserved paw-swipe backup use the same measured audio placement.
export const STINGER_FPS = 60;
export const STINGER_SECONDS = 4;
export const STINGER_DURATION = Math.round(STINGER_SECONDS * STINGER_FPS);
export const STINGER_COVER = 0.5;
export const STINGER_POINT_MS = Math.round(STINGER_COVER * STINGER_SECONDS * 1000);
export const STINGER_SFX_PEAK_MS = 170;
export const STINGER_SFX_DELAY_FRAMES = Math.max(
  0,
  Math.round(((STINGER_POINT_MS - STINGER_SFX_PEAK_MS) * STINGER_FPS) / 1000),
);

export const StingerAudio: React.FC = () => (
  <Sequence from={STINGER_SFX_DELAY_FRAMES}>
    <Audio src={staticFile("stinger.wav")} />
  </Sequence>
);
